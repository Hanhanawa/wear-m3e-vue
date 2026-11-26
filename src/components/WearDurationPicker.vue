<script setup lang="ts">
import { computed } from "vue";
import WearPicker from "./WearPicker.vue";
import WearPickerGroup from "./WearPickerGroup.vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    labels?: Partial<Record<"hours" | "minutes" | "seconds", string>>;
    maxHours?: number;
    hours?: boolean;
    seconds?: boolean;
    locale?: string;
    disabled?: boolean;
  }>(),
  { label: "Duration", maxHours: 23, hours: true, seconds: true },
);
const model = defineModel<number>({ default: 0 });
const maxHours = computed(() =>
  Number.isFinite(props.maxHours)
    ? Math.max(0, Math.min(999, Math.trunc(props.maxHours)))
    : 23,
);
const value = computed(() =>
  Number.isFinite(model.value)
    ? Math.max(
        0,
        Math.min(
          Math.trunc(model.value),
          (props.hours ? maxHours.value : 0) * 3600 + 3599,
        ),
      )
    : 0,
);
const parts = computed(() => ({
  hours: Math.floor(value.value / 3600),
  minutes: Math.floor(value.value / 60) % 60,
  seconds: value.value % 60,
}));
type Part = keyof typeof parts.value;
const fields = computed<Part[]>(() => {
  const order: Part[] = ["minutes"];
  if (props.hours) order.unshift("hours");
  if (props.seconds) order.push("seconds");
  return order;
});
const options = computed(() => {
  const numeric = new Intl.NumberFormat(props.locale, {
    useGrouping: false,
    minimumIntegerDigits: 2,
  });
  const make = (count: number) =>
    Array.from({ length: count }, (_, value) => ({
      value,
      label: numeric.format(value),
    }));
  return {
    hours: make(maxHours.value + 1),
    minutes: make(60),
    seconds: make(60),
  };
});
const labels = { hours: "Hours", minutes: "Minutes", seconds: "Seconds" };
const units = { hours: 3600, minutes: 60, seconds: 1 };

function update(part: Part, next: string | number | undefined) {
  if (typeof next !== "number") return;
  const base = props.seconds ? value.value : value.value - parts.value.seconds;
  model.value = base + (next - parts.value[part]) * units[part];
}
</script>

<template>
  <WearPickerGroup :label="label" class="wear-duration-picker">
    <WearPicker
      v-for="part in fields"
      :key="part"
      :label="props.labels?.[part] ?? labels[part]"
      :options="options[part]"
      :model-value="parts[part]"
      :disabled="disabled"
      @update:model-value="update(part, $event)"
    />
  </WearPickerGroup>
</template>
