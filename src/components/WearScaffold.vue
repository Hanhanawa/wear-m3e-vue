<script setup lang="ts">
import { computed } from "vue";
import type { WearDirection } from "../types";

const props = withDefaults(
  defineProps<{
    round?: boolean;
    dir?: WearDirection;
    hostScale?: number;
    fontScale?: number;
  }>(),
  { round: true, hostScale: 1, fontScale: 1 },
);

const style = computed(() => ({
  "--wear-unit": `${props.hostScale > 0 && Number.isFinite(props.hostScale) ? 1 / props.hostScale : 1}px`,
  "--wear-font-scale":
    Number.isFinite(props.fontScale) && props.fontScale > 0
      ? props.fontScale
      : 1,
}));
</script>

<template>
  <div class="wear-app" :dir="dir" :style="style">
    <div class="wear-frame" :data-round="round">
      <slot />
      <slot name="time" />
    </div>
  </div>
</template>
