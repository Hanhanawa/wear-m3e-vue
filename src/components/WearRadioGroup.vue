<script setup lang="ts">
import { computed, provide, useId } from "vue";
import { radioGroupKey } from "../context";

const props = defineProps<{
  label: string;
  name?: string;
  disabled?: boolean;
}>();
const model = defineModel<string | number>();
const id = useId();
provide(radioGroupKey, {
  name: props.name ?? `wear-radio-${id}`,
  value: model,
  disabled: computed(() => !!props.disabled),
});
</script>

<template>
  <div
    class="wear-radio-group"
    role="radiogroup"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
  >
    <slot />
  </div>
</template>
