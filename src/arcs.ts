/* SPDX-License-Identifier: Apache-2.0 */

/**
 * Arc and indicator geometry for the Wear Material 3 drawing families.
 *
 * Every input and output is a logical Wear dp (or degrees). Callers convert dp
 * to device pixels only through the SVG viewBox, never by scaling a fixed 240
 * coordinate space, which is what made strokes and dots change thickness with
 * the screen diameter (audit 00 §4.2, 02 §4.2).
 *
 * Source contracts, pinned Wear Compose Material 3:
 *   CircularProgressIndicator.kt:305-330      gap sweep + track/active split
 *   ProgressIndicator.kt:301-348              short-segment dot fallback
 *   SegmentedCircularProgressIndicator.kt:160-235  per-segment drawing
 *   LinearProgressIndicator.kt:138-205        endpoint dot
 *   LevelIndicator.kt:206-232,218-231        sweep, stroke, side, radius
 *   PageIndicator.kt:207-224,322-361,650-669  dot pitch, window, radii
 */

// The extension is required so `node --test` can load this module directly.
import { wearPadding, wearProgress } from "./tokens.ts";

const DEG = Math.PI / 180;

export interface ArcPiece {
  /** SVG degrees: 0 is 3 o'clock, increasing clockwise. */
  startAngle: number;
  sweep: number;
}

/** An arc, or the shrinking dot that replaces it once it gets too short. */
export type IndicatorSegment =
  | ({ kind: "arc" } & ArcPiece)
  | {
      kind: "dot";
      angle: number;
      radius: number;
      opacity: number;
    };

/**
 * Sweep angle occupied by the gap between the end caps of two neighbouring
 * strokes: `2 * asin((stroke + gap) / (diameter - stroke))`.
 *
 * CircularProgressIndicator.kt:307-309. `diameter` is the full component
 * diameter, `gap` is the physical gap excluding the caps.
 */
export function gapSweep(
  strokeWidth: number,
  diameter: number,
  gap = strokeWidth / wearProgress.gapOverStroke,
): number {
  if (strokeWidth <= 0 || diameter <= 0) return 0;
  // A ring thinner than its own stroke is degenerate: the clamp below makes
  // the whole circle gap, which is what the native formula evaluates to.
  const ratio = Math.min(1, (strokeWidth + gap) / Math.max(1e-6, diameter - strokeWidth));
  return 2 * Math.asin(ratio) / DEG;
}

/**
 * `ProgressIndicator.kt:301-348` — a segment shorter than the gap is drawn as
 * a dot that shrinks and fades out, otherwise as an arc inset by half a gap.
 */
export function indicatorSegment(
  startAngle: number,
  sweep: number,
  gapSweepDegrees: number,
  strokeWidth: number,
  diameter: number,
  strokePadding = 0,
): IndicatorSegment {
  if (sweep <= 0)
    // Nothing to draw: a completed ring leaves no remainder, an empty one no
    // indicator. This must stay separate from the short-segment case below.
    return { kind: "dot", angle: startAngle, radius: 0, opacity: 0 };
  if (sweep <= gapSweepDegrees) {
    const angle = startAngle + sweep / 2;
    const radius =
      ((strokeWidth + strokePadding) / 2) *
      (gapSweepDegrees === 0 ? 1 : sweep / gapSweepDegrees);
    return {
      kind: "dot",
      angle,
      radius,
      opacity: Math.min(1, (radius / strokeWidth) * 2),
    };
  }
  return {
    kind: "arc",
    startAngle: startAngle + gapSweepDegrees / 2,
    sweep: sweep - gapSweepDegrees,
  };
}

export interface CircularGeometry {
  strokeWidth: number;
  gapSize: number;
  gapSweep: number;
  /** Radius of the drawn arc: the stroke is centred on it. */
  radius: number;
  active: IndicatorSegment;
  track: IndicatorSegment;
  /** True when progress reached 1 and the two gaps merged into a closed ring. */
  merged: boolean;
}

/**
 * Determinate circular progress: the active arc and the remaining track are
 * separate strokes with a real gap between their caps, instead of one dashed
 * circle painted over a full one.
 */
export function circularGeometry({
  diameter,
  strokeWidth,
  fraction,
  gap,
  startAngle = wearProgress.startAngle,
  endAngle = startAngle,
}: {
  diameter: number;
  strokeWidth: number;
  fraction: number;
  gap?: number;
  startAngle?: number;
  endAngle?: number;
}): CircularGeometry {
  const size = Math.max(0, diameter);
  const gapSize = gap ?? strokeWidth / wearProgress.gapOverStroke;
  const gapDegrees = gapSweep(strokeWidth, size, gapSize);
  const fullSweep = 360 - ((((startAngle - endAngle) % 360) + 360) % 360);
  const progress = Math.min(1, Math.max(0, fraction));
  const progressSweep = fullSweep * progress;
  const radius = Math.max(0, size / 2 - strokeWidth / 2);
  // CircularProgressIndicator.kt:311-330: a full circle merges its two gaps,
  // so 100% closes the ring instead of leaving a notch.
  const merged = fullSweep === 360 && progress === 1;
  return {
    strokeWidth,
    gapSize,
    gapSweep: gapDegrees,
    radius,
    merged,
    active: indicatorSegment(
      startAngle,
      progressSweep,
      merged ? 0 : gapDegrees,
      strokeWidth,
      size,
    ),
    track: indicatorSegment(
      startAngle + progressSweep,
      fullSweep - progressSweep,
      merged ? 0 : gapDegrees,
      strokeWidth,
      size,
    ),
  };
}

export type SegmentState = "active" | "track";

/** One drawn piece of a segmented ring, plus which colour role it carries. */
export interface SegmentedPiece {
  state: SegmentState;
  segment: IndicatorSegment;
}

/**
 * Segmented circular progress. Each segment keeps its own round caps and its
 * own local completion, which a dasharray mask cannot express (the mask cuts
 * flat ends regardless of `stroke-linecap`).
 *
 * SegmentedCircularProgressIndicator.kt:160-235.
 */
export function segmentedGeometry({
  diameter,
  strokeWidth,
  segmentCount,
  fraction,
  gap,
  startAngle = wearProgress.startAngle,
}: {
  diameter: number;
  strokeWidth: number;
  segmentCount: number;
  fraction: number;
  gap?: number;
  startAngle?: number;
}): { gapSweep: number; radius: number; segments: SegmentedPiece[] } {
  const size = Math.max(0, diameter);
  const count = Math.max(1, Math.floor(segmentCount));
  const gapSize = gap ?? strokeWidth / wearProgress.gapOverStroke;
  const gapDegrees = gapSweep(strokeWidth, size, gapSize);
  const segmentSweep = 360 / count;
  const progress = Math.min(1, Math.max(0, fraction));
  const progressInSegments = count * progress;
  const segments: SegmentedPiece[] = [];
  for (let index = 0; index < count; index += 1) {
    const angle = startAngle + (360 * index) / count;
    if (index >= Math.floor(progressInSegments))
      segments.push({
        state: "track",
        segment: indicatorSegment(
          angle,
          segmentSweep,
          gapDegrees,
          strokeWidth,
          size,
        ),
      });
    if (index < progressInSegments) {
      let sweep = segmentSweep * Math.min(1, progressInSegments - index);
      // SegmentedCircularProgressIndicator.kt:216-223: a partially filled
      // segment is clamped up to the gap, because the sub-gap dot is only a
      // mid-animation state and must never be a resting value.
      if (sweep !== 0)
        sweep = Math.max(gapDegrees, Math.min(sweep, segmentSweep));
      segments.push({
        state: "active",
        segment: indicatorSegment(angle, sweep, gapDegrees, strokeWidth, size),
      });
    }
  }
  return {
    gapSweep: gapDegrees,
    radius: Math.max(0, size / 2 - strokeWidth / 2),
    segments,
  };
}

export interface LinearGeometry {
  /** Canvas width after the 2 dp outer margin. */
  width: number;
  strokeWidth: number;
  track: { start: number; end: number };
  active: { start: number; end: number } | null;
  dot: { x: number; y: number; radius: number; opacity: number } | null;
}

/**
 * Linear progress: a full round-capped track, the active stroke measured as
 * `progress * (width - stroke)`, and the independent 2 dp endpoint dot that
 * shrinks and fades as the progress approaches it.
 *
 * LinearProgressIndicator.kt:138-205, LinearProgressIndicatorDefaults.
 */
export function linearGeometry({
  width,
  strokeWidth = wearProgress.linearStroke.large,
  fraction,
}: {
  width: number;
  strokeWidth?: number;
  fraction: number;
}): LinearGeometry {
  const stroke = Math.max(
    wearProgress.linearStroke.small,
    Math.min(strokeWidth, width || strokeWidth),
  );
  const inner = Math.max(0, width - 2 * wearProgress.linearOuterMargin);
  const cap = stroke / 2;
  const progress = Math.min(1, Math.max(0, fraction));
  // LinearProgressIndicator.kt:152 `progress * (size.width - strokeWidth)`.
  const progressLength = progress * (inner - stroke);
  const end = cap + progressLength;
  const dotRadius = wearProgress.linearDotRadius;
  const dotMargin = wearProgress.linearDotMargin;
  const dotCenterX = inner - dotRadius - dotMargin;
  // LinearProgressIndicator.kt:171 measures from the progress length, not the
  // capped end, so the offset is the whole stroke.
  const distance = dotCenterX - dotRadius - progressLength - stroke;
  const scale = distance > 0 ? Math.min(1, distance / dotMargin) : 0;
  return {
    width: inner,
    strokeWidth: stroke,
    track: { start: cap, end: inner - cap },
    active: progressLength > 0 ? { start: cap, end } : null,
    dot:
      distance > 0
        ? {
            x: dotCenterX,
            y: stroke / 2,
            radius: dotRadius * scale,
            opacity: scale,
          }
        : null,
  };
}

export type IndicatorSide = "start" | "end";

export interface LevelGeometry {
  radius: number;
  /** Centre of the circle the level arc belongs to. */
  center: [number, number];
  baseAngle: number;
  sweepAngle: number;
  track: IndicatorSegment;
  active: IndicatorSegment;
  gapSweep: number;
}

/**
 * Level indicator: a nominal 72° arc on the *start* side of the screen (left
 * in LTR, mirrored in RTL), growing from the bottom, with a 6 dp stroke and a
 * radius derived from the screen diameter rather than a fixed path.
 *
 * LevelIndicator.kt:206-232 with `radius = screenWidth / 2 - edgePadding -
 * strokeWidth / 2`.
 */
export function levelGeometry({
  diameter,
  side = "start",
  strokeWidth = wearProgress.levelStroke,
  sweepAngle = wearProgress.levelSweepAngle,
  fraction,
  edgePadding = wearPaddingEdge,
  reverse = false,
}: {
  diameter: number;
  side?: IndicatorSide;
  strokeWidth?: number;
  sweepAngle?: number;
  fraction: number;
  edgePadding?: number;
  reverse?: boolean;
}): LevelGeometry {
  const size = Math.max(0, diameter);
  const radius = Math.max(0, size / 2 - edgePadding - strokeWidth / 2);
  const progress = Math.min(1, Math.max(0, fraction));
  const gapDegrees = gapSweep(strokeWidth, size);
  // Angles are SVG degrees with y downwards, so the *bottom* end of the arc is
  // the one whose sine is positive. On the start (left) side the arc spans
  // 180° ± sweep/2 and grows towards larger angles; on the end (right) side it
  // spans ±sweep/2 and grows towards smaller ones. Both pieces are still
  // expressed as a positive sweep so one path builder serves both sides.
  const base = side === "start" ? 180 : 0;
  const trackStart = side === "start" ? base - sweepAngle / 2 : -sweepAngle / 2;
  const activeSweep = sweepAngle * progress;
  // `trackStart` is the bottom end on the start side and the top end on the
  // end side, so which end fills first depends on the side as well as on
  // `reverseDirection`. Both cases stay a positive sweep.
  const fromBottom =
    side === "start" ? trackStart : trackStart + sweepAngle - activeSweep;
  const fromTop =
    side === "start" ? trackStart + sweepAngle - activeSweep : trackStart;
  const activeStart = reverse ? fromTop : fromBottom;
  return {
    radius,
    center: [size / 2, size / 2],
    baseAngle: base,
    sweepAngle,
    gapSweep: gapDegrees,
    track: indicatorSegment(trackStart, sweepAngle, gapDegrees, strokeWidth, size),
    active: indicatorSegment(
      activeStart,
      activeSweep,
      gapDegrees,
      strokeWidth,
      size,
    ),
  };
}

/** `PaddingDefaults.edgePadding` = 2 dp — LevelIndicator.kt:216, Padding.kt:63. */
export const wearPaddingEdge = wearPadding.edge;

/** Polar to Cartesian in SVG space: 0° is 3 o'clock, angles increase clockwise. */
export function polar(
  center: readonly [number, number],
  radius: number,
  angleDegrees: number,
): [number, number] {
  const angle = angleDegrees * DEG;
  return [
    center[0] + radius * Math.cos(angle),
    center[1] + radius * Math.sin(angle),
  ];
}

/**
 * An `A`-command arc path, or a `<circle>`-style dot when the piece has
 * collapsed. Returns null when nothing should be drawn.
 */
export function segmentPath(
  piece: IndicatorSegment,
  center: readonly [number, number],
  radius: number,
): string | null {
  if (piece.kind === "dot") return null;
  if (piece.sweep <= 0) return null;
  const [x1, y1] = polar(center, radius, piece.startAngle);
  const [x2, y2] = polar(center, radius, piece.startAngle + piece.sweep);
  if (piece.sweep >= 359.999) {
    // A full ring needs two halves; one arc command cannot describe it.
    const [xm, ym] = polar(center, radius, piece.startAngle + 180);
    return `M${x1} ${y1} A${radius} ${radius} 0 1 1 ${xm} ${ym} A${radius} ${radius} 0 1 1 ${x1} ${y1}`;
  }
  const large = piece.sweep > 180 ? 1 : 0;
  return `M${x1} ${y1} A${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
}

export interface PageIndicatorGeometry {
  radius: number;
  center: [number, number];
  trackStroke: number;
  dotRadius: number;
  /** Dot centre in dp, plus the shrink and fade of window-edge dots. */
  dots: {
    index: number;
    angle: number;
    x: number;
    y: number;
    scale: number;
    opacity: number;
  }[];
  /** Angular pitch between dots, degrees. */
  pitch: number;
  anchorAngle: number;
  /** First page index inside the visible window. */
  windowStart: number;
  /** Position of a dot slot; `slot` may be fractional while paging. */
  pointAt: (slot: number) => [number, number];
}

/**
 * Page indicator, measured in dp: 6 dp dots on a 4 dp pitch, an arc radius of
 * `(diameter - trackStroke) / 2 - 2`, and a track stroke of `2 * 3 + 6 = 12`.
 * Dots outside the six-dot window shrink to 0.66 and fade.
 *
 * PageIndicator.kt:207-224, 650-669.
 */
export function pageIndicatorGeometry({
  diameter,
  count,
  progress,
  maxVisible = wearProgress.pageMaxVisible,
  anchorAngle = 90,
  rtl = false,
}: {
  diameter: number;
  count: number;
  progress: number;
  maxVisible?: number;
  anchorAngle?: number;
  rtl?: boolean;
}): PageIndicatorGeometry {
  const total = Math.max(0, Math.floor(count));
  const visible = Math.min(maxVisible, total || 0);
  const trackStroke =
    wearProgress.pageBackgroundRadius * 2 + wearProgress.pageDot;
  const radius = Math.max(
    0,
    (diameter - trackStroke) / 2 - wearPaddingEdge,
  );
  const pitch = radius > 0 ? (10 / radius) / DEG : 0;
  const windowStart = Math.min(
    Math.max(0, Math.round(progress) - Math.floor(visible / 2)),
    Math.max(0, total - visible),
  );
  const center: [number, number] = [diameter / 2, diameter / 2];
  // RTL mirrors the arc: the same slots run the other way round it.
  const angleAt = (slot: number) =>
    anchorAngle + (rtl ? -1 : 1) * (slot - (visible - 1) / 2) * pitch;
  const dots = Array.from({ length: visible }, (_, i) => {
    const edge =
      (i === 0 && windowStart > 0) ||
      (i === visible - 1 && windowStart + visible < total);
    // Dots leaving the window shrink to `smallIndicatorSizeFraction` and fade
    // with `inverseLerp(0, 0.5, sizeRatio)` (PageIndicator.kt:643-656).
    const scale = edge ? wearProgress.pageSmallIndicatorFraction : 1;
    const angle = angleAt(i);
    const [x, y] = polar(center, radius, angle);
    return {
      index: windowStart + i,
      angle,
      x,
      y,
      scale,
      opacity: Math.min(1, scale / 0.5),
    };
  });
  return {
    radius,
    center,
    trackStroke,
    dotRadius: wearProgress.pageDot / 2,
    dots,
    pitch,
    anchorAngle,
    windowStart,
    pointAt: (slot: number) =>
      polar(center, radius, angleAt(Math.min(visible - 1, Math.max(0, slot)))),
  };
}
