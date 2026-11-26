<script setup lang="ts">
defineProps<{ text: string; expanded?: boolean }>();
</script>

<template>
  <span class="wear-expanding-label" :data-expanded="expanded">
    <Transition name="wear-fade" mode="out-in"
      ><span :key="text">{{ text }}</span></Transition
    >
  </span>
</template>
