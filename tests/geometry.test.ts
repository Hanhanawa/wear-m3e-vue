import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  arcPoint,
  gestureAxis,
  itemScale,
  normalizedPage,
  swipePage,
} from "../src/geometry.ts";

test("normalizes controlled indices against the current page count", () => {
  assert.equal(normalizedPage(7, 4), 3);
  assert.equal(normalizedPage(-2, 4), 0);
  assert.equal(normalizedPage(Infinity, 4), 0);
  assert.equal(normalizedPage(2, 0), 0);
});

test("vertical and diagonal drags stay with the web scroller", () => {
  assert.equal(gestureAxis(2, 4, 8), null);
  assert.equal(gestureAxis(6, 30, 8), "y");
  assert.equal(gestureAxis(18, 18, 8), "y");
  assert.equal(gestureAxis(25, 5, 8), "x");
  assert.equal(gestureAxis(-25, 5, 8), "x");
});

test("a page settles on a single qualified swipe, with a host-scale-aware physical threshold", () => {
  assert.equal(swipePage(-12, 25, 192, 1), 0);
  assert.equal(swipePage(-31, 500, 192, 1), 0);
  assert.equal(swipePage(-31, 72, 192, 1), 1);
  assert.equal(swipePage(90, 400, 192, 1), -1);
  assert.equal(swipePage(-31, 72, 320, 1 / 0.6), 0);
  assert.equal(swipePage(-72, 300, 320, 1 / 0.6), 1);
});

test("centered medium rows remain full size, edge rows scale symmetrically", () => {
  for (const diameter of [192, 240]) {
    const effects = {
      height: 48,
      width: diameter * 0.84,
      diameter,
      edgeScale: 0.73,
    };
    const center = itemScale({ ...effects, center: diameter / 2 });
    assert.equal(center, 1);
    const leading = itemScale({ ...effects, center: diameter * 0.15 });
    assert.equal(leading, itemScale({ ...effects, center: diameter * 0.85 }));
    assert.ok(leading >= 0.5 && leading < center);
  }
});

test("indicator coordinates follow the lower arc, centered and ordered", () => {
  const points = [0, 1, 2, 3].map((i) => arcPoint(i, 4));
  assert.equal(points[0][1], points[3][1]);
  assert.equal(points[1][1], points[2][1]);
  assert.ok(points[1][1] > points[0][1]);
  assert.ok(points[0][0] < points[1][0]);
});
