import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  circularGeometry,
  gapSweep,
  levelGeometry,
  linearGeometry,
  pageIndicatorGeometry,
  segmentedGeometry,
} from "../src/arcs.ts";
import {
  colorSchemeVars,
  resolveColorScheme,
  screenScaled,
  toneShift,
  wearColorRoles,
  wearProgress,
  wearTypeScale,
} from "../src/tokens.ts";

/** Relative luminance, used only to check the direction of a tonal shift. */
function luminance(color: string): number {
  const hex = color.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Arc length covered by a given sweep at a given radius. */
const arcLength = (degrees: number, radius: number) =>
  (degrees / 360) * 2 * Math.PI * radius;

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected}, got ${actual}`,
  );

/** The sweep a piece covers before its half-gaps were subtracted. */
const preGapSweep = (piece: number, gap: number) => piece + gap;
/** Endpoints of a drawn arc before the gap inset was applied. */
const preGapStart = (piece: { startAngle: number }, gap: number) =>
  piece.startAngle - gap / 2;
const preGapEnd = (
  piece: { startAngle: number; sweep: number },
  gap: number,
) => preGapStart(piece, gap) + preGapSweep(piece.sweep, gap);

test("the physical gap between caps stays constant across screen diameters", () => {
  // The audit finding was that a fixed 7 unit stroke became 3.36 dp on one
  // screen and a different value on another, and that dash subtraction kept
  // the gap proportional instead of physical.
  const stroke = 8;
  const gap = stroke / wearProgress.gapOverStroke;
  for (const diameter of [192, 240, 320]) {
    const sweep = gapSweep(stroke, diameter, gap);
    const radius = diameter / 2 - stroke / 2;
    assert.ok(
      Math.abs(arcLength(sweep, radius) - (stroke + gap)) < 0.01,
      `${diameter}: ${arcLength(sweep, radius)}`,
    );
  }
  assert.equal(gapSweep(stroke, stroke), 180);
});

test("circular progress separates track and active arcs with a gap", () => {
  const geometry = circularGeometry({
    diameter: 120,
    strokeWidth: 12,
    fraction: 0.5,
  });
  assert.equal(geometry.active.kind, "arc");
  assert.equal(geometry.track.kind, "arc");
  // Each end of both pieces gives up half a gap, so neither reaches 180.
  assert.ok(geometry.active.sweep < 180, "active arc loses half its gap");
  assert.ok(geometry.track.sweep < 180, "track arc loses half its gap");
  assert.ok(!geometry.merged);
  // The two pieces meet at the progress boundary and never overlap: the track
  // starts half a gap after it, the active arc ends half a gap before it.
  assert.equal(geometry.active.startAngle, 270 + geometry.gapSweep / 2);
  close(
    geometry.track.startAngle,
    270 + 180 + geometry.gapSweep / 2,
    1e-9,
  );
  close(
    preGapSweep(geometry.active.sweep, geometry.gapSweep),
    180,
    1e-9,
  );
});

test("circular progress at a full turn merges the gap into a closed ring", () => {
  const full = circularGeometry({ diameter: 120, strokeWidth: 12, fraction: 1 });
  assert.ok(full.merged);
  assert.equal(full.active.kind === "arc" && full.active.sweep, 360);
  assert.ok(full.gapSweep > 0, "the gap still exists for partial progress");
  // Nothing is left to draw behind a complete ring.
  assert.equal(full.track.kind, "dot");
  if (full.track.kind === "dot") assert.equal(full.track.radius, 0);

  const empty = circularGeometry({ diameter: 120, strokeWidth: 12, fraction: 0 });
  assert.equal(empty.active.kind, "dot");
  if (empty.active.kind === "dot") assert.equal(empty.active.radius, 0);
  assert.equal(empty.track.kind === "arc" && empty.track.sweep > 300, true);
});

test("a circular segment shorter than the gap degrades to a shrinking dot", () => {
  const tiny = circularGeometry({ diameter: 120, strokeWidth: 12, fraction: 0.005 });
  assert.equal(tiny.active.kind, "dot");
  assert.ok(tiny.active.radius < 6, "dot radius below the half stroke");
  assert.ok(tiny.active.opacity <= 1);
});

test("segmented progress draws one round-capped piece per segment", () => {
  const geometry = segmentedGeometry({
    diameter: 120,
    strokeWidth: 10,
    segmentCount: 5,
    fraction: 0.5,
  });
  const tracks = geometry.segments.filter((piece) => piece.state === "track");
  const active = geometry.segments.filter((piece) => piece.state === "active");
  const segmentSweep = 360 / 5;
  // Half of five segments is 2.5: segments 0 and 1 are full, segment 2 is the
  // partially filled one and still carries its track underneath, and 3 and 4
  // are pure track. Native draws both pieces for the boundary segment.
  assert.equal(active.length, 3);
  assert.equal(tracks.length, 3);
  const sweeps = active.map((piece) =>
    piece.segment.kind === "arc"
      ? preGapSweep(piece.segment.sweep, geometry.gapSweep)
      : 0,
  );
  close(sweeps[0], segmentSweep, 1e-9);
  close(sweeps[1], segmentSweep, 1e-9);
  close(sweeps[2], segmentSweep / 2, 1e-9);
  // Every piece is inset by the gap on both ends, so caps never touch.
  for (const piece of geometry.segments)
    if (piece.segment.kind === "arc")
      assert.ok(piece.segment.sweep > 0 && piece.segment.sweep < segmentSweep);
});

test("segmented progress keeps every segment when the ring is complete", () => {
  const geometry = segmentedGeometry({
    diameter: 120,
    strokeWidth: 10,
    segmentCount: 24,
    fraction: 1,
  });
  assert.equal(geometry.segments.length, 24);
  assert.equal(geometry.segments.filter((p) => p.state === "track").length, 0);
});

test("linear progress reserves the endpoint dot and hides it at completion", () => {
  const width = 200;
  const start = linearGeometry({ width, strokeWidth: 12, fraction: 0 });
  assert.equal(start.active, null);
  assert.deepEqual(
    [start.dot?.radius, start.dot?.opacity],
    [wearProgress.linearDotRadius, 1],
  );

  const half = linearGeometry({ width, strokeWidth: 12, fraction: 0.5 });
  const inner = width - 2 * wearProgress.linearOuterMargin;
  assert.equal(
    Math.round((half.active?.end! - half.active?.start!) * 1e6) / 1e6,
    Math.round(0.5 * (inner - 12) * 1e6) / 1e6,
  );

  const full = linearGeometry({ width, strokeWidth: 12, fraction: 1 });
  assert.equal(full.dot, null, "the dot disappears once the bar reaches it");
});

test("the linear endpoint dot fades over the last 4 dp", () => {
  const width = 200;
  const stroke = 12;
  const inner = width - 2 * wearProgress.linearOuterMargin;
  const { linearDotRadius: dotRadius, linearDotMargin: dotMargin } = wearProgress;
  // Solve for the progress that leaves exactly half a dot margin of clearance:
  // distance = dotCenterX - r - progressLength - stroke.
  const dotCenterX = inner - dotRadius - dotMargin;
  const progressLength = dotCenterX - dotRadius - stroke - dotMargin / 2;
  const near = linearGeometry({
    width,
    strokeWidth: stroke,
    fraction: progressLength / (inner - stroke),
  });
  assert.ok(near.dot);
  close(near.dot!.radius, dotRadius / 2, 1e-9);
  close(near.dot!.opacity, 0.5, 1e-9);
});

test("small linear strokes cannot hide the endpoint dot", () => {
  // LinearProgressIndicatorDefaults.StrokeWidthSmall is the floor.
  const thin = linearGeometry({ width: 200, strokeWidth: 2, fraction: 0.2 });
  assert.equal(thin.strokeWidth, wearProgress.linearStroke.small);
  assert.ok(thin.dot);
});

test("level indicators sit on the start side and grow from the bottom", () => {
  const half = wearProgress.levelSweepAngle / 2;
  const left = levelGeometry({ diameter: 240, fraction: 0.5 });
  assert.equal(left.baseAngle, 180);
  assert.ok(left.radius > 0);
  if (left.active.kind === "arc" && left.track.kind === "arc") {
    // Both pieces begin at the bottom end of the arc, 144 degrees, and the
    // filled piece is half as long before its gaps are inset.
    close(preGapStart(left.track, left.gapSweep), 180 - half, 1e-9);
    close(preGapStart(left.active, left.gapSweep), 180 - half, 1e-9);
    close(preGapSweep(left.track.sweep, left.gapSweep), half * 2, 1e-9);
    close(preGapSweep(left.active.sweep, left.gapSweep), half, 1e-9);
  }

  const right = levelGeometry({ diameter: 240, side: "end", fraction: 0.5 });
  assert.equal(right.baseAngle, 0);
  if (right.active.kind === "arc" && right.track.kind === "arc") {
    // Mirrored: the arc climbs by *decreasing* angle, so the filled part ends
    // at the bottom, sharing the track's lower anchor at +36 degrees.
    close(preGapEnd(right.track, right.gapSweep), half, 1e-9);
    close(preGapEnd(right.active, right.gapSweep), half, 1e-9);
  }

  const reversed = levelGeometry({ diameter: 240, fraction: 0.5, reverse: true });
  if (reversed.active.kind === "arc" && left.active.kind === "arc")
    assert.ok(reversed.active.startAngle > left.active.startAngle);
});

test("a level stroke is 6 dp on every screen, not a path constant", () => {
  const small = levelGeometry({ diameter: 192, fraction: 0.65 });
  const large = levelGeometry({ diameter: 240, fraction: 0.65 });
  // radius = D/2 - edgePadding - stroke/2
  assert.ok(Math.abs(large.radius - small.radius - 24) < 1e-9);
});

test("page indicator dots are 6 dp regardless of the screen", () => {
  for (const diameter of [192, 240]) {
    const geometry = pageIndicatorGeometry({
      diameter,
      count: 4,
      progress: 1,
    });
    assert.equal(geometry.dotRadius, wearProgress.pageDot / 2);
    assert.equal(geometry.trackStroke, 12);
    // radius = (D - trackStroke) / 2 - 2 dp edge padding
    assert.equal(geometry.radius, (diameter - 12) / 2 - 2);
    const [first, second] = geometry.dots;
    const chord = Math.hypot(second.x - first.x, second.y - first.y);
    assert.ok(
      Math.abs(chord - (wearProgress.pageDot + wearProgress.pageSpacing)) < 0.1,
      `dot pitch ${chord}`,
    );
  }
});

test("the page indicator window holds at most six dots", () => {
  const geometry = pageIndicatorGeometry({ diameter: 240, count: 12, progress: 8 });
  assert.equal(geometry.dots.length, wearProgress.pageMaxVisible);
  assert.equal(geometry.windowStart, 8 - 3);
  // Dots at the window edge shrink, interior dots stay full size.
  assert.equal(geometry.dots[0].scale, wearProgress.pageSmallIndicatorFraction);
  assert.equal(geometry.dots[3].scale, 1);
});

/* ------------------------------------------------------------ tokens */

test("a four-role brand input still resolves every consumable role", () => {
  const scheme = resolveColorScheme({
    primary: "#c4ec72",
    onPrimary: "#253500",
    primaryContainer: "#344b10",
    onPrimaryContainer: "#e1f8b4",
  });
  for (const role of wearColorRoles)
    assert.ok(scheme[role], `${role} resolved`);
  assert.equal(scheme.primary, "#c4ec72");
  assert.equal(scheme.primaryContainer, "#344b10");
  // Derived from the supplied anchors rather than left empty.
  assert.notEqual(scheme.primaryDim, "#c4ec72");
  assert.match(scheme.primaryDim, /^#[0-9a-f]{6}$/);
  // The neutral surfaces keep their own ramp, they are not the accent.
  assert.notEqual(scheme.surfaceContainerHigh, scheme.surfaceContainer);
});

test("tonal derivation moves along the ramp in the right direction", () => {
  // The surface family is derived from one supplied surface, so a shift must
  // actually change lightness - a broken round-trip here silently produced
  // *lighter* "low" containers.
  assert.equal(toneShift("#c4ec72", 0), "#c4ec72");
  const base = luminance("#332e3c");
  assert.ok(luminance(toneShift("#332e3c", -0.045)) < base);
  assert.ok(luminance(toneShift("#332e3c", 0.055)) > base);
  assert.ok(luminance(toneShift("#c4ec72", -0.09)) < luminance("#c4ec72"));
  // Clamped, never out of gamut.
  assert.match(toneShift("#ffffff", -0.5), /^#[0-9a-f]{6}$/);
  assert.match(toneShift("#000000", 0.5), /^#[0-9a-f]{6}$/);
});

test("the legacy surface alias maps onto surfaceContainer", () => {
  const scheme = resolveColorScheme({ surface: "#123456" });
  assert.equal(scheme.surfaceContainer, "#123456");
  assert.notEqual(scheme.surfaceContainerLow, scheme.surfaceContainer);
  assert.notEqual(scheme.surfaceContainerHigh, scheme.surfaceContainer);
  assert.equal(
    colorSchemeVars({ surface: "#123456" })["--wear-color-surface-container"],
    "#123456",
  );
});

test("type roles carry the sizes the components consume", () => {
  assert.equal(wearTypeScale.labelMedium.size, 15);
  assert.equal(wearTypeScale.labelSmall.size, 13);
  assert.equal(wearTypeScale.titleMedium.size, 16);
  assert.equal(wearTypeScale.arcMedium.size, 15);
  assert.equal(wearTypeScale.numeralMedium.size, 40);
  assert.equal(wearTypeScale.arcMedium.trackingBottom, 1.4);
  // Large ramps must not grow without bound.
  assert.equal(wearTypeScale.displayLarge.scaling, "limited");
  assert.equal(wearTypeScale.arcMedium.scaling, "fixed");
});

test("screen-dependent strokes interpolate between the 192 and 240 anchors", () => {
  assert.equal(screenScaled(192, wearProgress.circularLargeStroke), 8);
  assert.equal(screenScaled(240, wearProgress.circularLargeStroke), 12);
  assert.equal(screenScaled(1000, wearProgress.circularLargeStroke), 12);
  assert.equal(screenScaled(100, wearProgress.circularSmallStroke), 5);
});
