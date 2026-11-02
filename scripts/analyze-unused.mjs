import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const walk = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    );
const files = walk(path.join(root, "src")).filter((file) =>
  /\.[cm]?[jt]sx?$/.test(file),
);
const config = ts.readConfigFile(
  path.join(root, "tsconfig.json"),
  ts.sys.readFile,
);
const options = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  root,
).options;
const graph = new Map();
const packages = new Set();
for (const file of files) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const dependencies = [];
  const visit = (node) => {
    let specifier;
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
    )
      specifier = node.moduleSpecifier.text;
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        node.expression.getText(source) === "require") &&
      ts.isStringLiteral(node.arguments[0])
    )
      specifier = node.arguments[0].text;
    if (specifier) {
      const resolved = ts.resolveModuleName(
        specifier,
        file,
        options,
        ts.sys,
      ).resolvedModule;
      if (resolved && !resolved.isExternalLibraryImport)
        dependencies.push(path.resolve(resolved.resolvedFileName));
      if (!specifier.startsWith(".") && !specifier.startsWith("@/"))
        dependencies.push(
          "package:" +
            (specifier.startsWith("@")
              ? specifier.split("/").slice(0, 2).join("/")
              : specifier.split("/")[0]),
        );
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  graph.set(file, dependencies);
}
const visited = new Set();
function traverse(file) {
  if (file.startsWith("package:")) {
    packages.add(file.slice(8));
    return;
  }
  if (visited.has(file)) return;
  visited.add(file);
  for (const dependency of graph.get(file) || []) traverse(dependency);
}
const entries = files.filter(
  (file) =>
    /[\\/]app[\\/]/.test(file) &&
    /[\\/](?:page|layout|route|not-found|error|global-error|loading|template|default|opengraph-image|twitter-image|icon|apple-icon|sitemap|robots)\.[jt]sx?$/.test(
      file,
    ),
);
entries.forEach(traverse);
const unused = files
  .filter((file) => !visited.has(file) && !file.endsWith(".d.ts"))
  .map((file) => path.relative(root, file).replaceAll("\\", "/"));
const manifest = JSON.parse(fs.readFileSync("package.json", "utf8"));
// Consumed outside browser imports by TypeScript, Sass, Tailwind and logo tooling.
const buildAndTooling = new Set(["react-dom", "sass", "react-icons"]);
console.log(
  JSON.stringify(
    {
      entries: entries.length,
      unusedModules: unused,
      unreferencedRuntimePackages: Object.keys(manifest.dependencies)
        .filter((name) => !packages.has(name) && !buildAndTooling.has(name))
        .sort(),
    },
    null,
    2,
  ),
);
