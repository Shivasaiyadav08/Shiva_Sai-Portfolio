import assert from "node:assert/strict";
import { test } from "node:test";
import { bindKeyboardPointers } from "../src/components/keyboard/pointer-input.ts";

class Surface extends EventTarget {
  style = {};
  captured = new Set();
  setPointerCapture(id) {
    this.captured.add(id);
  }
  hasPointerCapture(id) {
    return this.captured.has(id);
  }
  releasePointerCapture(id) {
    this.captured.delete(id);
  }
}

function setup(t) {
  const target = new Surface();
  const root = new EventTarget();
  const changes = [];
  const touches = [];
  const cleanup = bindKeyboardPointers({
    target,
    eventRoot: root,
    hitTest: ({ clientX }) =>
      clientX >= 0 && clientX < 150
        ? ["python", "redux", "redis"][Math.floor(clientX / 50)]
        : null,
    onKeyChange: (key) => changes.push(key),
    onTouchChange: (active) => touches.push(active),
  });
  t.after(cleanup);
  const send = (type, values = {}, destination = target) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(
      event,
      {
        pointerType: "mouse",
        pointerId: 1,
        isPrimary: true,
        button: 0,
        clientX: 10,
        clientY: 10,
      },
      values,
    );
    destination.dispatchEvent(event);
    return event;
  };
  return { target, root, changes, touches, cleanup, send };
}

test("mouse hover presses each key and releases on leaving", (t) => {
  const { send, changes } = setup(t);
  send("pointermove");
  send("pointermove", { clientX: 70 });
  send("pointerleave");
  assert.deepEqual(changes, ["python", "redux", null]);
});

test("a mouse drag rotates without scrubbing keys, then hover works again", (t) => {
  const { send, root, changes, touches } = setup(t);
  send("pointerdown");
  send("pointermove", { clientX: 80 });
  assert.deepEqual(changes, ["python"]);
  send("pointerup", {}, root);
  send("pointermove", { clientX: 80 });
  assert.deepEqual(changes, ["python", "redux"]);
  assert.deepEqual(touches, []);
});

test("a finger slides over multiple keys beyond five pixels and releases on lift", (t) => {
  const { send, root, target, changes, touches } = setup(t);
  const down = send("pointerdown", { pointerType: "touch" });
  assert.ok(down.defaultPrevented);
  assert.ok(target.hasPointerCapture(1));
  send("pointermove", { pointerType: "touch", clientX: 80 });
  send("pointermove", { pointerType: "touch", clientX: 130 });
  send("pointerup", { pointerType: "touch" }, root);
  assert.deepEqual(changes, ["python", "redux", "redis", null]);
  assert.deepEqual(touches, [true, false]);
  assert.equal(target.captured.size, 0);
});

test("sliding off the board releases a key and sliding back presses the next one", (t) => {
  const { send, root, changes } = setup(t);
  send("pointerdown", { pointerType: "touch" });
  send("pointermove", { pointerType: "touch", clientX: 200 });
  send("pointermove", { pointerType: "touch", clientX: 80 });
  send("pointerup", { pointerType: "touch" }, root);
  assert.deepEqual(changes, ["python", null, "redux", null]);
});

test("a second finger cannot replace or cancel the active finger", (t) => {
  const { send, root, changes, touches } = setup(t);
  send("pointerdown", { pointerType: "touch" });
  send("pointerdown", {
    pointerType: "touch",
    pointerId: 2,
    isPrimary: false,
    clientX: 80,
  });
  send("pointermove", { pointerType: "touch", pointerId: 2, clientX: 130 });
  send("pointercancel", { pointerType: "touch", pointerId: 2 }, root);
  assert.deepEqual(changes, ["python"]);
  send("pointerup", { pointerType: "touch" }, root);
  assert.deepEqual(changes, ["python", null]);
  assert.deepEqual(touches, [true, false]);
});

for (const event of ["pointercancel", "lostpointercapture", "blur"]) {
  test(`${event} releases the key and restores mouse controls`, (t) => {
    const { send, root, target, changes, touches } = setup(t);
    send("pointerdown", { pointerType: "touch" });
    send(
      event,
      { pointerType: "touch" },
      event === "lostpointercapture" ? target : root,
    );
    assert.deepEqual(changes, ["python", null]);
    assert.deepEqual(touches, [true, false]);
    assert.equal(target.captured.size, 0);
  });
}

test("cleanup removes pointer listeners and releases capture", (t) => {
  const { send, root, target, changes, cleanup } = setup(t);
  send("pointerdown", { pointerType: "touch" });
  cleanup();
  assert.equal(target.captured.size, 0);
  send("pointermove", { pointerType: "touch", clientX: 80 });
  send("pointerdown", { clientX: 130 });
  send("pointercancel", {}, root);
  assert.deepEqual(changes, ["python"]);
});
