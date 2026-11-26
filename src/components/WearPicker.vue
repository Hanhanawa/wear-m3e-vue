<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useId, watch } from "vue";
import type { WearPickerOption } from "../types";
import { useWearRotary } from "../input";

const props = defineProps<{
  options: readonly WearPickerOption[];
  label: string;
  disabled?: boolean;
}>();
const model = defineModel<string | number>();
const viewport = ref<HTMLElement>();
const id = `wear-picker-${useId()}`;
const selected = computed(() =>
  props.options.findIndex(
    (option) => option.value === model.value && !option.disabled,
  ),
);
const active = computed(() =>
  selected.value >= 0
    ? selected.value
    : props.options.findIndex((option) => !option.disabled),
);
let timer = 0;

function center(index: number) {
  const element = viewport.value;
  const row = element?.children[index] as HTMLElement | undefined;
  if (element && row) element.scrollTop = index * row.offsetHeight;
}

function select(index: number) {
  const option = props.options[index];
  if (props.disabled || !option || option.disabled) return;
  model.value = option.value;
  center(index);
}

function move(direction: number) {
  let index = active.value + direction;
  while (props.options[index]?.disabled) index += direction;
  select(index);
}

function scrolling() {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    const element = viewport.value;
    const row = element?.firstElementChild as HTMLElement | undefined;
    if (!element || !row) return;
    const nearest = Math.round(element.scrollTop / row.offsetHeight);
    if (props.options[nearest]?.disabled) center(active.value);
    else select(nearest);
  }, 140);
}

function key(event: KeyboardEvent) {
  if (props.disabled) return;
  if (event.key === "ArrowUp") move(-1);
  else if (event.key === "ArrowDown") move(1);
  else if (event.key === "Home")
    select(props.options.findIndex((option) => !option.disabled));
  else if (event.key === "End") {
    const offset = [...props.options]
      .reverse()
      .findIndex((option) => !option.disabled);
    if (offset >= 0) select(props.options.length - 1 - offset);
  } else return;
  event.preventDefault();
}

useWearRotary(viewport, (delta) => move(Math.sign(delta)));
watch(
  [active, () => props.options, viewport],
  () => nextTick(() => center(active.value)),
  { flush: "post" },
);
onUnmounted(() => window.clearTimeout(timer));
</script>

<template>
  <div class="wear-picker" :data-disabled="disabled" data-wear-gesture-ignore>
    <div
      ref="viewport"
      class="wear-picker-wheel"
      role="listbox"
      :tabindex="disabled ? -1 : 0"
      :aria-label="label"
      :aria-disabled="disabled || undefined"
      :aria-activedescendant="active >= 0 ? `${id}-${active}` : undefined"
      @keydown="key"
      @scroll.passive="scrolling"
    >
      <div
        v-for="(option, index) in options"
        :id="`${id}-${index}`"
        :key="option.value"
        class="wear-picker-option"
        role="option"
        :style="{
          '--wear-option-width': Math.max(
            1,
            Array.from(option.label).length * 0.75,
          ),
        }"
        :aria-selected="index === active"
        :aria-disabled="option.disabled || undefined"
        @click="select(index)"
      >
        {{ option.label }}
      </div>
    </div>
    <span class="wear-picker-label" aria-hidden="true">{{ label }}</span>
  </div>
</template>
