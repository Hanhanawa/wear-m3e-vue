<script setup lang="ts">
import { computed, useSlots } from "vue";
import type { WearButtonVariant } from "../types";

/**
 * The shared button. `variant` selects the colour table, `shape` the geometry
 * family and `size` the icon-button ramp; each family then resolves its own
 * label, detail, icon and border roles in CSS rather than inheriting one
 * generic surface.
 */
const props = withDefaults(
  defineProps<{
    variant?: WearButtonVariant;
    shape?: "row" | "round" | "edge";
    size?: "extra-small" | "small" | "medium" | "large" | "extra-large";
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

const slots = useSlots();
const iconOnly = computed(() => !slots.default && !slots.detail);
</script>

<template>
  <button
    class="wear-control wear-button"
    :data-variant="variant"
    :data-shape="shape"
    :data-size="size"
    :data-compact="compact"
    :data-icon-only="iconOnly || undefined"
    :type="type"
    :disabled="disabled"
    :aria-pressed="pressed"
  >
    <span class="wear-surface-visual wear-button-face">
      <span v-if="$slots.icon" class="wear-icon wear-button-icon" aria-hidden="true"
        ><slot name="icon"
      /></span>
      <span v-if="$slots.default || $slots.detail" class="wear-copy">
        <span v-if="$slots.default" class="wear-label wear-button-label"
          ><slot
        /></span>
        <span v-if="$slots.detail" class="wear-detail wear-button-detail"
          ><slot name="detail"
        /></span>
      </span>
    </span>
  </button>
</template>
