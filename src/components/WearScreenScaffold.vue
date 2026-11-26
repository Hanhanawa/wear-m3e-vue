<script setup lang="ts">
import { provide, ref } from "vue";
import { screenKey } from "../context";
import type { WearScrollInfo } from "../types";

defineProps<{ label?: string }>();
const scroll = ref<WearScrollInfo>({
  position: 0,
  maximum: 0,
  viewport: 0,
  content: 0,
});
let viewport: HTMLElement | undefined;
let touch: { x: number; y: number; previousY: number; scale: number } | null =
  null;
provide(screenKey, {
  scroll,
  register: (element) => {
    viewport = element;
  },
});

function wheel(event: WheelEvent) {
  if (!viewport) return;
  viewport.scrollTop +=
    event.deltaY *
    (event.deltaMode === 1
      ? 16
      : event.deltaMode === 2
        ? viewport.clientHeight
        : 1);
  event.preventDefault();
}

function touchStart(event: TouchEvent) {
  if (!viewport || event.touches.length !== 1) return;
  const point = event.touches[0];
  const scale =
    viewport.getBoundingClientRect().height / viewport.clientHeight || 1;
  touch = {
    x: point.clientX,
    y: point.clientY,
    previousY: point.clientY,
    scale,
  };
}

function touchMove(event: TouchEvent) {
  if (!touch || !viewport || event.touches.length !== 1) return;
  const point = event.touches[0];
  const horizontal = Math.abs(point.clientX - touch.x);
  const vertical = Math.abs(point.clientY - touch.y);
  if (horizontal > vertical && horizontal > 8) {
    touch = null;
    return;
  }
  if (vertical < 8 || !event.cancelable) return;
  event.preventDefault();
  event.stopPropagation();
  viewport.scrollTop += (touch.previousY - point.clientY) / touch.scale;
  touch.previousY = point.clientY;
}
</script>

<template>
  <section
    class="wear-screen"
    :class="{ 'wear-screen-with-edge': !!$slots.edge }"
    :aria-label="label"
  >
    <slot :scroll="scroll" />
    <div v-if="$slots.time" class="wear-screen-time">
      <slot name="time" :scroll="scroll" />
    </div>
    <div
      v-if="$slots.edge"
      class="wear-screen-edge"
      :data-at-end="scroll.maximum - scroll.position < 8"
      @wheel="wheel"
      @touchstart.passive="touchStart"
      @touchmove="touchMove"
      @touchend.passive="touch = null"
      @touchcancel.passive="touch = null"
    >
      <slot name="edge" :scroll="scroll" />
    </div>
    <slot name="indicator" :scroll="scroll" />
  </section>
</template>
