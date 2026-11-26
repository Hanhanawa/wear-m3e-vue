<script setup lang="ts">
import { computed, ref, watchPostEffect } from "vue";
import { clamp } from "../geometry";

const props = withDefaults(
  defineProps<{ position?: number; viewport?: number; content?: number }>(),
  { position: 0, viewport: 0, content: 0 },
);

const overlayHeight = 60;
const svg = ref<SVGSVGElement>();
const diameter = ref(0);
watchPostEffect((onCleanup) => {
  if (!svg.value) return;
  const observer = new ResizeObserver(([{ contentRect }]) => {
    // The overlay height is in Wear units, including when the host scales its WebView.
    const { width, height } = contentRect;
    diameter.value = height > 0 ? (width / height) * overlayHeight : 0;
  });
  observer.observe(svg.value);
  onCleanup(() => observer.disconnect());
});

const maximum = computed(() =>
  Number.isFinite(props.content) &&
  Number.isFinite(props.viewport) &&
  props.viewport > 0
    ? Math.max(0, props.content - props.viewport)
    : 0,
);

const strokeWidth = computed(() => (Math.round(diameter.value) >= 225 ? 6 : 5));
const segments = computed(() => {
  const usableRadius = diameter.value / 2 - 2;
  if (maximum.value <= 1 || usableRadius <= 25) return [];

  const radius = usableRadius - strokeWidth.value / 2;
  const gap = 2 * Math.asin((strokeWidth.value + 3) / (2 * usableRadius));
  const sweep = 2 * Math.asin(25 / usableRadius) + gap;
  const size = clamp(props.viewport / props.content, 0.3, 0.7);
  const position = Number.isFinite(props.position)
    ? clamp(props.position / maximum.value, 0, 1)
    : 0;
  const before = (1 - size) * position;
  const point = (angle: number) => [
    diameter.value / 2 + radius * Math.cos(angle),
    overlayHeight / 2 + radius * Math.sin(angle),
  ];

  const boundaries = [0, before, before + size, 1];
  return boundaries.slice(0, -1).map((fraction, index) => {
    const start = (fraction - 0.5) * sweep;
    const length = (boundaries[index + 1] - fraction) * sweep;
    if (length <= gap) {
      const opacity = length / gap;
      const [x, y] = point(start + length / 2);
      return { x, y, radius: (strokeWidth.value / 2) * opacity, opacity };
    }
    const from = point(start + gap / 2);
    const to = point(start + length - gap / 2);
    return { path: `M${from.join(" ")} A${radius} ${radius} 0 0 1 ${to.join(" ")}` };
  });
});
</script>

<template>
  <svg
    v-if="maximum > 1"
    ref="svg"
    :viewBox="`0 0 ${diameter || 1} ${overlayHeight}`"
    :style="{ blockSize: `calc(${overlayHeight} * var(--wear-unit, 1px))` }"
    class="wear-scroll-indicator"
    aria-hidden="true"
    focusable="false"
  >
    <g
      v-for="(segment, index) in segments"
      :key="index"
      :class="index === 1 ? 'wear-scroll-indicator-thumb' : 'wear-scroll-indicator-track'"
    >
      <path
        v-if="segment.path"
        :d="segment.path"
        :stroke-width="strokeWidth"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
      />
      <circle
        v-else-if="segment.opacity"
        :cx="segment.x"
        :cy="segment.y"
        :r="segment.radius"
        :opacity="segment.opacity"
        fill="currentColor"
      />
    </g>
  </svg>
</template>
