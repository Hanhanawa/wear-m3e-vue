<script setup lang="ts">
import { computed, inject, ref, type CSSProperties } from "vue";
import {
  circularGeometry,
  levelGeometry,
  linearGeometry,
  segmentPath,
  segmentedGeometry,
  type IndicatorSegment,
} from "../arcs";
import { appKey } from "../context";
import { useLogicalSize } from "../measure";
import { wearProgress } from "../tokens";
import type { WearIndicatorSide } from "../types";

/**
 * Progress indicators.
 *
 * The five variants deliberately do not share one path template: each family
 * has its own contract in the fixed Wear Material 3 sources and they disagree
 * about gaps, caps, direction, colour roles and resting size. They share only
 * `src/arcs.ts`, which is where the geometry itself lives.
 *
 * Sizes are logical dp throughout. The SVG `viewBox` is the component size in
 * dp, so one user unit is one dp and a 6 dp stroke stays 6 dp on a 192 and a
 * 240 screen alike.
 */
const props = withDefaults(
  defineProps<{
    value?: number;
    min?: number;
    max?: number;
    variant?: "circular" | "linear" | "arc" | "segmented" | "level";
    segments?: number;
    label?: string;
    valueText?: string;
    /**
     * Logical dp box size. Defaults to the native resting size of each family:
     * 24 dp for an indeterminate circular indicator
     * (`IndeterminateCircularIndicatorDiameter`) and 48 dp otherwise. Linear
     * indicators fill their container and ignore it.
     */
    size?: number;
    /** "large"/"small" follow the screen size, a number is an explicit dp stroke. */
    stroke?: number | "large" | "small";
    /** Physical gap between stroke caps, excluding the caps themselves. */
    gap?: number;
    side?: WearIndicatorSide;
    reverse?: boolean;
    startAngle?: number;
    endAngle?: number;
    /** Nominal arc sweep for a level indicator, LevelIndicatorDefaults.SweepAngle. */
    sweepAngle?: number;
    /** Map `min`/`max` onto the fraction, as StepperLevelIndicator does. */
    stepper?: boolean;
    /** Wrap values above `max` and paint the remainder with the overflow track. */
    overflow?: boolean;
    disabled?: boolean;
  }>(),
  {
    min: 0,
    max: 100,
    variant: "circular",
    segments: 5,
    label: "Progress",
    size: undefined,
    stroke: "large",
    gap: undefined,
    side: "start",
    reverse: false,
    startAngle: undefined,
    endAngle: undefined,
    sweepAngle: undefined,
    stepper: false,
    overflow: false,
    disabled: false,
  },
);

const app = inject(appKey, null);
const root = ref<Element>();
const measured = useLogicalSize(root);

const pending = computed(() => props.value === undefined);
const span = computed(() => {
  const lower = Number.isFinite(props.min) ? props.min : 0;
  return Number.isFinite(props.max) && props.max > lower
    ? props.max - lower
    : 100;
});
const raw = computed(() =>
  Number.isFinite(props.value) ? (props.value! - props.min) / span.value : 0,
);
/** `wrapProgress` — overflow wraps around, otherwise the fraction is clamped. */
const fraction = computed(() => {
  if (props.overflow && raw.value > 1) {
    const wrapped = Math.round((raw.value % 1) * 1e5) / 1e5;
    return wrapped === 0 ? 1 : wrapped;
  }
  return Math.min(1, Math.max(0, raw.value));
});
const overflowActive = computed(() => props.overflow && raw.value > 1);
const segments = computed(() =>
  Number.isFinite(props.segments)
    ? Math.min(24, Math.max(1, Math.floor(props.segments)))
    : 5,
);

const stroke = computed(() => {
  if (typeof props.stroke === "number") return props.stroke;
  if (props.variant === "linear")
    return props.stroke === "large"
      ? wearProgress.linearStroke.large
      : wearProgress.linearStroke.small;
  if (props.variant === "level") return wearProgress.levelStroke;
  if (props.variant === "arc") return wearProgress.arcStroke;
  if (pending.value && props.variant === "circular")
    return wearProgress.indeterminateStroke;
  const [small, large] =
    props.stroke === "small"
      ? wearProgress.circularSmallStroke
      : wearProgress.circularLargeStroke;
  // `largeStrokeWidth` / `smallStrokeWidth` are chosen from ScreenSize.
  return small + (large - small) * (app ? app.screenRatio.value : 0);
});

const canvas = computed(() => {
  if (props.variant === "level")
    // A level indicator is drawn on the screen circle, not its own box.
    return measured.width.value || measured.height.value || 240;
  const size =
    props.size ??
    (pending.value && props.variant === "circular"
      ? wearProgress.indeterminateDiameter
      : 48);
  return Math.max(size, stroke.value);
});
const center = computed<[number, number]>(() => [canvas.value / 2, canvas.value / 2]);
const arcRadius = computed(() => Math.max(0, canvas.value / 2 - stroke.value / 2));

type Piece = {
  d: string | null;
  dot: { x: number; y: number; r: number; opacity: number } | null;
  role: "active" | "track" | "overflow";
};

function piece(segment: IndicatorSegment, role: Piece["role"]): Piece | null {
  if (segment.kind === "dot") {
    if (segment.radius <= 0 || segment.opacity <= 0) return null;
    const angle = (segment.angle * Math.PI) / 180;
    return {
      d: null,
      dot: {
        x: center.value[0] + arcRadius.value * Math.cos(angle),
        y: center.value[1] + arcRadius.value * Math.sin(angle),
        r: segment.radius,
        opacity: segment.opacity,
      },
      role,
    };
  }
  if (segment.sweep <= 0) return null;
  const d = segmentPath(segment, center.value, arcRadius.value);
  return d ? { d, dot: null, role } : null;
}

const pieces = computed<Piece[]>(() => {
  const list: (Piece | null)[] = [];

  if (props.variant === "segmented") {
    const geometry = segmentedGeometry({
      diameter: canvas.value,
      strokeWidth: stroke.value,
      segmentCount: segments.value,
      fraction: fraction.value,
      gap: props.gap,
      startAngle: props.startAngle ?? wearProgress.startAngle,
    });
    for (const entry of geometry.segments)
      // With overflow allowed, the *remainder* of the ring takes the overflow
      // track colour and the wrapped arc itself stays the indicator colour.
      list.push(
        piece(
          entry.segment,
          entry.state === "track" && overflowActive.value
            ? "overflow"
            : entry.state,
        ),
      );
    return list.filter((entry): entry is Piece => !!entry);
  }

  if (props.variant === "arc") {
    // ArcProgressIndicatorDefaults: an indeterminate arc from 65° to 115° with
    // independent head and tail motion. A `value` here is this library's
    // extension, not the native API, so it draws inside the same span.
    const start = props.startAngle ?? wearProgress.arcStart;
    const end = props.endAngle ?? wearProgress.arcEnd;
    const sweep = (((end - start) % 360) + 360) % 360;
    list.push(
      piece({ kind: "arc", startAngle: start, sweep }, "track"),
      // Indeterminate arcs animate this piece with a travelling head and tail;
      // determinate ones (a library extension) draw the completed fraction.
      piece({
        kind: "arc",
        startAngle: start,
        sweep: pending.value ? sweep : sweep * fraction.value,
      }, "active"),
    );
    return list.filter((entry): entry is Piece => !!entry);
  }

  if (props.variant === "level") {
    const geometry = levelGeometry({
      diameter: canvas.value,
      side: props.side,
      strokeWidth: stroke.value,
      sweepAngle: props.sweepAngle ?? wearProgress.levelSweepAngle,
      fraction: fraction.value,
      reverse: props.reverse,
    });
    list.push(piece(geometry.track, "track"));
    if (fraction.value > 0) list.push(piece(geometry.active, "active"));
    return list.filter((entry): entry is Piece => !!entry);
  }

  const geometry = circularGeometry({
    diameter: canvas.value,
    strokeWidth: stroke.value,
    fraction: fraction.value,
    gap: props.gap,
    startAngle: props.startAngle ?? wearProgress.startAngle,
    endAngle: props.endAngle ?? props.startAngle ?? wearProgress.startAngle,
  });
  list.push(
    piece(geometry.track, overflowActive.value ? "overflow" : "track"),
    piece(geometry.active, "active"),
  );
  return list.filter((entry): entry is Piece => !!entry);
});

/* ---------------------------------------------------------------- linear */

const linear = computed(() =>
  props.variant === "linear"
    ? linearGeometry({
        width: measured.width.value || 0,
        strokeWidth: stroke.value,
        fraction: fraction.value,
      })
    : null,
);

const lineActive = computed<CSSProperties>(() => {
  const geometry = linear.value;
  if (!geometry) return {};
  if (!measured.width.value)
    // Before the first measurement lands, fall back to a percentage of the
    // track so the bar is never painted empty for a frame.
    return { inlineSize: `${fraction.value * 100}%`, insetInlineStart: "0" };
  if (!geometry.active) return { inlineSize: "0" };
  const { start, end } = geometry.active;
  return {
    // The DOM capsule carries its own round caps, so it starts one half-stroke
    // before the native line and ends one half-stroke after it.
    insetInlineStart: `calc(${Math.max(0, start - geometry.strokeWidth / 2)} * var(--wear-unit))`,
    inlineSize: `calc(${end - start + geometry.strokeWidth} * var(--wear-unit))`,
  };
});

const lineDot = computed<CSSProperties | null>(() => {
  const geometry = linear.value;
  if (!geometry?.dot || !measured.width.value) return null;
  const { radius } = geometry.dot;
  return {
    insetInlineStart: `calc(${geometry.dot.x - radius} * var(--wear-unit))`,
    inlineSize: `calc(${radius * 2} * var(--wear-unit))`,
    blockSize: `calc(${radius * 2} * var(--wear-unit))`,
    opacity: geometry.dot.opacity,
  };
});
</script>

<template>
  <div
    ref="root"
    class="wear-progress"
    :data-variant="variant"
    :data-pending="pending"
    :data-disabled="disabled"
    :data-overflow="overflowActive || undefined"
    :data-side="variant === 'level' ? side : undefined"
    :style="{
      '--wear-progress-box': `${canvas}px`,
      '--wear-progress-stroke': `calc(${stroke} * var(--wear-unit))`,
    }"
    role="progressbar"
    :aria-label="label"
    :aria-valuemin="pending ? undefined : min"
    :aria-valuemax="pending ? undefined : max"
    :aria-valuenow="pending ? undefined : value"
    :aria-valuetext="valueText"
  >
    <span v-if="variant === 'linear'" class="wear-progress-line" aria-hidden="true">
      <span class="wear-progress-line-active" :style="lineActive" />
      <span v-if="lineDot" class="wear-progress-line-dot" :style="lineDot" />
    </span>
    <svg
      v-else
      :viewBox="`0 0 ${canvas} ${canvas}`"
      aria-hidden="true"
      focusable="false"
    >
      <g
        v-if="pending && variant === 'circular'"
        class="wear-progress-indeterminate"
      >
        <g class="wear-progress-indeterminate-phase">
          <circle
            class="wear-progress-track wear-progress-indeterminate-track"
            :cx="center[0]"
            :cy="center[1]"
            :r="arcRadius"
            :stroke-width="stroke"
            pathLength="100"
          />
          <circle
            class="wear-progress-active wear-progress-indeterminate-active"
            :cx="center[0]"
            :cy="center[1]"
            :r="arcRadius"
            :stroke-width="stroke"
            pathLength="100"
          />
        </g>
      </g>
      <g v-else class="wear-progress-pieces">
        <template v-for="(entry, index) in pieces" :key="index">
          <path
            v-if="entry.d"
            :d="entry.d"
            :class="`wear-progress-${entry.role}`"
            :stroke-width="stroke"
            pathLength="100"
          />
          <circle
            v-else-if="entry.dot"
            :cx="entry.dot.x"
            :cy="entry.dot.y"
            :r="entry.dot.r"
            :opacity="entry.dot.opacity"
            :class="`wear-progress-${entry.role}`"
          />
        </template>
      </g>
    </svg>
  </div>
</template>
