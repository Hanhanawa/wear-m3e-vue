<script setup lang="ts">
import WearText from "./WearText.vue";
import type { WearTextVariant } from "../types";
defineProps<{ value: string | number; variant?: WearTextVariant }>();
</script>

<template>
  <span class="wear-animated-text" aria-live="polite" aria-atomic="true">
    <Transition name="wear-text-change" mode="out-in"
      ><WearText :key="value" :variant="variant">{{
        value
      }}</WearText></Transition
    >
  </span>
</template>
