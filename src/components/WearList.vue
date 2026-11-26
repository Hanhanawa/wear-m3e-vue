<script setup lang="ts">
import { inject, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { clamp, itemScale } from "../geometry";
import { appKey, screenKey } from "../context";
import { useWearRotary } from "../input";
import type { WearScrollInfo } from "../types";

const props = withDefaults(
  defineProps<{
    label?: string;
    edgeScale?: number;
    transform?: boolean;
    indicator?: boolean;
    snap?: boolean;
  }>(),
  { edgeScale: 0.73, transform: true, indicator: true },
);

const emit = defineEmits<{ scrollInfo: [value: WearScrollInfo] }>();
const screen = inject(screenKey, null);
const app = inject(appKey, null);

const viewport = ref<HTMLElement>();
const track = ref<HTMLElement>();
const thumb = ref(0);
const offset = ref(0);
let media: MediaQueryList | undefined;
let resize: ResizeObserver | undefined;
let mutation: MutationObserver | undefined;
let tick = 0;

function transformItems() {
  tick = 0;
  if (!viewport.value || !track.value) return;
  const el = viewport.value;
  const frame = el.getBoundingClientRect();
  const scrollHeight = el.scrollHeight;
  const maxScroll = scrollHeight - el.clientHeight;
  const info = {
    position: el.scrollTop,
    maximum: Math.max(0, maxScroll),
    viewport: el.clientHeight,
    content: scrollHeight,
  };
  if (screen) screen.scroll.value = info;
  if (app && !el.closest("[inert]")) app.scrollOffset.value = el.scrollTop;
  emit("scrollInfo", info);
  thumb.value =
    maxScroll > 1 ? clamp((el.clientHeight / scrollHeight) * 100, 14, 100) : 0;
  offset.value =
    maxScroll > 1 ? (el.scrollTop / maxScroll) * (100 - thumb.value) : 0;

  const shouldTransform =
    props.transform &&
    !media?.matches &&
    el.closest(".wear-frame")?.getAttribute("data-round") !== "false";
  const items = Array.from(track.value.children).filter(
    (item): item is HTMLElement =>
      item instanceof HTMLElement && item.classList.contains("wear-list-item"),
  );
  const rows = items.map((item) => {
    const box = item.getBoundingClientRect();
    const edgeScale = Number.isFinite(props.edgeScale) ? props.edgeScale : 0.73;
    const scale = shouldTransform
      ? itemScale({
          center: box.top + box.height / 2 - frame.top,
          height: box.height,
          width: box.width,
          diameter: frame.height,
          edgeScale,
        })
      : 1;
    return { item, scale };
  });

  for (const { item, scale } of rows) {
    item.style.setProperty("--wear-item-scale", String(scale));
    item.style.setProperty("--wear-item-alpha", String(0.76 + scale * 0.24));
  }
}

function schedule() {
  if (!tick) tick = requestAnimationFrame(transformItems);
}

function focus(event: FocusEvent) {
  if (
    !(event.target instanceof HTMLElement) ||
    !event.target.matches(":focus-visible") ||
    !viewport.value
  )
    return;
  const row = event.target.closest(".wear-list-item");
  if (!row || !viewport.value.contains(row)) return;

  const box = row.getBoundingClientRect();
  const el = viewport.value;
  const frame = el.getBoundingClientRect();
  const center = box.top + box.height / 2 - frame.top;
  if (center < frame.height * 0.3 || center > frame.height * 0.7) {
    el.scrollTop += center - frame.height / 2;
  }
}

watch(
  () => [props.edgeScale, props.transform],
  () => nextTick(schedule),
);

onMounted(() => {
  screen?.register(viewport.value);
  media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", schedule);
  resize = new ResizeObserver(schedule);
  if (viewport.value) resize.observe(viewport.value);
  if (track.value) {
    resize.observe(track.value);
    mutation = new MutationObserver(schedule);
    mutation.observe(track.value, { childList: true });
    const frame = viewport.value?.closest(".wear-frame");
    if (frame)
      mutation.observe(frame, {
        attributes: true,
        attributeFilter: ["data-round"],
      });
    let ancestor = viewport.value?.parentElement;
    while (ancestor && ancestor !== frame) {
      mutation.observe(ancestor, {
        attributes: true,
        attributeFilter: ["inert", "data-active"],
      });
      ancestor = ancestor.parentElement;
    }
  }
  schedule();
});

onUnmounted(() => {
  screen?.register(undefined);
  cancelAnimationFrame(tick);
  resize?.disconnect();
  mutation?.disconnect();
  media?.removeEventListener("change", schedule);
});

useWearRotary(viewport, (delta) => {
  if (viewport.value) viewport.value.scrollTop += delta;
});
defineExpose({
  viewport,
  scrollTo: (top: number) => {
    if (viewport.value) viewport.value.scrollTop = top;
  },
  scrollToItem: (index: number) => {
    const row = track.value?.children[index] as HTMLElement | undefined;
    if (row) row.scrollIntoView({ block: "center" });
  },
});
</script>

<template>
  <div class="wear-list" :data-snap="snap">
    <div
      ref="viewport"
      class="wear-list-viewport"
      tabindex="0"
      :role="label ? 'region' : undefined"
      :aria-label="label"
      @scroll.passive="schedule"
      @focusin="focus"
    >
      <div ref="track" class="wear-list-track"><slot /></div>
    </div>
    <svg
      v-if="indicator && thumb"
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
  </div>
</template>
