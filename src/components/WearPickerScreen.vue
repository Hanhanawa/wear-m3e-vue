<script setup lang="ts">
import WearButton from "./WearButton.vue";
withDefaults(
  defineProps<{
    title: string;
    titleId?: string;
    confirmLabel?: string;
    disabled?: boolean;
  }>(),
  { confirmLabel: "Done" },
);
defineEmits<{ confirm: [] }>();
</script>

<template>
  <div class="wear-picker-screen">
    <h2 :id="titleId" class="wear-picker-screen-title">{{ title }}</h2>
    <div class="wear-picker-screen-content"><slot /></div>
    <div class="wear-picker-screen-action">
      <WearButton shape="edge" :disabled="disabled" @click="$emit('confirm')">{{
        confirmLabel
      }}</WearButton>
    </div>
  </div>
</template>
