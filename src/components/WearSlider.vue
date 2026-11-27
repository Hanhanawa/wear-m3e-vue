<script setup lang="ts">
import { computed, ref } from "vue";
import { useWearRange } from "../range";
import { useWearRotary } from "../input";
import { wearProgress } from "../tokens";
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
/**
 * Separator dots, capped by `SliderDefaults.MaxSegmentSteps`: the native
 * segmented slider keeps its density inside that range instead of drawing one
 * dot per step of a fine-grained control (Slider.kt:131, :309, :334).
 */
const segments = computed(() =>
  props.segmented
    ? Math.min(
        wearProgress.sliderMaxSegmentSteps,
        Math.max(1, Math.round((max.value - min.value) / step.value)),
      )
    : 1,
);
/** `visibleSegments = steps + 1`, and a separator sits between neighbours. */
const separators = computed(() => {
  if (!props.segmented) return [];
  const visible = segments.value + 1;
  return Array.from({ length: segments.value }, (_, index) => {
    const position = (index + 1) / visible;
    return {
      index: index + 1,
      visible,
      // A dot on the completed side takes the indicator separator role.
      onActive: position <= ratio.value + 1e-6,
    };
  });
});
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
      <span class="wear-slider-bar" aria-hidden="true" />
      <span class="wear-slider-fill" aria-hidden="true" />
      <span
        v-for="dot in separators"
        :key="dot.index"
        class="wear-slider-separator"
        :data-on="dot.onActive ? 'active' : 'track'"
        :style="{
          '--wear-separator-index': dot.index,
          '--wear-separator-count': dot.visible,
        }"
        aria-hidden="true"
      />
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
