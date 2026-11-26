<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, provide, watch } from "vue";
import { appKey } from "../context";

const props = defineProps<{ active: boolean }>();
const emit = defineEmits<{ tick: [date: Date] }>();
const parent = inject(appKey, null);
if (parent)
  provide(appKey, { ...parent, ambient: computed(() => props.active) });
let timer = 0;
function tick() {
  window.clearTimeout(timer);
  if (!props.active) return;
  emit("tick", new Date());
  timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000));
}
onMounted(tick);
watch(() => props.active, tick);
onUnmounted(() => window.clearTimeout(timer));
</script>

<template>
  <div class="wear-ambient" :data-ambient="active" :inert="active">
    <slot :ambient="active" />
  </div>
</template>
