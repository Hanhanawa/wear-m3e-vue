<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<template>
  <div class="wear-button-group" role="group" :aria-label="label"><slot /></div>
</template>
