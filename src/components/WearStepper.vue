<script setup lang="ts">
import { ref } from "vue";
import WearButton from "./WearButton.vue";
import WearRangeIcon from "./WearRangeIcon.vue";
import { useWearRange } from "../range";
import { useWearRotary } from "../input";

const props = withDefaults(
  defineProps<{
    label: string;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    decreaseLabel?: string;
    increaseLabel?: string;
  }>(),
  { decreaseLabel: "Decrease", increaseLabel: "Increase" },
);
const model = defineModel<number>();
const root = ref<HTMLElement>();
const { min, max, value, ratio, change, adjust, buttonEvents } =
  useWearRange(props, model);
const decreaseEvents = buttonEvents(-1);
const increaseEvents = buttonEvents(1);
useWearRotary(root, adjust);

function key(event: KeyboardEvent) {
  if (props.disabled || event.target !== root.value) return;
  switch (event.key) {
    case "ArrowUp":
      adjust(1);
      break;
    case "ArrowDown":
      adjust(-1);
      break;
    case "Home":
      change(min.value);
      break;
    case "End":
      change(max.value);
      break;
    default:
      return;
  }
  event.preventDefault();
}
</script>

<template>
  <div
    ref="root"
    class="wear-stepper"
    role="group"
    :aria-label="label"
    tabindex="0"
    data-wear-gesture-ignore
    @keydown="key"
  >
    <WearButton
      shape="round"
      variant="tonal"
      class="wear-stepper-button"
      :aria-label="increaseLabel"
      :disabled="disabled || value >= max"
      v-on="increaseEvents"
      ><slot name="increase"
        ><WearRangeIcon increase /></slot
      ></WearButton
    >
    <output class="wear-stepper-value"
      ><slot :value="value" :ratio="ratio">{{ value }}</slot></output
    >
    <WearButton
      shape="round"
      variant="tonal"
      class="wear-stepper-button"
      :aria-label="decreaseLabel"
      :disabled="disabled || value <= min"
      v-on="decreaseEvents"
      ><slot name="decrease"
        ><WearRangeIcon /></slot
      ></WearButton
    >
  </div>
</template>
