<script setup lang="ts">
import WearDialogContent from "./WearDialogContent.vue";
import WearButton from "./WearButton.vue";
withDefaults(
  defineProps<{
    title?: string;
    titleId?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmDisabled?: boolean;
    edge?: boolean;
  }>(),
  { confirmLabel: "Confirm", cancelLabel: "Cancel" },
);
defineEmits<{ confirm: []; cancel: [] }>();
</script>

<template>
  <WearDialogContent :title="title" :title-id="titleId">
    <template v-if="$slots.title" #title><slot name="title" /></template>
    <template v-if="$slots.icon" #icon><slot name="icon" /></template>
    <slot v-if="$slots.default" />
    <template #actions>
      <WearButton
        :shape="edge ? 'edge' : 'row'"
        :disabled="confirmDisabled"
        @click="$emit('confirm')"
        >{{ confirmLabel }}</WearButton
      >
      <WearButton v-if="cancelLabel" variant="tonal" @click="$emit('cancel')">{{
        cancelLabel
      }}</WearButton>
    </template>
  </WearDialogContent>
</template>
