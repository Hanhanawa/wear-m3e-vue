<script setup lang="ts">
withDefaults(
  defineProps<{ level?: 1 | 2 | 3 | 4 | 5 | 6; subheader?: boolean }>(),
  { level: 2 },
);
</script>

<template>
  <component
    :is="`h${level}`"
    class="wear-list-header"
    :data-subheader="subheader"
  >
    <span v-if="$slots.icon" class="wear-icon" aria-hidden="true"
      ><slot name="icon" /></span
    ><slot />
  </component>
</template>
