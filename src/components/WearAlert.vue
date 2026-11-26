<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: "warning" | "error";
    actionable?: boolean;
    disabled?: boolean;
  }>(),
  { tone: "warning" },
);
</script>

<template>
  <component
    :is="actionable ? 'button' : 'div'"
    :type="actionable ? 'button' : undefined"
    :disabled="actionable ? disabled : undefined"
    class="wear-surface wear-alert"
    :data-tone="tone"
  >
    <span class="wear-surface-visual">
      <span v-if="$slots.icon" class="wear-surface-icon" aria-hidden="true"
        ><slot name="icon"
      /></span>
      <span class="wear-surface-copy"><slot /></span>
    </span>
  </component>
</template>
