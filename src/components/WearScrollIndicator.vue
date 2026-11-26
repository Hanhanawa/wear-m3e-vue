<script setup lang="ts">
import { computed } from "vue";
import { clamp } from "../geometry";
const props = withDefaults(
  defineProps<{ position?: number; viewport?: number; content?: number }>(),
  { position: 0, viewport: 0, content: 0 },
);
const maximum = computed(() =>
  Number.isFinite(props.content) && Number.isFinite(props.viewport)
    ? Math.max(0, props.content - props.viewport)
    : 0,
);
const thumb = computed(() =>
  maximum.value > 1
    ? clamp((props.viewport / props.content) * 100, 14, 100)
    : 0,
);
const offset = computed(() =>
  Number.isFinite(props.position) && maximum.value > 1
    ? clamp(props.position / maximum.value, 0, 1) * (100 - thumb.value)
    : 0,
);
</script>

<template>
  <svg
    v-if="thumb"
    viewBox="0 0 240 240"
    class="wear-scroll-indicator"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M223 81 A110 110 0 0 1 223 159" pathLength="100" />
    <path
      d="M223 81 A110 110 0 0 1 223 159"
      pathLength="100"
      :stroke-dasharray="`${thumb} 100`"
      :stroke-dashoffset="-offset"
    />
  </svg>
</template>
