<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { clamp, gestureAxis } from "../geometry";
import WearButton from "./WearButton.vue";
import WearProgressIndicator from "./WearProgressIndicator.vue";

const refreshing = defineModel<boolean>({ default: false });
const props = withDefaults(
  defineProps<{ label?: string; loadingLabel?: string; disabled?: boolean }>(),
  { label: "Refresh", loadingLabel: "Refreshing" },
);
const emit = defineEmits<{ refresh: [] }>();
const root = ref<HTMLElement>();
// Wear Compose applies 50% resistance to the 34 dp refresh threshold.
const threshold = 68;
const pull = ref(0);
const progress = computed(() => Math.min(pull.value / threshold, 1));
const travel = computed(() => {
  if (refreshing.value) return threshold;
  const tension = clamp(pull.value / threshold - 1, 0, 2);
  return threshold * (progress.value + tension - tension ** 2 / 4);
});
let start: { id: number; x: number; y: number; unit: number } | undefined;
let requested = false;

function reset() {
  start = undefined;
  pull.value = 0;
}

function begin(event: TouchEvent) {
  reset();
  if (
    props.disabled ||
    refreshing.value ||
    event.touches.length !== 1 ||
    !root.value
  ) return;
  const scroll = (event.target as Element)?.closest(".wear-list-viewport");
  if (scroll && scroll.scrollTop > 0) return;
  const touch = event.touches[0];
  const scale =
    root.value.getBoundingClientRect().height / root.value.clientHeight || 1;
  const unit =
    parseFloat(getComputedStyle(root.value).getPropertyValue("--wear-unit")) || 1;
  start = {
    id: touch.identifier,
    x: touch.clientX,
    y: touch.clientY,
    unit: unit * scale,
  };
}

function move(event: TouchEvent) {
  if (!start) return;
  const touch = event.touches[0];
  if (
    props.disabled ||
    refreshing.value ||
    event.defaultPrevented ||
    !event.cancelable ||
    event.touches.length !== 1 ||
    touch.identifier !== start.id
  ) {
    reset();
    return;
  }
  const horizontal = (touch.clientX - start.x) / start.unit;
  const vertical = (touch.clientY - start.y) / start.unit;
  if (pull.value === 0) {
    const axis = gestureAxis(horizontal, vertical, 8);
    if (axis === "x" || vertical < 0) reset();
    if (axis !== "y" || vertical <= 0) return;
  }
  event.preventDefault();
  event.stopPropagation();
  pull.value = Math.max(0, vertical);
}

function refresh() {
  if (props.disabled || refreshing.value || requested) return;
  requested = true;
  refreshing.value = true;
  emit("refresh");
  void nextTick(() => {
    requested = false;
  });
}

function end() {
  if (pull.value > threshold) refresh();
  reset();
}
</script>

<template>
  <div
    ref="root"
    class="wear-refresh"
    @touchstart.passive="begin"
    @touchmove="move"
    @touchend.passive="end"
    @touchcancel.passive="reset"
  >
    <slot />
    <div
      class="wear-refresh-overlay"
      :aria-hidden="!refreshing && pull === 0"
    >
      <div
        class="wear-refresh-progress"
        :data-pulling="pull > 0 && !refreshing"
        :style="{ '--wear-refresh-travel': travel }"
      >
        <WearProgressIndicator v-if="refreshing" :label="loadingLabel" />
        <svg
          v-else
          viewBox="0 0 16 16"
          role="progressbar"
          :aria-label="label"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(progress * 100)"
        >
          <circle
            cx="8"
            cy="8"
            r="5.5"
            pathLength="100"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            transform="rotate(-90 8 8)"
            :stroke-dasharray="`${progress * 80} 100`"
          />
          <path
            d="M11 6h5l-2.5 4z"
            fill="currentColor"
            :transform="`rotate(${progress * 288 - 90} 8 8)`"
          />
        </svg>
      </div>
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
