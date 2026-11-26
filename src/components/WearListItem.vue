<script setup lang="ts">
withDefaults(defineProps<{ effect?: "content" | "surface" | "none" }>(), {
  effect: "content",
});
</script>

<template>
  <div class="wear-list-item" :data-effect="effect">
    <div class="wear-list-content"><slot /></div>
  </div>
</template>
