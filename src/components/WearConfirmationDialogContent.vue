<script setup lang="ts">
import WearDialogContent from "./WearDialogContent.vue";
import WearButton from "./WearButton.vue";
withDefaults(
  defineProps<{
    title?: string;
    titleId?: string;
    kind?: "neutral" | "success" | "failure" | "phone";
    closeLabel?: string;
  }>(),
  { kind: "neutral", closeLabel: "Close" },
);
defineEmits<{ dismiss: [] }>();
</script>

<template>
  <WearDialogContent
    class="wear-confirmation"
    :data-kind="kind"
    :title="title"
    :title-id="titleId"
  >
    <template v-if="$slots.title" #title><slot name="title" /></template>
    <template v-if="kind !== 'neutral' || $slots.icon" #icon>
      <slot name="icon"
        ><svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          focusable="false"
        >
          <path v-if="kind === 'success'" d="m5 12 5 5L20 7" />
          <path v-else-if="kind === 'failure'" d="m6 6 12 12M18 6 6 18" />
          <template v-else-if="kind === 'phone'">
            <rect x="6" y="2" width="12" height="20" rx="2" />
            <path d="M11 18h2" />
          </template></svg
      ></slot>
    </template>
    <slot v-if="$slots.default" />
    <template #actions
      ><WearButton variant="tonal" @click="$emit('dismiss')">{{
        closeLabel
      }}</WearButton></template
    >
  </WearDialogContent>
</template>
