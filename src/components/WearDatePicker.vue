<script setup lang="ts">
import { computed } from "vue";
import WearPicker from "./WearPicker.vue";
import WearPickerGroup from "./WearPickerGroup.vue";
import { dateParts, daysInMonth, isoDate, validDate } from "../values";

const props = withDefaults(
  defineProps<{
    label?: string;
    labels?: Partial<Record<"year" | "month" | "day", string>>;
    locale?: string;
    minYear?: number;
    maxYear?: number;
    minDate?: string;
    maxDate?: string;
    order?: "day-month-year" | "month-day-year" | "year-month-day";
    disabled?: boolean;
  }>(),
  { label: "Date" },
);
const model = defineModel<string>();
const today = new Date();
const year = (value: number | undefined, fallback: number) =>
  Number.isFinite(value)
    ? Math.max(1, Math.min(9999, Math.trunc(value!)))
    : fallback;
const min = computed(() =>
  year(
    props.minYear,
    validDate(props.minDate)
      ? Number(props.minDate!.slice(0, 4))
      : today.getFullYear() - 50,
  ),
);
const max = computed(() =>
  Math.max(
    min.value,
    year(
      props.maxYear,
      validDate(props.maxDate)
        ? Number(props.maxDate!.slice(0, 4))
        : today.getFullYear() + 50,
    ),
  ),
);
const lower = computed(() =>
  validDate(props.minDate)
    ? dateParts(props.minDate, today, min.value, max.value)
    : { year: min.value, month: 1, day: 1 },
);
const upper = computed(() => {
  const value = validDate(props.maxDate)
    ? dateParts(props.maxDate, today, min.value, max.value)
    : { year: max.value, month: 12, day: 31 };
  return isoDate(value) < isoDate(lower.value) ? lower.value : value;
});
function bounded(value: ReturnType<typeof dateParts>) {
  const date = isoDate(value);
  if (date < isoDate(lower.value)) return lower.value;
  if (date > isoDate(upper.value)) return upper.value;
  return value;
}
const date = computed(() =>
  bounded(dateParts(model.value, today, min.value, max.value)),
);
type Part = keyof typeof date.value;
const order = computed(() =>
  props.order
    ? (props.order.split("-") as Part[])
    : new Intl.DateTimeFormat(props.locale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
        .formatToParts(today)
        .map(({ type }) => type)
        .filter(
          (type): type is Part =>
            type === "year" || type === "month" || type === "day",
        ),
);
const options = computed(() => {
  const numeric = new Intl.NumberFormat(props.locale, { useGrouping: false });
  const months = new Intl.DateTimeFormat(props.locale, {
    month: "short",
    timeZone: "UTC",
  });
  const make = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, offset) => ({
      value: from + offset,
      label: numeric.format(from + offset),
    }));
  return {
    year: make(lower.value.year, upper.value.year),
    month: make(
      date.value.year === lower.value.year ? lower.value.month : 1,
      date.value.year === upper.value.year ? upper.value.month : 12,
    ).map(({ value }) => ({
      value,
      label: months.format(new Date(Date.UTC(2024, value - 1, 1))),
    })),
    day: make(
      date.value.year === lower.value.year &&
        date.value.month === lower.value.month
        ? lower.value.day
        : 1,
      date.value.year === upper.value.year &&
        date.value.month === upper.value.month
        ? upper.value.day
        : daysInMonth(date.value.year, date.value.month),
    ),
  };
});
const labels = { year: "Year", month: "Month", day: "Day" };

function update(part: Part, value: string | number | undefined) {
  if (typeof value !== "number") return;
  const next = { ...date.value, [part]: value };
  next.day = Math.min(next.day, daysInMonth(next.year, next.month));
  model.value = isoDate(bounded(next));
}
</script>

<template>
  <WearPickerGroup :label="label" class="wear-date-picker">
    <WearPicker
      v-for="part in order"
      :key="part"
      :label="props.labels?.[part] ?? labels[part]"
      :options="options[part]"
      :data-part="part"
      :model-value="date[part]"
      :disabled="disabled"
      @update:model-value="update(part, $event)"
    />
  </WearPickerGroup>
</template>
