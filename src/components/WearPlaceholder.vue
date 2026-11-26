<script setup lang="ts">
withDefaults(
  defineProps<{ loading?: boolean; shimmer?: boolean; label?: string }>(),
  { loading: true, shimmer: true },
);
</script>

<template>
  <div class="wear-placeholder-host" :aria-busy="loading">
    <div
      v-if="loading"
      class="wear-placeholder"
      :data-shimmer="shimmer"
      :role="label ? 'status' : undefined"
      :aria-hidden="label ? undefined : 'true'"
    >
      <span v-if="label" class="wear-visually-hidden">{{ label }}</span>
    </div>
    <slot v-else />
  </div>
</template>
