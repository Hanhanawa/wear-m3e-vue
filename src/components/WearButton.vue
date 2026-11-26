<script setup lang="ts">
import type { WearButtonVariant } from "../types";

withDefaults(
  defineProps<{
    variant?: WearButtonVariant;
    shape?: "row" | "round" | "edge";
    size?: "small" | "medium" | "large";
    compact?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    pressed?: boolean;
  }>(),
  {
    variant: "filled",
    shape: "row",
    size: "medium",
    type: "button",
    pressed: undefined,
  },
);
</script>

<template>
  <button
    class="wear-control wear-button"
    :data-variant="variant"
    :data-shape="shape"
    :data-size="size"
    :data-compact="compact"
    :type="type"
    :disabled="disabled"
    :aria-pressed="pressed"
  >
    <span class="wear-surface-visual wear-button-face">
      <span v-if="$slots.icon" class="wear-icon" aria-hidden="true"
        ><slot name="icon"
      /></span>
      <span v-if="$slots.default || $slots.detail" class="wear-copy">
        <span v-if="$slots.default" class="wear-label"><slot /></span>
        <span v-if="$slots.detail" class="wear-detail"
          ><slot name="detail"
        /></span>
      </span>
    </span>
  </button>
</template>
