<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, useId } from "vue";
import { appKey } from "../context";
import { useLogicalSize } from "../measure";
import { wearPadding, wearTypeScale } from "../tokens";

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
/**
 * The arc is drawn in logical dp over the measured screen, so the glyph size
 * stays `arcMedium` 15 dp and the stroke stays 2.4 dp on every diameter,
 * instead of scaling with a fixed 240 coordinate space. The sweep is clamped
 * to `TimeTextDefaults.MaxSweepAngle`, which is what keeps a long localized
 * time from running down the side of the watch.
 */
const root = ref<Element>();
const measured = useLogicalSize(root);
const diameter = computed(
  () => app?.diameter.value || Math.min(measured.width.value, measured.height.value) || 0,
);
const arcSize = computed(() => wearTypeScale.arcMedium.size);
const maxSweep = 70;
const arcPath = computed(() => {
  const d = diameter.value;
  if (d <= 0) return "";
  const radius = Math.max(
    0,
    d / 2 - wearPadding.edge - arcSize.value / 2,
  );
  const point = (angle: number) => [
    d / 2 + radius * Math.cos((angle * Math.PI) / 180),
    d / 2 + radius * Math.sin((angle * Math.PI) / 180),
  ];
  const [x1, y1] = point(-90 - maxSweep / 2);
  const [x2, y2] = point(-90 + maxSweep / 2);
  return `M${x1} ${y1} A${radius} ${radius} 0 0 1 ${x2} ${y2}`;
});

let timer: number | undefined;

function tick() {
  now.value = new Date();
  timer = window.setTimeout(tick, 60_000 - (now.value.getTime() % 60_000));
}

onMounted(tick);
onUnmounted(() => window.clearTimeout(timer));
</script>

<template>
  <div
    ref="root"
    class="wear-time"
    :data-away="away"
    :aria-hidden="away || undefined"
  >
    <time
      :datetime="value.toISOString()"
      :class="{ 'wear-visually-hidden': arc }"
      >{{ text }}</time
    >
    <svg
      v-if="arc && diameter > 0"
      :viewBox="`0 0 ${diameter} ${diameter}`"
      aria-hidden="true"
      focusable="false"
    >
      <defs><path :id="id" :d="arcPath" /></defs>
      <text text-anchor="middle" :font-size="arcSize">
        <textPath :href="`#${id}`" startOffset="50%">{{ text }}</textPath>
      </text>
    </svg>
  </div>
</template>
