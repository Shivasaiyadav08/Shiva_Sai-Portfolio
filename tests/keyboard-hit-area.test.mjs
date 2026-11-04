import assert from "node:assert/strict";
import { test } from "node:test";
import { Euler, Matrix4, OrthographicCamera, Vector3 } from "three";
import { keyboardHitArea } from "../src/components/keyboard/keyboard-hit-area.ts";

function setup(rotation = [0, 0, 0]) {
  const camera = new OrthographicCamera(-9, 9, 16, -16, 0.1, 100);
  camera.position.set(0.5, 16, 10).normalize().multiplyScalar(24);
  camera.lookAt(0, 0.25, 0);
  camera.updateMatrixWorld();
  const matrix = new Matrix4().makeRotationFromEuler(new Euler(...rotation));
  const polygon = () => keyboardHitArea(6.55, 12.55, 1.1, matrix, camera);
  const outline = () =>
    polygon()
      .slice(8, -1)
      .split(", ")
      .map((pair) => pair.split(" ").map(parseFloat));
  const project = (x, y, z) => {
    const point = new Vector3(x, y, z).applyMatrix4(matrix).project(camera);
    return [(point.x + 1) * 50, (1 - point.y) * 50];
  };
  return { camera, matrix, polygon, outline, project };
}

function contains(outline, [x, y]) {
  const sides = outline.map(([ax, ay], index) => {
    const [bx, by] = outline[(index + 1) % outline.length];
    return (bx - ax) * (y - ay) - (by - ay) * (x - ax);
  });
  return (
    sides.every((side) => side >= -0.01) || sides.every((side) => side <= 0.01)
  );
}

test("empty canvas margins and heading space are outside the keyboard touch area", () => {
  const { outline, project } = setup([-0.08, 0.5, 0]);
  assert.ok(contains(outline(), project(0, 0.7, 0)));
  for (const point of [[1, 1], [99, 50], [50, 1], project(0, 1, -8.5)])
    assert.equal(contains(outline(), point), false);
});

test("all 50 raised keys remain touchable through the mobile scroll rotations", () => {
  for (const rotation of [
    [-0.08, -0.32, 0],
    [-0.08, 0.25, 0],
    [-0.08, 0.5, 0],
    [0.1, 1.05, 0],
  ]) {
    const { outline, project } = setup(rotation);
    for (let index = 0; index < 50; index++) {
      const x = ((index % 5) - 2) * 1.2;
      const z = (Math.floor(index / 5) - 4.5) * 1.2;
      for (const dx of [-0.5, 0.5])
        for (const dz of [-0.5, 0.5])
          assert.ok(
            contains(outline(), project(x + dx, 1.09, z + dz)),
            `Key ${index} is covered at rotation ${rotation}`,
          );
    }
  }
});

test("the tilted board uses its outline rather than a rectangular scroll-blocking box", () => {
  const { outline } = setup([-0.08, 0.5, 0]);
  const points = outline();
  const minX = Math.min(...points.map(([x]) => x));
  const minY = Math.min(...points.map(([, y]) => y));
  assert.equal(contains(points, [minX + 0.01, minY + 0.01]), false);
});

test("the touch area updates with the camera, screen aspect, and board rotation", () => {
  const { camera, matrix, polygon } = setup();
  const initial = polygon();
  matrix.makeRotationY(0.5);
  const rotated = polygon();
  assert.notEqual(rotated, initial);
  camera.left = -12;
  camera.right = 12;
  camera.updateProjectionMatrix();
  assert.notEqual(polygon(), rotated);
});
