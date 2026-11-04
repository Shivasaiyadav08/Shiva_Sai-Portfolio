import assert from "node:assert/strict";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

const origin = process.env.VERIFY_URL || "http://localhost:3000";
const projectCovers = new Set();
const canonicalOrigin = "https://shivasai.is-a.dev";
const titles = new Set();
const descriptions = new Set();
const documents = new Map();
const internalLinks = new Set();
const decode = (text) =>
  text
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'");
function meta(html, key) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/g)].find(
    ([tag]) =>
      tag.includes(`name="${key}"`) || tag.includes(`property="${key}"`),
  )?.[0];
  return decode(tag?.match(/content="([^"]*)"/)?.[1] || "");
}
for (const [path, expected] of [
  [
    "/",
    [
      "Shiva Sai Thota",
      "Crebry",
      "Edith",
      "Karat Infinity",
      "Independent Development Team",
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
  documents.set(path, html);
  const canonical = new URL(path, canonicalOrigin).href;
  const canonicalTags = [
    ...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/g),
  ];
  assert.equal(canonicalTags.length, 1, `${path}: exactly one canonical`);
  assert.equal(
    new URL(canonicalTags[0][0].match(/href="([^"]+)"/)[1]).href,
    canonical,
    `${path}: primary canonical`,
  );
  const title = decode(html.match(/<title>(.*?)<\/title>/)?.[1] || "");
  const description = meta(html, "description");
  assert.ok(title && description, `${path}: complete metadata`);
  assert.ok(
    !titles.has(title) && !descriptions.has(description),
    `${path}: unique metadata`,
  );
  titles.add(title);
  descriptions.add(description);
  assert.equal(meta(html, "og:title"), title);
  assert.equal(meta(html, "og:description"), description);
  assert.equal(new URL(meta(html, "og:url")).href, canonical);
  assert.ok(
    meta(html, "og:image").startsWith(`${canonicalOrigin}/opengraph-image`),
  );
  assert.equal(meta(html, "og:image:width"), "1200");
  assert.equal(meta(html, "og:image:height"), "630");
  assert.equal(meta(html, "twitter:card"), "summary_large_image");
  assert.equal(meta(html, "twitter:title"), title);
  assert.equal(meta(html, "twitter:description"), description);
  assert.ok(
    meta(html, "twitter:image").startsWith(
      `${canonicalOrigin}/opengraph-image`,
    ),
  );
  assert.doesNotMatch(meta(html, "robots"), /noindex|nofollow/);
  assert.doesNotMatch(response.headers.get("x-robots-tag") || "", /noindex/);
  assert.equal(
    [...html.matchAll(/<h1\b/g)].length,
    1,
    `${path}: one main heading`,
  );
  const data = [
    ...html.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => JSON.parse(match[1]));
  const entities = data.flatMap((item) => item["@graph"] || [item]);
  assert.ok(
    entities.some(
      (item) => item["@type"] === "Person" && item.name === "Shiva Sai Thota",
    ),
  );
  assert.ok(
    entities.some(
      (item) =>
        item["@type"] === "WebSite" && item.url === `${canonicalOrigin}/`,
    ),
  );
  if (path === "/about")
    assert.ok(
      entities.some(
        (item) => item["@type"] === "ProfilePage" && item.url === canonical,
      ),
    );
  for (const [_, attributes] of html.matchAll(/<img\b([^>]*)>/g))
    assert.match(attributes, /\balt="[^"]*"/, `${path}: image alt present`);
  for (const [_, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    if (href.startsWith("/") && !href.startsWith("//"))
      internalLinks.add(decode(href));
  }
  if (path === "/" || path === "/projects") {
    const covers = [
      ...html.matchAll(
        /src="(\/_next\/static\/media\/[^"?]+\.webp(?:\?[^\"]*)?)"/g,
      ),
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
for (const href of internalLinks) {
  const url = new URL(href, origin);
  const target = documents.get(url.pathname);
  if (url.hash && target)
    assert.ok(
      target.includes(`id="${url.hash.slice(1)}"`),
      `Anchor ${href} exists`,
    );
  else if (!target)
    assert.ok((await fetch(url)).ok, `Internal link ${href} works`);
}
const sitemap = await fetch(new URL("/sitemap.xml", origin));
assert.equal(sitemap.status, 200);
assert.match(sitemap.headers.get("content-type") || "", /xml/);
const xml = await sitemap.text();
assert.deepEqual(
  [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]).sort(),
  [...documents.keys()]
    .map((path) => new URL(path, canonicalOrigin).href)
    .sort(),
);
assert.doesNotMatch(xml, /<lastmod>/);
const robots = await fetch(new URL("/robots.txt", origin));
assert.equal(robots.status, 200);
const rules = await robots.text();
assert.match(rules, /User-Agent: \*/i);
assert.match(rules, /Allow: \/\s/);
assert.ok(rules.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
assert.doesNotMatch(rules, /Disallow: \/\s/);
// Node's fetch normalizes Host; a direct HTTP request exercises Next's host rule.
const legacyUrl = new URL("/projects?source=legacy", origin);
const legacy = await new Promise((resolve, reject) => {
  const request = legacyUrl.protocol === "https:" ? httpsRequest : httpRequest;
  const req = request(
    legacyUrl,
    { headers: { Host: "shiva-sai.vercel.app" } },
    (res) => {
      res.resume();
      resolve({ status: res.statusCode, location: res.headers.location });
    },
  );
  req.on("error", reject);
  req.setTimeout(15000, () =>
    req.destroy(new Error("Legacy redirect check timed out")),
  );
  req.end();
});
assert.equal(legacy.status, 308);
assert.equal(legacy.location, `${canonicalOrigin}/projects?source=legacy`);
console.log(
  "PASS SEO: unique metadata, four canonicals, social cards, JSON-LD, headings, internal links, sitemap, robots and legacy redirect",
);
for (const path of [
  "/blogs",
  "/blogs/missing-post",
  "/blogs/merhaba-dunya",
  "/missing-page",
]) {
  assert.equal((await fetch(new URL(path, origin))).status, 404, path);
  console.log(`PASS ${path}: proper 404`);
}
const pdf = await fetch(new URL("/Shiva_Sai_Software_Engineer.pdf", origin));
assert.equal(pdf.status, 200);
assert.ok(
  Buffer.from(await pdf.arrayBuffer())
    .subarray(0, 4)
    .equals(Buffer.from("%PDF")),
);
console.log("PASS resume download: PDF file");
for (const path of [...projectCovers, "/terminal.svg"]) {
  const image = await fetch(new URL(path, origin));
  assert.equal(image.status, 200, path);
  if (new URL(path, origin).pathname.endsWith(".webp")) {
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
