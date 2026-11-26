<script setup lang="ts">
import { watch } from "vue";
import WearDialog from "./WearDialog.vue";
import WearConfirmationDialogContent from "./WearConfirmationDialogContent.vue";

const open = defineModel<boolean>({ default: false });
const props = withDefaults(
  defineProps<{
    title?: string;
    kind?: "neutral" | "success" | "failure" | "phone";
    duration?: number;
    closeLabel?: string;
  }>(),
  { kind: "neutral", duration: 3000, closeLabel: "Close" },
);
const emit = defineEmits<{ dismiss: [] }>();

function dismiss() {
  if (open.value) {
    open.value = false;
    emit("dismiss");
  }
}
watch(
  [open, () => props.duration],
  ([visible, duration], _previous, cleanup) => {
    if (
      !visible ||
      !Number.isFinite(duration) ||
      duration <= 0 ||
      typeof window === "undefined"
    )
      return;
    const timer = window.setTimeout(dismiss, duration);
    cleanup(() => window.clearTimeout(timer));
  },
  { immediate: true },
);
</script>

<template>
  <WearDialog v-model="open" @dismiss="emit('dismiss')">
    <template #content="{ titleId }">
      <WearConfirmationDialogContent
        :title="title"
        :title-id="titleId"
        :kind="kind"
        :close-label="closeLabel"
        @dismiss="dismiss"
      >
        <template v-if="$slots.title" #title><slot name="title" /></template>
        <template v-if="$slots.icon" #icon><slot name="icon" /></template>
        <slot v-if="$slots.default" />
      </WearConfirmationDialogContent>
    </template>
  </WearDialog>
</template>
