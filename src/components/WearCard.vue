<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "filled" | "tonal" | "outlined";
    actionable?: boolean;
    disabled?: boolean;
  }>(),
  { variant: "tonal" },
);
</script>

<template>
  <component
    :is="actionable ? 'button' : 'article'"
    class="wear-surface wear-card"
    :data-variant="variant"
    :type="actionable ? 'button' : undefined"
    :disabled="actionable ? disabled : undefined"
  >
    <span class="wear-surface-visual wear-card-face">
      <span v-if="$slots.media" class="wear-card-media"
        ><slot name="media"
      /></span>
      <span
        v-if="$slots.icon || $slots.name || $slots.time"
        class="wear-card-metadata"
      >
        <span v-if="$slots.icon" class="wear-icon" aria-hidden="true"
          ><slot name="icon"
        /></span>
        <span v-if="$slots.name"><slot name="name" /></span>
        <span v-if="$slots.time" class="wear-card-time"
          ><slot name="time"
        /></span>
      </span>
      <span v-if="$slots.title" class="wear-label"><slot name="title" /></span>
      <span v-if="$slots.subtitle" class="wear-detail"
        ><slot name="subtitle"
      /></span>
      <span v-if="$slots.default" class="wear-card-content"><slot /></span>
    </span>
  </component>
</template>
