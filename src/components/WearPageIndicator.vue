<script setup lang="ts">
import { computed, inject, ref } from "vue";
import { pageIndicatorGeometry } from "../arcs";
import { appKey } from "../context";
import { clamp, normalizedPage } from "../geometry";
import { useLogicalSize } from "../measure";
import { wearProgress } from "../tokens";
import type { WearDirection } from "../types";

/**
 * Page indicator.
 *
 * Dots are 6 dp on a 4 dp pitch and the track is 12 dp wide, all measured in
 * logical dp on an arc of `(diameter - 12) / 2 - 2`. The previous build drew
 * these in a fixed 240 unit space, so a 6.2 "unit" dot became 4.96 dp on a 192
 * screen and 6.2 dp on a 240 one (PageIndicator.kt:207-224, 650-669).
 */
const props = withDefaults(
  defineProps<{
    count: number;
    index?: number;
    progress?: number;
    dir?: WearDirection;
    orientation?: "horizontal" | "vertical";
  }>(),
  { index: 0, dir: "ltr", orientation: "horizontal" },
);

const root = ref<Element>();
const measured = useLogicalSize(root);
/**
 * Prefer the scaffold's measured screen, because the SVG is the only element
 * here and it must not have to render first in order to know its own size.
 */
const app = inject(appKey, null);
const diameter = computed(
  () =>
    app?.diameter.value ||
    Math.min(measured.width.value || 240, measured.height.value || 240),
);

const visible = computed(() => clamp(Math.floor(props.count) || 0, 0, 6));
const progress = computed(() =>
  clamp(
    Number.isFinite(props.progress)
      ? props.progress!
      : normalizedPage(props.index, props.count),
    0,
    Math.max(0, props.count - 1),
  ),
);
const geometry = computed(() =>
  pageIndicatorGeometry({
    diameter: diameter.value,
    count: props.count,
    progress: progress.value,
    maxVisible: wearProgress.pageMaxVisible,
    rtl: props.dir === "rtl",
  }),
);

/** Position of a dot slot, which may be fractional while paging. */
function point(slot: number): [number, number] {
  return geometry.value.pointAt(slot);
}
function segment(start: number, end: number): string {
  const [x, y] = point(start);
  const [u, v] = point(end);
  const r = geometry.value.radius;
  return `M${x} ${y} A${r} ${r} 0 0 ${props.dir === "rtl" ? 1 : 0} ${u} ${v}`;
}

const dots = computed(() =>
  geometry.value.dots.map((dot, index) => ({
    point: [dot.x, dot.y] as [number, number],
    radius: geometry.value.dotRadius * dot.scale,
    opacity: dot.opacity,
    index,
  })),
);
const selected = computed(() => {
  const position = clamp(
    progress.value - geometry.value.windowStart,
    0,
    visible.value - 1,
  );
  const base = Math.floor(position);
  const fraction = position - base;
  return {
    start: base + Math.max(0, 2 * fraction - 1),
    end: base + Math.min(1, 2 * fraction),
  };
});
</script>

<template>
  <svg
    v-if="visible > 1"
    ref="root"
    class="wear-page-indicator"
    :data-orientation="orientation"
    :viewBox="`0 0 ${diameter} ${diameter}`"
    aria-hidden="true"
    focusable="false"
    data-wear-gesture-ignore
  >
    <path
      class="wear-page-indicator-track"
      :d="segment(0, visible - 1)"
      :stroke-width="geometry.trackStroke"
    />
    <circle
      v-for="dot in dots"
      :key="dot.index"
      class="wear-page-indicator-dot"
      :cx="dot.point[0]"
      :cy="dot.point[1]"
      :r="dot.radius"
      :opacity="dot.opacity"
    />
    <circle
      v-if="selected.start === selected.end"
      class="wear-page-indicator-current"
      :cx="point(selected.start)[0]"
      :cy="point(selected.start)[1]"
      :r="geometry.dotRadius"
    />
    <path
      v-else
      class="wear-page-indicator-current-path"
      :d="segment(selected.start, selected.end)"
      :stroke-width="geometry.dotRadius * 2"
    />
  </svg>
</template>
