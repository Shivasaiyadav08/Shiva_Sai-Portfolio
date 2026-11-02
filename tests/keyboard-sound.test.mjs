import assert from "node:assert/strict";
import { test } from "node:test";
import { createKeyboardSound } from "../src/components/keyboard/keyboard-sound.ts";

const flush = () => new Promise(setImmediate);

class AudioContextMock extends EventTarget {
  state = "suspended";
  destination = {};
  started = [];
  stopped = 0;
  resumeCalls = 0;
  decoded = [];
  async resume() {
    this.resumeCalls++;
    this.state = "running";
    this.dispatchEvent(new Event("statechange"));
  }
  async decodeAudioData(data) {
    const url = new TextDecoder().decode(data);
    this.decoded.push(url);
    return { url };
  }
  createGain() {
    return { gain: {}, connect() {}, disconnect() {} };
  }
  createBufferSource() {
    const context = this;
    return {
      connect: (gain) => gain,
      disconnect() {},
      start() {
        context.started.push(this.buffer.url.split("/").at(-1));
      },
      stop() {
        context.stopped++;
        this.onended?.();
      },
    };
  }
  async close() {
    this.state = "closed";
  }
}

function setup(t, load = async (url) => new TextEncoder().encode(url).buffer) {
  const context = new AudioContextMock();
  const readiness = [];
  const sound = createKeyboardSound(
    context,
    (ready) => readiness.push(ready),
    load,
  );
  t.after(() => sound.dispose());
  return { context, sound, readiness };
}

test("a first interaction unlocks an already hovered key without an off/on toggle", async (t) => {
  const { context, sound, readiness } = setup(t);
  sound.press("python");
  await flush();
  assert.deepEqual(context.started, []);
  assert.equal(context.resumeCalls, 0);
  sound.unlock();
  await flush();
  assert.deepEqual(context.started, ["press.mp3"]);
  assert.equal(readiness.at(-1), true);
  assert.equal(context.decoded.length, 2);
});

test("first touch unlocks before the key press and plays that press exactly once", async (t) => {
  const { context, sound } = setup(t);
  sound.unlock();
  sound.press("redux");
  await flush();
  assert.deepEqual(context.started, ["press.mp3"]);
  sound.press(null);
  await flush();
  assert.deepEqual(context.started, ["press.mp3", "release.mp3"]);
});

test("any earlier page interaction prepares both samples for hover and sliding", async (t) => {
  const { context, sound } = setup(t);
  sound.unlock();
  await flush();
  sound.press("python");
  await flush();
  sound.press("redux");
  await flush();
  sound.press(null);
  await flush();
  assert.deepEqual(context.started, [
    "press.mp3",
    "release.mp3",
    "press.mp3",
    "release.mp3",
  ]);
  assert.equal(context.resumeCalls, 1);
});

test("a touch-end gesture can retry when touch-down did not unlock the context", async (t) => {
  const { context, sound } = setup(t);
  let finishFirstResume;
  context.resume = () => {
    context.resumeCalls++;
    if (context.resumeCalls === 1)
      return new Promise((resolve) => {
        finishFirstResume = resolve;
      });
    context.state = "running";
    finishFirstResume();
    return Promise.resolve();
  };
  sound.unlock();
  sound.press("redux");
  sound.unlock();
  await flush();
  assert.equal(context.resumeCalls, 2);
  assert.deepEqual(context.started, ["press.mp3"]);
});

test("muting stops playing samples and later page interactions keep sound muted", async (t) => {
  const { context, sound } = setup(t);
  sound.unlock();
  sound.press("python");
  await flush();
  sound.setEnabled(false);
  sound.unlock();
  sound.press("redux");
  await flush();
  assert.equal(context.stopped, 1);
  assert.deepEqual(context.started, ["press.mp3"]);
  sound.setEnabled(true);
  sound.press("redis");
  await flush();
  assert.deepEqual(context.started, ["press.mp3", "release.mp3", "press.mp3"]);
});

test("an interrupted context resumes on the next gesture", async (t) => {
  const { context, sound, readiness } = setup(t);
  sound.unlock();
  await flush();
  context.state = "suspended";
  context.dispatchEvent(new Event("statechange"));
  assert.equal(readiness.at(-1), false);
  sound.unlock();
  sound.press("redis");
  await flush();
  assert.equal(context.resumeCalls, 2);
  assert.deepEqual(context.started, ["press.mp3"]);
});

test("a rejected unlock can retry the same held key on the next gesture", async (t) => {
  const { context, sound } = setup(t);
  context.resume = async () => {
    context.resumeCalls++;
    if (context.resumeCalls === 1) throw new Error("Interaction required");
    context.state = "running";
  };
  sound.unlock();
  sound.press("python");
  await flush();
  assert.deepEqual(context.started, []);
  sound.unlock();
  await flush();
  assert.deepEqual(context.started, ["press.mp3"]);
});

test("muting during preload cancels pending sound", async (t) => {
  const loads = [];
  const { context, sound } = setup(
    t,
    (url) =>
      new Promise((resolve) => {
        loads.push(() => resolve(new TextEncoder().encode(url).buffer));
      }),
  );
  sound.unlock();
  sound.press("python");
  sound.setEnabled(false);
  loads.forEach((finish) => finish());
  await flush();
  assert.deepEqual(context.started, []);
});

test("failed sample loading stays silent without an unhandled rejection", async (t) => {
  const { context, sound, readiness } = setup(t, async () => {
    throw new Error("offline");
  });
  sound.unlock();
  sound.press("python");
  await flush();
  assert.deepEqual(context.started, []);
  assert.equal(readiness.at(-1), false);
});

test("cleanup closes the context and cancels queued playback", async (t) => {
  const { context, sound } = setup(t);
  sound.unlock();
  sound.press("python");
  sound.dispose();
  await flush();
  assert.equal(context.state, "closed");
  assert.deepEqual(context.started, []);
});
