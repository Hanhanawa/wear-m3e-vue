<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import WearPageIndicator from "./WearPageIndicator.vue";
import WearScrollIndicator from "./WearScrollIndicator.vue";

const props = withDefaults(
  defineProps<{
    kind?: "click" | "scroll" | "horizontal" | "vertical";
    label?: string;
    hint?: boolean;
    duration?: number;
    count?: number;
    index?: number;
    progress?: number;
    position?: number;
    viewport?: number;
    content?: number;
  }>(),
  { kind: "click", label: "Gesture available", duration: 2000, count: 0 },
);
const visible = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
watch(
  () => [props.hint, props.duration],
  () => {
    clearTimeout(timer);
    visible.value = !!props.hint;
    if (visible.value && Number.isFinite(props.duration) && props.duration > 0)
      timer = setTimeout(() => {
        visible.value = false;
      }, props.duration);
  },
  { immediate: true },
);
const overlay = computed(() => props.kind !== "click");
onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <span
    class="wear-gesture-indicator"
    :data-kind="kind"
    :data-overlay="overlay"
  >
    <span
      v-if="visible"
      class="wear-gesture-indicator-hint"
      role="status"
      :aria-label="label"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M8 12V5a2 2 0 0 1 4 0v7-3a2 2 0 0 1 4 0v4-1a2 2 0 0 1 4 0v4c0 4-3 6-6 6h-1c-2 0-4-1-5-3l-4-6a2 2 0 0 1 3-2l3 3"
        />
      </svg>
    </span>
    <template v-else>
      <WearScrollIndicator
        v-if="kind === 'scroll'"
        :position="position"
        :viewport="viewport"
        :content="content"
      />
      <WearPageIndicator
        v-else-if="kind === 'horizontal' || kind === 'vertical'"
        :orientation="kind"
        :count="count"
        :index="index"
        :progress="progress"
      />
      <slot v-else />
    </template>
  </span>
</template>
