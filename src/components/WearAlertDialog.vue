<script setup lang="ts">
import WearDialog from "./WearDialog.vue";
import WearAlertDialogContent from "./WearAlertDialogContent.vue";

const open = defineModel<boolean>({ default: false });
withDefaults(
  defineProps<{
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmDisabled?: boolean;
    dismissOnEscape?: boolean;
    edge?: boolean;
  }>(),
  {
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    dismissOnEscape: true,
  },
);
const emit = defineEmits<{ confirm: []; cancel: [] }>();

function finish(confirmed: boolean) {
  open.value = false;
  if (confirmed) emit("confirm");
  else emit("cancel");
}
</script>

<template>
  <WearDialog
    v-model="open"
    :dismiss-on-escape="dismissOnEscape"
    @dismiss="emit('cancel')"
  >
    <template #content="{ titleId }">
      <WearAlertDialogContent
        :title="title"
        :title-id="titleId"
        :confirm-label="confirmLabel"
        :cancel-label="cancelLabel"
        :confirm-disabled="confirmDisabled"
        :edge="edge"
        @confirm="finish(true)"
        @cancel="finish(false)"
      >
        <template v-if="$slots.title" #title><slot name="title" /></template>
        <template v-if="$slots.icon" #icon><slot name="icon" /></template>
        <slot v-if="$slots.default" />
      </WearAlertDialogContent>
    </template>
  </WearDialog>
</template>
