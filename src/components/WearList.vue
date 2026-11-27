<script setup lang="ts">
import { inject, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { clamp, itemScale } from "../geometry";
import { appKey, reduceMotionKey, screenKey } from "../context";
import { useWearRotary } from "../input";
import { unitScale } from "../measure";
import { screenScaled, wearProgress } from "../tokens";
import type { WearScrollInfo } from "../types";
import WearScrollIndicator from "./WearScrollIndicator.vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    /**
     * Scale a row reaches at the edge of the screen. Left unset it follows the
     * native spec, which is 0.7 on a 192 dp watch and 0.6 on a 240 dp one
     * (ResponsiveTransformationSpec.kt:102, :169) rather than one fixed 0.73.
     */
    edgeScale?: number;
    transform?: boolean;
    indicator?: boolean;
    snap?: boolean;
  }>(),
  { edgeScale: undefined, transform: true, indicator: true },
);

const emit = defineEmits<{ scrollInfo: [value: WearScrollInfo] }>();
const screen = inject(screenKey, null);
const app = inject(appKey, null);
/** Theme property or system preference: geometry must honour both. */
const themeReduceMotion = inject(reduceMotionKey, null);

const viewport = ref<HTMLElement>();
const track = ref<HTMLElement>();
const scroll = ref<WearScrollInfo>();
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
  scroll.value = info;
  if (screen) screen.scroll.value = info;
  // The offset is published in logical dp, because the consumers compare it to
  // dp thresholds (TimeText hides after 24 dp of scroll), not to CSS pixels.
  const dpScale = unitScale(el);
  if (app && !el.closest("[inert]"))
    app.scrollOffset.value = el.scrollTop * dpScale;
  emit("scrollInfo", info);

  const shouldTransform =
    props.transform &&
    !themeReduceMotion?.value &&
    !media?.matches &&
    el.closest(".wear-frame")?.getAttribute("data-round") !== "false";
  // Screen size, in dp, selects the spec values the way isSmallScreen() does.
  const diameter = frame.height * dpScale;
  const edgeScale = Number.isFinite(props.edgeScale)
    ? props.edgeScale!
    : screenScaled(diameter, wearProgress.listEdgeScale);
  const items = Array.from(track.value.children).filter(
    (item): item is HTMLElement =>
      item instanceof HTMLElement && item.classList.contains("wear-list-item"),
  );
  const rows = items.map((item) => {
    const box = item.getBoundingClientRect();
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
    /**
     * Container and content fade on their own curve instead of one alpha
     * riding along with the scale: the native spec reaches 0.5 at the edge
     * (ResponsiveTransformationSpec.kt:100-101), where the previous build sat
     * near 0.93 because alpha was derived as 0.76 + 0.24 * scale.
     */
    const progress = clamp((1 - scale) / Math.max(1e-6, 1 - edgeScale), 0, 1);
    const alpha = 1 - (1 - wearProgress.listAlphaEdge) * progress;
    item.style.setProperty("--wear-item-scale", String(scale));
    item.style.setProperty("--wear-item-alpha", String(alpha));
    item.style.setProperty("--wear-item-content-alpha", String(alpha));
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
  () => [props.edgeScale, props.transform, themeReduceMotion?.value],
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
    <WearScrollIndicator
      v-if="indicator && scroll"
      :position="scroll.position"
      :viewport="scroll.viewport"
      :content="scroll.content"
    />
  </div>
</template>
