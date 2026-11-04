import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import postcss from "postcss";

const root = process.cwd();
const read = (file) => fs.readFileSync(file, "utf8");
const relative = (file) => path.relative(root, file).replaceAll("\\", "/");
const walk = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    );
const sourceFiles = walk(path.resolve("src"));
const modules = sourceFiles.filter((file) => /\.[jt]sx?$/.test(file));
const stylesheets = sourceFiles.filter((file) => /\.css$/.test(file));
const tooling = [
  ...walk(path.resolve("scripts")),
  ...walk(path.resolve("tests")),
  ...fs
    .readdirSync(root)
    .filter((name) => /config\.(mjs|ts)$/.test(name))
    .map((name) => path.join(root, name)),
].filter((file) => /\.(mjs|ts)$/.test(file));
const manifest = JSON.parse(read("package.json"));
const config = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const options = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  root,
).options;
const graph = new Map();
const styleOwners = new Map();
const unresolvedImports = [];

for (const file of [...modules, ...tooling]) {
  const source = ts.createSourceFile(
    file,
    read(file),
    ts.ScriptTarget.Latest,
    true,
  );
  const dependencies = [];
  function visit(node) {
    let specifier;
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
    )
      specifier = node.moduleSpecifier.text;
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      ts.isStringLiteral(node.arguments[0])
    )
      specifier = node.arguments[0].text;
    if (specifier) {
      if (!specifier.startsWith(".") && !specifier.startsWith("@/")) {
        if (!specifier.startsWith("node:"))
          dependencies.push(
            "package:" +
              (specifier.startsWith("@")
                ? specifier.split("/").slice(0, 2).join("/")
                : specifier.split("/")[0]),
          );
      } else if (specifier.endsWith(".css")) {
        const stylesheet = path.resolve(path.dirname(file), specifier);
        dependencies.push(stylesheet);
        if (!fs.existsSync(stylesheet))
          unresolvedImports.push(`${relative(file)}: ${specifier}`);
        const owners = styleOwners.get(stylesheet) || [];
        owners.push(file);
        styleOwners.set(stylesheet, owners);
      } else if (/\.(webp|png|jpe?g|avif|svg)$/.test(specifier)) {
        const asset = specifier.startsWith("@/")
          ? path.resolve("src", specifier.slice(2))
          : path.resolve(path.dirname(file), specifier);
        dependencies.push(asset);
        if (!fs.existsSync(asset))
          unresolvedImports.push(`${relative(file)}: ${specifier}`);
      } else {
        const resolved = ts.resolveModuleName(
          specifier,
          file,
          options,
          ts.sys,
        ).resolvedModule;
        if (resolved)
          dependencies.push(path.resolve(resolved.resolvedFileName));
        else unresolvedImports.push(`${relative(file)}: ${specifier}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  graph.set(file, dependencies);
}

const visited = new Set();
const packages = new Set();
function visitDependency(file) {
  if (file.startsWith("package:")) {
    packages.add(file.slice(8));
    return;
  }
  if (visited.has(file)) return;
  visited.add(file);
  for (const dependency of graph.get(file) || []) visitDependency(dependency);
}
const entries = modules.filter(
  (file) =>
    /[\\/]app[\\/]/.test(file) &&
    /[\\/](page|layout|route|not-found|error|loading|template|opengraph-image|icon|robots|sitemap)\.[jt]sx?$/.test(
      file,
    ),
);
[...entries, ...tooling].forEach(visitDependency);

// React's renderer and the CSS pipeline are loaded by Next rather than app imports.
["react-dom", "postcss", "tailwindcss"].forEach((name) => packages.add(name));
if (
  Object.values(manifest.scripts).some((command) =>
    /\bprettier\b/.test(command),
  )
)
  packages.add("prettier");
for (const name of Object.keys(manifest.devDependencies)) {
  if (
    name.startsWith("@types/") &&
    (name === "@types/node" || packages.has(name.slice(7)))
  )
    packages.add(name);
}

// Public paths in components/data, plus logo filenames combined with /assets/stack/.
const referencedAssets = new Set();
for (const file of [...modules, ...stylesheets]) {
  for (const match of read(file).matchAll(
    /["'`](\/(?:assets\/[^"'`$]+|terminal\.svg|[^/"'`$]+\.pdf))["'`]/g,
  ))
    referencedAssets.add(match[1].slice(1));
}
for (const match of read("src/data/stack-artwork.ts").matchAll(
  /file:\s*"([^"]+)"/g,
))
  referencedAssets.add("assets/stack/" + match[1]);
const publicFiles = walk(path.resolve("public"));
// These documents record the origin of vendored artwork and project screenshots.
const assetMetadata = new Set([
  "assets/stack/sources.json",
  "assets/projects/sources.json",
]);
const unusedAssets = publicFiles
  .map((file) =>
    path.relative(path.resolve("public"), file).replaceAll("\\", "/"),
  )
  .filter((file) => !referencedAssets.has(file) && !assetMetadata.has(file));
unusedAssets.push(
  ...sourceFiles
    .filter(
      (file) => /\.(webp|png|jpe?g|avif|svg)$/.test(file) && !visited.has(file),
    )
    .map(relative),
);
const missingAssets = [...referencedAssets].filter(
  (file) => !fs.existsSync(path.join(root, "public", file)),
);

const unusedCssClasses = [];
for (const file of stylesheets.filter((file) => file.endsWith(".module.css"))) {
  const owners = (styleOwners.get(file) || []).map(read).join("\n");
  const used = new Set(
    [...owners.matchAll(/styles\.(\w+)/g)].map((match) => match[1]),
  );
  const defined = new Set();
  postcss.parse(read(file)).walkRules((rule) => {
    for (const match of rule.selector.matchAll(/\.([a-zA-Z_][\w-]*)/g))
      defined.add(match[1]);
  });
  for (const name of defined)
    if (!used.has(name)) unusedCssClasses.push(`${relative(file)}: ${name}`);
}

const findings = {
  unusedModules: modules.filter((file) => !visited.has(file)).map(relative),
  unusedStylesheets: stylesheets
    .filter((file) => !visited.has(file))
    .map(relative),
  unusedCssClasses,
  unusedAssets,
  missingAssets,
  unresolvedImports,
  unusedRuntimePackages: Object.keys(manifest.dependencies).filter(
    (name) => !packages.has(name),
  ),
  unusedDevelopmentPackages: Object.keys(manifest.devDependencies).filter(
    (name) => !packages.has(name),
  ),
};
console.log(
  JSON.stringify(
    {
      entrypoints: entries.length,
      publicFiles: publicFiles.length,
      ...findings,
    },
    null,
    2,
  ),
);
if (Object.values(findings).some((items) => items.length)) process.exitCode = 1;
