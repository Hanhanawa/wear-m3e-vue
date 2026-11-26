<script setup lang="ts">
import { computed, inject, useId } from "vue";
import { curvedKey } from "../curved";
const props = defineProps<{
  text: string;
  radius?: number;
  angle?: number;
  position?: "top" | "bottom";
}>();
const parent = inject(curvedKey, null);
const id = `wear-curved-${useId()}`;
const radius = computed(() =>
  Math.min(115, Math.max(20, props.radius ?? parent?.radius() ?? 102)),
);
const bottom = computed(() =>
  props.position ? props.position === "bottom" : (parent?.bottom() ?? false),
);
const angle = computed(() => props.angle ?? parent?.angle() ?? 0);
const path = computed(
  () =>
    `M${120 - radius.value} 120 A${radius.value} ${radius.value} 0 0 ${bottom.value ? 0 : 1} ${120 + radius.value} 120`,
);
</script>

<template>
  <span class="wear-curved-text"
    ><span class="wear-visually-hidden">{{ text }}</span>
    <svg viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <defs><path :id="id" :d="path" /></defs>
      <text text-anchor="middle" :transform="`rotate(${angle} 120 120)`">
        <textPath :href="`#${id}`" startOffset="50%">{{ text }}</textPath>
      </text>
    </svg>
  </span>
</template>
