<script setup lang="ts">
import WearButton from "./WearButton.vue";
import type { WearButtonVariant } from "../types";

const checked = defineModel<boolean>({ default: false });
withDefaults(
  defineProps<{
    disabled?: boolean;
    variant?: WearButtonVariant;
    size?: "small" | "medium" | "large";
  }>(),
  { variant: "tonal" },
);
</script>

<template>
  <WearButton
    class="wear-toggle"
    shape="round"
    :variant="checked ? 'filled' : variant"
    :size="size"
    :disabled="disabled"
    :pressed="checked"
    @click="checked = !checked"
  >
    <template v-if="$slots.icon" #icon
      ><slot name="icon" :checked="checked"
    /></template>
    <slot v-if="$slots.default" :checked="checked" />
  </WearButton>
</template>
