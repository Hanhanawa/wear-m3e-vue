<script setup lang="ts">
import { computed } from "vue";
import { arcPoint, clamp, normalizedPage } from "../geometry";
import type { WearDirection } from "../types";

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
const first = computed(() =>
  clamp(
    Math.round(progress.value) - Math.floor(visible.value / 2),
    0,
    Math.max(0, props.count - visible.value),
  ),
);
function point(index: number) {
  return arcPoint(
    props.dir === "rtl" ? visible.value - 1 - index : index,
    visible.value,
  );
}
function segment(start: number, end: number) {
  const [x, y] = point(start);
  const [u, v] = point(end);
  return `M${x} ${y} A110 110 0 0 ${props.dir === "rtl" ? 1 : 0} ${u} ${v}`;
}

const dots = computed(() =>
  Array.from({ length: visible.value }, (_, i) => ({
    point: point(i),
    fade:
      (i === 0 && first.value > 0) ||
      (i === visible.value - 1 && first.value + visible.value < props.count),
  })),
);
const selected = computed(() => {
  const position = clamp(progress.value - first.value, 0, visible.value - 1);
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
    class="wear-page-indicator"
    :data-orientation="orientation"
    viewBox="0 0 240 240"
    aria-hidden="true"
    focusable="false"
    data-wear-gesture-ignore
  >
    <path class="wear-page-indicator-track" :d="segment(0, visible - 1)" />
    <circle
      v-for="(dot, i) in dots"
      :key="i"
      class="wear-page-indicator-dot"
      :cx="dot.point[0]"
      :cy="dot.point[1]"
      :r="dot.fade ? 2 : 3.1"
    />
    <circle
      v-if="selected.start === selected.end"
      class="wear-page-indicator-current"
      :cx="point(selected.start)[0]"
      :cy="point(selected.start)[1]"
      r="3.1"
    />
    <path
      v-else
      class="wear-page-indicator-current-path"
      :d="segment(selected.start, selected.end)"
    />
  </svg>
</template>
