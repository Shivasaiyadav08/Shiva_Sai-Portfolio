import assert from "node:assert/strict";
import { test } from "node:test";
import { submitContact } from "../src/lib/contact.ts";

test("Formspree receives the visitor's named form fields without a mail API", async (t) => {
  const fields = new FormData();
  fields.set("name", "Test visitor");
  fields.set("email", "visitor@example.com");
  fields.set("message", "A test enquiry, never sent to a real service.");
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://formspree.io/f/testform");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Accept, "application/json");
    assert.equal(options.body, fields);
    assert.equal(options.body.get("email"), "visitor@example.com");
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(null, { status: 200 });
  });
  await submitContact("testform", fields);
});

test("missing or invalid form configuration never sends a request", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => {
    throw new Error("Unexpected request");
  });
  for (const id of [undefined, "", "../other", "https://example.com"]) {
    await assert.rejects(submitContact(id, new FormData()), /unavailable/);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

for (const status of [422, 429, 500]) {
  test(`Formspree ${status} is a failure, never a false success`, async (t) => {
    t.mock.method(
      globalThis,
      "fetch",
      async () => new Response(null, { status }),
    );
    await assert.rejects(
      submitContact("testform", new FormData()),
      /could not be sent/,
    );
  });
}

test("a network failure is reported to the form", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("Network unavailable");
  });
  await assert.rejects(
    submitContact("testform", new FormData()),
    /Network unavailable/,
  );
});
