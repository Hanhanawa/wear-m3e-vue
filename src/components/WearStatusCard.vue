<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: "primary" | "tonal";
    actionable?: boolean;
    disabled?: boolean;
  }>(),
  { tone: "tonal" },
);
</script>

<template>
  <component
    :is="actionable ? 'button' : 'article'"
    :type="actionable ? 'button' : undefined"
    :disabled="actionable ? disabled : undefined"
    class="wear-surface wear-status-card"
    :data-tone="tone"
  >
    <span class="wear-surface-visual">
      <span v-if="$slots.icon" class="wear-surface-icon" aria-hidden="true"
        ><slot name="icon"
      /></span>
      <span class="wear-surface-copy">
        <span class="wear-surface-title"><slot /></span>
        <span v-if="$slots.detail" class="wear-surface-detail"
          ><slot name="detail"
        /></span>
      </span>
    </span>
  </component>
</template>
