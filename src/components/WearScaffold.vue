<script setup lang="ts">
import { computed, inject, provide, ref } from "vue";
import type { WearDirection } from "../types";
import { appKey, themeKey } from "../context";

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

provide(appKey, {
  ambient: computed(() => !!props.ambient),
  scrollOffset: ref(0),
});
const theme = inject(themeKey, null);

const style = computed(() => ({
  ...theme?.value,
  "--wear-unit": `${props.hostScale > 0 && Number.isFinite(props.hostScale) ? 1 / props.hostScale : 1}px`,
  "--wear-font-scale":
    Number.isFinite(props.fontScale) && props.fontScale > 0
      ? props.fontScale
      : 1,
}));
</script>

<template>
  <div class="wear-app" :dir="dir" :style="style" :data-ambient="ambient">
    <div class="wear-frame" :data-round="round">
      <div class="wear-app-content" :inert="ambient"><slot /></div>
      <slot name="time" />
    </div>
  </div>
</template>
