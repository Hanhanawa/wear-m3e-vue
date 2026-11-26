<script setup lang="ts">
withDefaults(defineProps<{ level?: 1 | 2 | 3 | 4 | 5 | 6 }>(), { level: 1 });
</script>

<template>
  <component :is="`h${level}`" class="wear-title"><slot /></component>
</template>
