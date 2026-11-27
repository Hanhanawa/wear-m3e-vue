<script setup lang="ts">
import { computed, inject, provide, ref } from "vue";
import type { WearDirection } from "../types";
import { appKey, themeKey } from "../context";
import { screenRatio, useLogicalSize } from "../measure";

const props = withDefaults(
  defineProps<{
    round?: boolean;
    dir?: WearDirection;
    hostScale?: number;
    fontScale?: number;
    ambient?: boolean;
  }>(),
  { round: true, hostScale: 1, fontScale: 1 },
);

/**
 * The frame is the screen. Its logical dp size drives the defaults that native
 * picks from `ScreenSize` (progress strokes, indicator widths) and the radius
 * every full-screen arc is drawn on.
 */
const frame = ref<Element>();
const { width, height } = useLogicalSize(frame);
const diameter = computed(() =>
  Math.min(width.value || 0, height.value || 0) || 0,
);
const ratio = computed(() => screenRatio(diameter.value));
/** Used by the CSS vars before the first measurement lands. */
const screenDp = computed(() => diameter.value || 192);

provide(appKey, {
  ambient: computed(() => !!props.ambient),
  scrollOffset: ref(0),
  diameter,
  screenRatio: ratio,
  round: computed(() => props.round !== false),
});
const theme = inject(themeKey, null);

const style = computed(() => ({
  ...theme?.value,
  "--wear-unit": `${props.hostScale > 0 && Number.isFinite(props.hostScale) ? 1 / props.hostScale : 1}px`,
  "--wear-font-scale":
    Number.isFinite(props.fontScale) && props.fontScale > 0
      ? props.fontScale
      : 1,
  "--wear-screen-diameter": `${screenDp.value}`,
  "--wear-screen-ratio": `${ratio.value}`,
}));
</script>

<template>
  <div class="wear-app" :dir="dir" :style="style" :data-ambient="ambient">
    <div ref="frame" class="wear-frame" :data-round="round">
      <div class="wear-app-content" :inert="ambient"><slot /></div>
      <slot name="time" />
    </div>
  </div>
</template>
