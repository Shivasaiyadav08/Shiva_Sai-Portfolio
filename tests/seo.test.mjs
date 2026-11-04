import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.mjs";

test("canonical origin never falls back to localhost or an old deployment domain", async () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const values = [
      undefined,
      "",
      "not a URL",
      "https://shiva-sai.vercel.app",
      "http://localhost:3000",
      "https://shivasai.is-a.dev/",
      "https://shivasai.is-a.dev",
    ];
    for (const [index, value] of values.entries()) {
      if (value === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = value;
      const { config } = await import(
        `../src/data/config.ts?seo-test=${index}`
      );
      assert.equal(config.site, "https://shivasai.is-a.dev");
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});

test("only the legacy Vercel hostname is redirected, without www rules", async () => {
  const rules = await nextConfig.redirects();
  assert.deepEqual(rules, [
    {
      source: "/:path*",
      has: [{ type: "host", value: "shiva-sai.vercel.app" }],
      destination: "https://shivasai.is-a.dev/:path*",
      permanent: true,
    },
  ]);
});
