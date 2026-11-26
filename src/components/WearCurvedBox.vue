<script setup lang="ts">
import { computed, inject } from "vue";
import { curvedKey } from "../curved";
const props = withDefaults(
  defineProps<{
    angle?: number;
    radius?: number;
    size?: number;
    rotate?: boolean;
  }>(),
  { size: 24 },
);
const parent = inject(curvedKey, null);
const style = computed(() => {
  const angle =
    (props.angle ?? parent?.angle() ?? 0) + (parent?.bottom() ? 90 : -90);
  const radius = props.radius ?? parent?.radius() ?? 102;
  return {
    left: `${50 + (radius / 2.4) * Math.cos((angle * Math.PI) / 180)}%`,
    top: `${50 + (radius / 2.4) * Math.sin((angle * Math.PI) / 180)}%`,
    width: `${props.size / 2.4}%`,
    height: `${props.size / 2.4}%`,
    transform: `translate(-50%,-50%) rotate(${props.rotate ? angle + 90 : 0}deg)`,
  };
});
</script>

<template>
  <div class="wear-curved-box" :style="style"><slot /></div>
</template>
