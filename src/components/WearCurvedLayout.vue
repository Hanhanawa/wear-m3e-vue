<script setup lang="ts">
import { provide } from "vue";
import { curvedKey } from "../curved";
const props = withDefaults(
  defineProps<{
    radius?: number;
    angle?: number;
    position?: "top" | "bottom";
  }>(),
  { radius: 102, angle: 0, position: "top" },
);
provide(curvedKey, {
  radius: () => props.radius,
  angle: () => props.angle,
  bottom: () => props.position === "bottom",
});
</script>

<template>
  <div class="wear-curved-layout"><slot /></div>
</template>
