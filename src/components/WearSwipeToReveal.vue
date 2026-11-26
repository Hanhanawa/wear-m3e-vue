<script setup lang="ts">
import { computed, ref, watch } from "vue";
import WearButton from "./WearButton.vue";
import { useWearSwipe } from "../swipe";

const props = withDefaults(
  defineProps<{
    primaryLabel: string;
    secondaryLabel?: string;
    moreLabel?: string;
    closeLabel?: string;
    disabled?: boolean;
    undoLabel?: string;
    undone?: boolean;
  }>(),
  { moreLabel: "Actions", closeLabel: "Close actions" },
);
const open = defineModel<boolean>({ default: false });
const emit = defineEmits<{ primary: []; secondary: []; undo: [] }>();
const root = ref<HTMLElement>();
const direction = ref(-1);
watch(
  [root, open],
  () => {
    if (root.value)
      direction.value =
        getComputedStyle(root.value).direction === "rtl" ? 1 : -1;
  },
  { flush: "post" },
);
const swipe = useWearSwipe(root, {
  direction: () => direction.value,
  enabled: () => !props.disabled,
  finish: (distance, velocity) => {
    if (Math.abs(distance) > 24 || Math.abs(velocity) > 0.35)
      open.value = distance * direction.value > 0;
  },
});
const revealStyle = computed(() => ({
  "--wear-reveal-direction": direction.value,
  "--wear-reveal-drag": `${swipe.distance.value * direction.value}px`,
}));

function begin(event: TouchEvent) {
  direction.value = getComputedStyle(root.value!).direction === "rtl" ? 1 : -1;
  swipe.begin(event);
}
function action(which: "primary" | "secondary") {
  open.value = false;
  if (which === "primary") emit("primary");
  else emit("secondary");
}

function escape(event: KeyboardEvent) {
  if (!open.value) return;
  event.stopPropagation();
  event.preventDefault();
  open.value = false;
  root.value
    ?.querySelector<HTMLElement>(".wear-reveal-access")
    ?.focus({ preventScroll: true });
}
</script>

<template>
  <div
    ref="root"
    class="wear-reveal"
    :data-open="open"
    :data-secondary="!!secondaryLabel"
    :data-dragging="swipe.dragging.value"
    :style="revealStyle"
    data-wear-gesture-ignore
    @touchstart.passive="begin"
    @touchmove="swipe.move"
    @touchend.passive="swipe.end"
    @touchcancel.passive="swipe.reset"
    @click.capture="swipe.click"
    @keydown.esc="escape"
  >
    <div v-if="undone" class="wear-reveal-undo">
      <slot name="undo"
        ><WearButton variant="tonal" @click="emit('undo')">{{
          undoLabel ?? "Undo"
        }}</WearButton></slot
      >
    </div>
    <template v-else>
      <div class="wear-reveal-actions" :inert="!open" :aria-hidden="!open">
        <button
          v-if="secondaryLabel"
          type="button"
          class="wear-control wear-reveal-secondary"
          :aria-label="secondaryLabel"
          :disabled="disabled"
          @click="action('secondary')"
        >
          <slot name="secondary">{{ secondaryLabel }}</slot>
        </button>
        <button
          type="button"
          class="wear-control wear-reveal-primary"
          :aria-label="primaryLabel"
          :disabled="disabled"
          @click="action('primary')"
        >
          <slot name="primary">{{ primaryLabel }}</slot>
        </button>
      </div>
      <div class="wear-reveal-content" :inert="open" :aria-hidden="open">
        <slot />
      </div>
      <button
        type="button"
        class="wear-reveal-access wear-control"
        :disabled="disabled"
        :aria-expanded="open"
        :aria-label="open ? closeLabel : moreLabel"
        @click="open = !open"
      >
        <span class="wear-icon" aria-hidden="true">
          <svg
            v-if="open"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            focusable="false"
          >
            <path d="m7 7 10 10M17 7 7 17" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor" focusable="false">
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
          </svg>
        </span>
      </button>
    </template>
  </div>
</template>
