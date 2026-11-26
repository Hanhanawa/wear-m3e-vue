<script setup lang="ts">
defineProps<{ increase?: boolean }>();
</script>

<template>
  <span class="wear-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
      <path
        :d="increase ? 'M5 11h6V5h2v6h6v2h-6v6h-2v-6H5z' : 'M5 11h14v2H5z'"
      />
    </svg>
  </span>
</template>
