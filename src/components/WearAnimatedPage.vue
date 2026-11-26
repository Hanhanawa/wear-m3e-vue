<script setup lang="ts">
withDefaults(defineProps<{ active?: boolean }>(), { active: true });
</script>

<template>
  <div
    class="wear-animated-page"
    :inert="!active"
    :aria-hidden="!active || undefined"
    :data-active="active"
  >
    <slot />
  </div>
</template>
