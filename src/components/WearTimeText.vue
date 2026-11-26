<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, useId } from "vue";
import { appKey } from "../context";

const props = withDefaults(
  defineProps<{
    date?: Date;
    locale?: string;
    hourCycle?: Intl.DateTimeFormatOptions["hourCycle"];
    arc?: boolean;
    scrollAway?: boolean;
  }>(),
  { arc: true },
);
const app = inject(appKey, null);
const away = computed(
  () =>
    props.scrollAway &&
    !app?.ambient.value &&
    (app?.scrollOffset.value ?? 0) > 24,
);

const now = ref(new Date());
const id = `wear-time-${useId()}`;
const value = computed(() =>
  props.date && Number.isFinite(props.date.getTime()) ? props.date : now.value,
);
const text = computed(() =>
  new Intl.DateTimeFormat(props.locale, {
    hour: "numeric",
    minute: "2-digit",
    hourCycle: props.hourCycle,
  }).format(value.value),
);
let timer: number | undefined;

function tick() {
  now.value = new Date();
  timer = window.setTimeout(tick, 60_000 - (now.value.getTime() % 60_000));
}

onMounted(tick);
onUnmounted(() => window.clearTimeout(timer));
</script>

<template>
  <div class="wear-time" :data-away="away" :aria-hidden="away || undefined">
    <time
      :datetime="value.toISOString()"
      :class="{ 'wear-visually-hidden': arc }"
      >{{ text }}</time
    >
    <svg v-if="arc" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <defs><path :id="id" d="M 12 125 A 108 108 0 0 1 228 125" /></defs>
      <text text-anchor="middle">
        <textPath :href="`#${id}`" startOffset="50%">{{ text }}</textPath>
      </text>
    </svg>
  </div>
</template>
