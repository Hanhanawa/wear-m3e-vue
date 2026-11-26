<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import type { WearGestureAction } from "../types";

const props = withDefaults(
  defineProps<{
    label: string;
    action?: WearGestureAction;
    enabled?: boolean;
    hint?: boolean;
  }>(),
  { action: "click", enabled: true },
);
const emit = defineEmits<{ gesture: [action: WearGestureAction] }>();
const root = ref<HTMLElement>();
function receive(event: Event) {
  const action = (event as CustomEvent<{ action: WearGestureAction }>).detail
    ?.action;
  if (
    !props.enabled ||
    action !== props.action ||
    event.defaultPrevented ||
    root.value?.closest('[inert], [data-ambient="true"]')
  )
    return;
  event.preventDefault();
  event.stopPropagation();
  emit("gesture", action);
}
onMounted(() => root.value?.addEventListener("wear-gesture", receive));
onUnmounted(() => root.value?.removeEventListener("wear-gesture", receive));
</script>

<template>
  <div ref="root" class="wear-gesture">
    <slot /><span
      v-if="enabled && hint"
      class="wear-gesture-hint"
      role="status"
      >{{ label }}</span
    >
  </div>
</template>
