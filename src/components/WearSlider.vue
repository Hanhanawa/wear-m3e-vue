<script setup lang="ts">
import { computed, ref } from "vue";
import { useWearRange } from "../range";
import { useWearRotary } from "../input";
import WearRangeIcon from "./WearRangeIcon.vue";

const props = withDefaults(
  defineProps<{
    label: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    segmented?: boolean;
    valueText?: string;
    decreaseLabel?: string;
    increaseLabel?: string;
  }>(),
  { decreaseLabel: "Decrease", increaseLabel: "Increase" },
);
const model = defineModel<number>();
const root = ref<HTMLElement>();
const { min, max, step, value, ratio, change, adjust, buttonEvents } =
  useWearRange(props, model);
const decreaseEvents = buttonEvents(-1);
const increaseEvents = buttonEvents(1);
const segments = computed(() =>
  props.segmented
    ? Math.min(
        20,
        Math.max(1, Math.round((max.value - min.value) / step.value)),
      )
    : 1,
);
useWearRotary(root, adjust);

function input(event: Event) {
  change((event.target as HTMLInputElement).valueAsNumber);
}
</script>

<template>
  <div
    ref="root"
    class="wear-slider"
    :data-disabled="disabled"
    data-wear-gesture-ignore
  >
    <button
      type="button"
      class="wear-control wear-slider-button"
      :aria-label="decreaseLabel"
      :disabled="disabled || value <= min"
      v-on="decreaseEvents"
    >
      <slot name="decrease"><WearRangeIcon /></slot>
    </button>
    <span
      class="wear-slider-track"
      :style="{
        '--wear-range-progress': `${ratio * 100}%`,
        '--wear-range-segments': segments,
      }"
      :data-segmented="segmented"
      @click.stop
    >
      <span class="wear-slider-fill" aria-hidden="true" />
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="value"
        :disabled="disabled || min === max"
        :aria-label="label"
        :aria-valuetext="valueText"
        @input="input"
      />
    </span>
    <button
      type="button"
      class="wear-control wear-slider-button"
      :aria-label="increaseLabel"
      :disabled="disabled || value >= max"
      v-on="increaseEvents"
    >
      <slot name="increase"><WearRangeIcon increase /></slot>
    </button>
  </div>
</template>
