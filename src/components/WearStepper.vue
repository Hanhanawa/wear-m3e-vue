<script setup lang="ts">
import { ref } from "vue";
import WearButton from "./WearButton.vue";
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
const { min, max, step, value, ratio, change } = useWearRange(props, model);
useWearRotary(root, (delta) => {
  if (!props.disabled) change(value.value + Math.sign(delta) * step.value);
});

function key(event: KeyboardEvent) {
  if (props.disabled || event.target !== root.value) return;
  const changes: Record<string, number> = {
    ArrowUp: value.value + step.value,
    ArrowDown: value.value - step.value,
    Home: min.value,
    End: max.value,
  };
  if (!(event.key in changes)) return;
  event.preventDefault();
  change(changes[event.key]);
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
      :aria-label="increaseLabel"
      :disabled="disabled || value >= max"
      @click="change(value + step)"
      ><slot name="increase"
        ><span aria-hidden="true">+</span></slot
      ></WearButton
    >
    <output class="wear-stepper-value"
      ><slot :value="value" :ratio="ratio">{{ value }}</slot></output
    >
    <WearButton
      shape="round"
      variant="tonal"
      :aria-label="decreaseLabel"
      :disabled="disabled || value <= min"
      @click="change(value - step)"
      ><slot name="decrease"
        ><span aria-hidden="true">−</span></slot
      ></WearButton
    >
  </div>
</template>
