<script setup lang="ts">
import type { WearTextVariant } from "../types";
withDefaults(
  defineProps<{ as?: string; variant?: WearTextVariant; lines?: number }>(),
  { as: "span", variant: "body" },
);
</script>

<template>
  <component
    :is="as"
    class="wear-text"
    :data-variant="variant"
    :style="lines && lines > 0 ? { '--wear-text-lines': lines } : undefined"
    ><slot
  /></component>
</template>
