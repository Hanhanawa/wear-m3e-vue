<script setup lang="ts">
import { computed, useId } from "vue";

const props = withDefaults(
  defineProps<{
    value?: number;
    max?: number;
    variant?: "circular" | "linear" | "arc" | "segmented" | "level";
    segments?: number;
    label?: string;
    valueText?: string;
  }>(),
  { max: 100, variant: "circular", segments: 5, label: "Progress" },
);
const mask = `wear-progress-${useId()}`;
const max = computed(() =>
  Number.isFinite(props.max) && props.max > 0 ? props.max : 100,
);
const value = computed(() =>
  Number.isFinite(props.value)
    ? Math.min(max.value, Math.max(0, props.value!))
    : undefined,
);
const percent = computed(() =>
  value.value === undefined ? 25 : (value.value / max.value) * 100,
);
const segments = computed(() =>
  Number.isFinite(props.segments)
    ? Math.min(24, Math.max(2, Math.floor(props.segments)))
    : 5,
);
const gap = computed(() => Math.min(2, 28 / segments.value));
</script>

<template>
  <div
    class="wear-progress"
    :data-variant="variant"
    :data-pending="value === undefined"
    role="progressbar"
    :aria-label="label"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="value"
    :aria-valuetext="valueText"
  >
    <span
      v-if="variant === 'linear'"
      class="wear-progress-line"
      :style="{ '--wear-progress': `${percent}%` }"
      aria-hidden="true"
      ><span
    /></span>
    <svg v-else viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs v-if="variant === 'segmented'">
        <mask :id="mask">
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="white"
            stroke-width="14"
            pathLength="100"
            :stroke-dasharray="`${100 / segments - gap} ${gap}`"
          />
        </mask>
      </defs>
      <g v-if="variant === 'level' || variant === 'arc'">
        <path
          class="wear-progress-track"
          d="M82 20 A44 44 0 0 1 82 80"
          pathLength="100"
        />
        <path
          v-if="percent > 0"
          class="wear-progress-active"
          d="M82 20 A44 44 0 0 1 82 80"
          pathLength="100"
          :stroke-dasharray="`${percent} 100`"
        />
      </g>
      <g
        v-else
        transform="rotate(-90 50 50)"
        :mask="variant === 'segmented' ? `url(#${mask})` : undefined"
      >
        <circle
          class="wear-progress-track"
          cx="50"
          cy="50"
          r="43"
          pathLength="100"
        />
        <circle
          v-if="percent > 0"
          class="wear-progress-active"
          cx="50"
          cy="50"
          r="43"
          pathLength="100"
          :stroke-dasharray="`${percent} 100`"
        />
      </g>
    </svg>
  </div>
</template>
