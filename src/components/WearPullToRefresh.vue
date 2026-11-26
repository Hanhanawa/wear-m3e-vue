<script setup lang="ts">
import { ref } from "vue";
import WearButton from "./WearButton.vue";
import WearProgressIndicator from "./WearProgressIndicator.vue";

const refreshing = defineModel<boolean>({ default: false });
withDefaults(
  defineProps<{ label?: string; loadingLabel?: string; disabled?: boolean }>(),
  { label: "Refresh", loadingLabel: "Refreshing" },
);
const emit = defineEmits<{ refresh: [] }>();
const pull = ref(0);
let start: { x: number; y: number } | null = null;
function begin(event: TouchEvent) {
  if (refreshing.value || event.touches.length !== 1) return;
  const scroll = (event.target as Element)?.closest(".wear-list-viewport");
  if (scroll && scroll.scrollTop > 0) return;
  start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}
function move(event: TouchEvent) {
  if (!start || event.touches.length !== 1) {
    start = null;
    pull.value = 0;
    return;
  }
  const horizontal = event.touches[0].clientX - start.x;
  const vertical = event.touches[0].clientY - start.y;
  if (
    (Math.abs(horizontal) > 8 && Math.abs(horizontal) > vertical) ||
    vertical < 0
  ) {
    start = null;
    pull.value = 0;
    return;
  }
  if (vertical > 8 && event.cancelable) {
    event.preventDefault();
    event.stopPropagation();
    pull.value = Math.min(80, vertical);
  }
}
function refresh() {
  if (!refreshing.value) {
    refreshing.value = true;
    emit("refresh");
  }
}
function end() {
  if (pull.value >= 56) refresh();
  pull.value = 0;
  start = null;
}
</script>

<template>
  <div
    class="wear-refresh"
    @touchstart.passive="!disabled && begin($event)"
    @touchmove="!disabled && move($event)"
    @touchend.passive="!disabled && end()"
    @touchcancel.passive="
      pull = 0;
      start = null;
    "
  >
    <slot />
    <div v-if="refreshing || pull > 0" class="wear-refresh-progress">
      <WearProgressIndicator
        :value="refreshing ? undefined : (pull / 56) * 100"
        :label="loadingLabel"
      />
    </div>
    <WearButton
      class="wear-refresh-access"
      variant="tonal"
      :disabled="disabled || refreshing"
      @click="refresh"
      >{{ refreshing ? loadingLabel : label }}</WearButton
    >
  </div>
</template>
