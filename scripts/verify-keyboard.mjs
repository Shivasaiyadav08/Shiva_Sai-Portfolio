import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Read the real resume skill list instead of maintaining a second test list.
const source = ts.createSourceFile(
  "profile.ts",
  await readFile(new URL("../src/data/profile.ts", import.meta.url), "utf8"),
  ts.ScriptTarget.Latest,
  true,
);
let expected = [];
let resumeGroups = [];
function visit(node) {
  if (
    ts.isVariableDeclaration(node) &&
    node.name.getText(source) === "SKILL_GROUPS"
  ) {
    resumeGroups = node.initializer.elements.map((group) => {
      const skills = group.properties.find(
        (property) => property.name.getText(source) === "skills",
      );
      return skills.initializer.elements.map((skill) => skill.text);
    });
  }
  ts.forEachChild(node, visit);
}
visit(source);
const concepts = [
  "REST APIs",
  "Prompt Engineering",
  "RAG",
  "AI Agent Orchestration",
  "Evaluation",
  "Vector Search",
  "EVM",
  "CI/CD Pipelines",
];
expected = [
  ...resumeGroups[0],
  ...resumeGroups[4],
  ...resumeGroups[1],
  ...resumeGroups[5].filter((name) => name !== "Alchemy"),
  ...resumeGroups[2],
  ...resumeGroups[3],
  "Alchemy",
].filter((name) => !concepts.includes(name));
assert.equal(
  expected.length,
  50,
  "The requested stack contains 50 distinct technologies",
);
assert.ok(expected.length > 0, "Resume skills must be found");
assert.deepEqual(
  resumeGroups[1].slice(0, 2),
  ["HTML", "CSS"],
  "Full stack starts with HTML and CSS",
);
assert.deepEqual(
  resumeGroups[4],
  ["MongoDB", "PostgreSQL", "MySQL", "Redis"],
  "Database drivers and ORMs belong with their application stack",
);
assert.equal(
  new Set(expected).size,
  expected.length,
  "Resume skills must be unique",
);

const response = await fetch(process.env.VERIFY_URL || "http://localhost:3000");
assert.equal(response.status, 200);
const html = await response.text();
const rendered = [...html.matchAll(/data-tech-key="([^"]+)"/g)].map(
  (match) => match[1],
);
assert.equal(
  rendered.length,
  expected.length,
  "The shared keyboard must render every technology and tool",
);
for (const name of expected) {
  assert.equal(
    rendered.filter((key) => key === name).length,
    1,
    `${name}: exactly one key on the shared keyboard`,
  );
}
assert.deepEqual(
  rendered.slice(0, expected.length),
  expected,
  "Hero must follow languages → databases → full stack → AI → blockchain",
);
assert.equal(expected.length % 10, 0, "Desktop grid must have no empty keys");
assert.equal(
  expected.length % 5,
  0,
  "Mobile WebGL grid must have no empty keys",
);
assert.ok(html.includes('data-columns="10"'), "Desktop uses ten full columns");
assert.ok(
  html.includes('data-mobile-columns="5"'),
  "Phones use five full columns",
);
assert.equal([...html.matchAll(/data-tech-keyboard="shared"/g)].length, 1);
assert.equal([...html.matchAll(/data-keyboard-slot="hero"/g)].length, 1);
assert.equal([...html.matchAll(/data-keyboard-slot="skills"/g)].length, 1);
for (const oldSkill of [
  ...concepts,
  "Laravel",
  "Infura",
  "C#",
  "AWS",
  "Firebase",
  "Socket.io",
  "SQLite",
]) {
  assert.ok(
    !rendered.includes(oldSkill),
    `Template key ${oldSkill} must not appear`,
  );
}
assert.ok(
  !html.includes("skills-keyboard.spline"),
  "The embedded template scene must not be used",
);
console.log(
  `PASS: all ${expected.length} technologies and tools appear exactly once on the shared keyboard, with no concept or template keys.`,
);
const assetPaths = [
  "/assets/keycap-sounds/press.mp3",
  "/assets/keycap-sounds/release.mp3",
  ...new Set(
    [
      ...html.matchAll(/src="(\/assets\/(?:stack|keycap-sounds)\/[^"?]+)"/g),
    ].map((match) => match[1]),
  ),
];
assert.ok(assetPaths.length >= 45, "Real logo and sound assets must be served");
await Promise.all(
  assetPaths.map(async (path) => {
    const asset = await fetch(
      new URL(path, process.env.VERIFY_URL || "http://localhost:3000"),
    );
    assert.equal(asset.status, 200, path);
    assert.ok(
      (await asset.arrayBuffer()).byteLength > 100,
      `${path}: asset must not be empty`,
    );
  }),
);
console.log(
  `PASS: ${assetPaths.length} local logo and sound assets load successfully.`,
);
