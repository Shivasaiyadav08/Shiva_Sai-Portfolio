import { Vector3, type Camera, type Matrix4 } from "three";

type Point = { x: number; y: number };
const cross = (a: Point, b: Point, c: Point) =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

// Project the board and raised caps, excluding the description and empty canvas.
export function keyboardHitArea(
  width: number,
  depth: number,
  top: number,
  matrix: Matrix4,
  camera: Camera,
) {
  const point = new Vector3();
  const points: Point[] = [];
  for (const x of [-width / 2, width / 2])
    for (const y of [-0.5, top])
      for (const z of [-depth / 2, depth / 2]) {
        point.set(x, y, z).applyMatrix4(matrix).project(camera);
        points.push({ x: (point.x + 1) * 50, y: (1 - point.y) * 50 });
      }
  points.sort((a, b) => a.x - b.x || a.y - b.y);
  const half = (ordered: Point[]) => {
    const edge: Point[] = [];
    for (const point of ordered) {
      while (edge.length > 1 && cross(edge.at(-2)!, edge.at(-1)!, point) <= 0)
        edge.pop();
      edge.push(point);
    }
    return edge.slice(0, -1);
  };
  const outline = [...half(points), ...half([...points].reverse())];
  return `polygon(${outline.map(({ x, y }) => `${x.toFixed(3)}% ${y.toFixed(3)}%`).join(", ")})`;
}
