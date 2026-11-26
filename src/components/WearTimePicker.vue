<script setup lang="ts">
import { computed } from "vue";
import WearPicker from "./WearPicker.vue";
import WearPickerGroup from "./WearPickerGroup.vue";
import { timeParts } from "../values";

const props = withDefaults(
  defineProps<{
    label?: string;
    labels?: Partial<Record<"hour" | "minute" | "second" | "period", string>>;
    locale?: string;
    hourCycle?: "h12" | "h23";
    seconds?: boolean;
    disabled?: boolean;
  }>(),
  { label: "Time", hourCycle: "h23" },
);
const model = defineModel<string>({ default: "00:00" });
type Part = "hour" | "minute" | "second" | "period";
const parts = computed(() => {
  const value = timeParts(model.value);
  return {
    ...value,
    hour: props.hourCycle === "h12" ? value.hour % 12 || 12 : value.hour,
    period: value.hour >= 12 ? 1 : 0,
  };
});
const fields = computed<Part[]>(() => {
  const order: Part[] = ["hour", "minute"];
  if (props.seconds) order.push("second");
  if (props.hourCycle === "h12") order.push("period");
  return order;
});
const options = computed(() => {
  const numeric = new Intl.NumberFormat(props.locale, {
    useGrouping: false,
    minimumIntegerDigits: 2,
  });
  const make = (start: number, count: number) =>
    Array.from({ length: count }, (_, offset) => ({
      value: start + offset,
      label: numeric.format(start + offset),
    }));
  const formatter = new Intl.DateTimeFormat(props.locale, {
    hour: "numeric",
    hour12: true,
    timeZone: "UTC",
  });
  const remainder = make(0, 60);
  return {
    hour: props.hourCycle === "h12" ? make(1, 12) : make(0, 24),
    minute: remainder,
    second: remainder,
    period: [0, 12].map((hour, value) => ({
      value,
      label:
        formatter
          .formatToParts(new Date(Date.UTC(2024, 0, 1, hour)))
          .find(({ type }) => type === "dayPeriod")?.value ??
        (value ? "PM" : "AM"),
    })),
  };
});
const labels = {
  hour: "Hour",
  minute: "Minute",
  second: "Second",
  period: "Period",
};

function update(part: Part, value: string | number | undefined) {
  if (typeof value !== "number") return;
  const next = { ...parts.value, [part]: value };
  const hours =
    props.hourCycle === "h12" ? (next.hour % 12) + next.period * 12 : next.hour;
  const values = props.seconds
    ? [hours, next.minute, next.second]
    : [hours, next.minute];
  model.value = values.map((value) => String(value).padStart(2, "0")).join(":");
}
</script>

<template>
  <WearPickerGroup :label="label" class="wear-time-picker">
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
