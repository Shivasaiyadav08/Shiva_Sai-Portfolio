import assert from "node:assert/strict";

const origin = process.env.VERIFY_URL || "http://localhost:3000";
const projectCovers = new Set();
for (const [path, expected] of [
  [
    "/",
    [
      "Shiva Sai Thota",
      "Crebry",
      "Edith",
      "Karat Infinity",
      "Independent developer community",
      "8.62",
    ],
  ],
  ["/about", ["Shiva Sai Thota", "J.B. Institute", "Cyfrin Updraft"]],
  [
    "/projects",
    [
      "Crebry",
      "Edith",
      "Decentralized Stablecoin",
      "Bhagyashree Ventures",
      "GreenCost",
      "Freelancing",
      "Personal",
    ],
  ],
  ["/contact", ["shivasaiyadav0803@gmail.com", "Send Message"]],
]) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  if (path === "/" || path === "/projects") {
    const covers = [
      ...html.matchAll(/src="(\/_next\/static\/media\/[^"?]+\.webp)"/g),
    ];
    assert.equal(
      new Set(covers.map((match) => match[1])).size,
      5,
      `${path}: five static project covers`,
    );
    covers.forEach((match) => projectCovers.add(match[1]));
  }
  for (const text of expected)
    assert.ok(html.includes(text), `${path}: missing ${text}`);
  assert.doesNotMatch(html, /Ferhat|ferhatolmez|ferology1317|jaxfel/);
  assert.doesNotMatch(html, /Obblee|PhD researcher/i);
  console.log(`PASS ${path}: content and identity`);
}
for (const path of [
  "/blogs",
  "/blogs/missing-post",
  "/blogs/merhaba-dunya",
  "/missing-page",
]) {
  assert.equal((await fetch(new URL(path, origin))).status, 404, path);
  console.log(`PASS ${path}: proper 404`);
}
const pdf = await fetch(new URL("/Shiva-Sai-Resume.pdf", origin));
assert.equal(pdf.status, 200);
assert.ok(
  Buffer.from(await pdf.arrayBuffer())
    .subarray(0, 4)
    .equals(Buffer.from("%PDF")),
);
console.log("PASS resume download: PDF file");
for (const path of [...projectCovers, "/icon.svg"]) {
  const image = await fetch(new URL(path, origin));
  assert.equal(image.status, 200, path);
  if (path.endsWith(".webp")) {
    assert.match(image.headers.get("content-type") || "", /image\/webp/);
    assert.ok((await image.arrayBuffer()).byteLength > 100, path);
  }
}
console.log("PASS project covers and icon");
const og = await fetch(new URL("/opengraph-image", origin));
assert.equal(og.status, 200);
assert.match(og.headers.get("content-type") || "", /image\/png/);
console.log("PASS social preview image");

// Email delivery is exercised with mocked Formspree responses in npm test.
assert.equal((await fetch(new URL("/api/send", origin))).status, 404);
console.log("PASS removed mail API: proper 404");
