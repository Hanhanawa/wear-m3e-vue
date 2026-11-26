<script setup lang="ts">
import { computed, inject, useId } from "vue";
import { radioGroupKey } from "../context";

const props = withDefaults(
  defineProps<{
    kind?: "switch" | "checkbox" | "radio";
    split?: boolean;
    disabled?: boolean;
    name?: string;
    value?: string | number;
    controlLabel?: string;
    indeterminate?: boolean;
  }>(),
  { kind: "switch", value: "on" },
);
const model = defineModel<boolean>({ default: false });
const emit = defineEmits<{ action: [event: MouseEvent] }>();
const injected = inject(radioGroupKey, null);
const group = computed(() => (props.kind === "radio" ? injected : null));
const id = `wear-selection-${useId()}`;
const checked = computed(() =>
  group.value ? group.value.value.value === props.value : model.value,
);
const disabled = computed(
  () => !!(props.disabled || group.value?.disabled.value),
);

function change(event: Event) {
  const value = (event.target as HTMLInputElement).checked;
  if (group.value) {
    if (value) group.value.value.value = props.value;
  } else model.value = value;
}
</script>

<template>
  <div
    class="wear-selection"
    :data-kind="kind"
    :data-split="split"
    :data-checked="checked"
    :data-disabled="disabled"
  >
    <component
      :is="split ? 'button' : 'label'"
      class="wear-control wear-selection-main"
      :type="split ? 'button' : undefined"
      :disabled="split ? disabled : undefined"
      :for="split ? undefined : id"
      @click="split && emit('action', $event)"
    >
      <span v-if="$slots.icon" class="wear-icon" aria-hidden="true"
        ><slot name="icon"
      /></span>
      <span class="wear-copy">
        <span :id="`${id}-label`" class="wear-label"><slot /></span>
        <span v-if="$slots.detail" :id="`${id}-detail`" class="wear-detail"
          ><slot name="detail"
        /></span>
      </span>
    </component>
    <span class="wear-selection-end">
      <input
        :id="id"
        class="wear-selection-input"
        :type="kind === 'radio' ? 'radio' : 'checkbox'"
        :role="kind === 'switch' ? 'switch' : undefined"
        :name="group?.name ?? name"
        :value="value"
        :checked="checked"
        :indeterminate="kind === 'checkbox' && indeterminate"
        :disabled="disabled"
        :aria-label="controlLabel"
        :aria-labelledby="controlLabel ? undefined : `${id}-label`"
        :aria-describedby="$slots.detail ? `${id}-detail` : undefined"
        @change="change"
      />
      <span
        class="wear-selection-mark"
        :data-mixed="kind === 'checkbox' && indeterminate"
        aria-hidden="true"
      >
        <svg v-if="kind !== 'radio'" viewBox="0 0 16 16" focusable="false">
          <path
            :d="
              kind === 'checkbox' && indeterminate ? 'M3 8h10' : 'm3 8 3 3 7-7'
            "
          />
        </svg>
      </span>
    </span>
  </div>
</template>
