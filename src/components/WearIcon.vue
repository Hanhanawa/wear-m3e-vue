<script setup lang="ts">
defineProps<{ label?: string }>();
</script>

<template>
  <span
    class="wear-icon"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    ><slot
  /></span>
</template>
