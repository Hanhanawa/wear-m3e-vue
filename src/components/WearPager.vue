<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { clamp, gestureAxis, normalizedPage, swipePage } from "../geometry";
import type { WearDirection, WearPage, WearPagerLabels } from "../types";
import WearPageIndicator from "./WearPageIndicator.vue";

const props = withDefaults(
  defineProps<{
    pages: readonly WearPage[];
    modelValue?: number;
    dir?: WearDirection;
    label?: string;
    labels?: Partial<WearPagerLabels>;
    edgeGuard?: number;
    indicator?: boolean;
    orientation?: "horizontal" | "vertical";
  }>(),
  {
    label: "Watch pages",
    edgeGuard: 18,
    indicator: true,
    orientation: "horizontal",
  },
);

const emit = defineEmits<{
  "update:modelValue": [index: number];
  change: [index: number];
}>();
const root = ref<HTMLElement>();
const internal = ref(0);
const shift = ref(0);
const dragging = ref(false);
const direction = ref<WearDirection>("ltr");
const width = ref(1);
const current = computed(() =>
  normalizedPage(props.modelValue ?? internal.value, props.pages.length),
);
const vertical = computed(() => props.orientation === "vertical");
const sign = computed(() =>
  !vertical.value && direction.value === "rtl" ? -1 : 1,
);
const progress = computed(
  () => current.value - (shift.value / width.value) * sign.value,
);
const announcement = computed(() => {
  const page = props.pages[current.value];
  if (!page) return "";
  return (
    props.labels?.position?.(
      current.value + 1,
      props.pages.length,
      page.label,
    ) ?? `Page ${current.value + 1} of ${props.pages.length}: ${page.label}`
  );
});

let finger: {
  id: number;
  x: number;
  y: number;
  started: number;
  unit: number;
  axis: "x" | null;
} | null = null;

function readDirection() {
  if (root.value)
    direction.value =
      props.dir ??
      (getComputedStyle(root.value).direction === "rtl" ? "rtl" : "ltr");
}

function reset() {
  finger = null;
  dragging.value = false;
  shift.value = 0;
}

function select(index: number) {
  const to = normalizedPage(index, props.pages.length);
  if (to === current.value) return;
  if (props.modelValue === undefined) internal.value = to;
  emit("update:modelValue", to);
  emit("change", to);
}

watch(
  current,
  async (_next, previous) => {
    reset();
    const focused = document.activeElement;
    const previousPanel = root.value?.querySelector(
      `[data-wear-page-index="${previous}"]`,
    );
    if (!focused || !previousPanel?.contains(focused)) return;

    await nextTick();
    root.value
      ?.querySelector<HTMLElement>(`[data-wear-page-index="${current.value}"]`)
      ?.focus({ preventScroll: true });
  },
  { flush: "pre" },
);

watch(
  () => props.dir,
  () => nextTick(readDirection),
);
onMounted(readDirection);

function pageStyle(index: number) {
  const offset = (index - current.value) * sign.value;
  return {
    "--wear-page-shift": `calc(${offset * 100}% + ${shift.value}px)`,
    "--wear-page-scale": Math.max(
      0.92,
      1 - Math.abs(index - progress.value) * 0.08,
    ),
  };
}

function begin(event: TouchEvent) {
  if (event.touches.length !== 1 || props.pages.length < 2 || !root.value) {
    reset();
    return;
  }
  const target = event.target;
  if (
    target instanceof Element &&
    target.closest(
      "input, textarea, select, [contenteditable], [data-wear-gesture-ignore]",
    )
  ) {
    return;
  }

  readDirection();
  const point = event.touches[0];
  const rect = root.value.getBoundingClientRect();
  const unit =
    Number.parseFloat(
      getComputedStyle(root.value).getPropertyValue("--wear-unit"),
    ) || 1;
  const side = Math.max(props.edgeGuard * unit, rect.width * 0.08);
  if (
    point.clientX - rect.left < side ||
    rect.right - point.clientX < side ||
    point.clientY - rect.top < 24 * unit ||
    rect.bottom - point.clientY < 24 * unit
  )
    return;

  width.value = vertical.value ? rect.height : rect.width;
  finger = {
    id: point.identifier,
    x: point.clientX,
    y: point.clientY,
    started: event.timeStamp,
    unit,
    axis: null,
  };
}

function move(event: TouchEvent) {
  if (!finger) return;
  if (event.touches.length !== 1) {
    reset();
    return;
  }

  const point = event.touches[0];
  if (point.identifier !== finger.id) return;
  const dx = vertical.value
    ? point.clientY - finger.y
    : point.clientX - finger.x;
  const dy = vertical.value
    ? point.clientX - finger.x
    : point.clientY - finger.y;
  const axis = finger.axis ?? gestureAxis(dx, dy, 8 * finger.unit);
  if (axis === "y" || (axis === "x" && !event.cancelable)) {
    reset();
    return;
  }
  if (axis !== "x") return;

  if (vertical.value && finger.axis === null) {
    const scroll = (event.target as Element)?.closest(".wear-list-viewport");
    if (
      scroll &&
      (dx < 0
        ? scroll.scrollTop < scroll.scrollHeight - scroll.clientHeight - 1
        : scroll.scrollTop > 1)
    ) {
      reset();
      return;
    }
  }

  const forward = dx * sign.value < 0;
  if (
    finger.axis === null &&
    (forward ? current.value === props.pages.length - 1 : current.value === 0)
  ) {
    reset();
    return;
  }

  event.preventDefault();
  finger.axis = "x";
  dragging.value = true;
  shift.value = clamp(dx, -width.value, width.value);
}

function end(event: TouchEvent) {
  if (!finger) return;
  const point = Array.from(event.changedTouches).find(
    ({ identifier }) => identifier === finger?.id,
  );
  const step =
    point && finger.axis === "x"
      ? swipePage(
          (vertical.value
            ? point.clientY - finger.y
            : point.clientX - finger.x) * sign.value,
          event.timeStamp - finger.started,
          width.value,
          finger.unit,
        )
      : 0;
  reset();
  if (step) select(current.value + step);
}

function key(event: KeyboardEvent) {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  )
    return;
  const target = event.target;
  if (
    target instanceof Element &&
    target.closest(
      "input, textarea, select, [contenteditable], [data-wear-gesture-ignore]",
    )
  )
    return;

  readDirection();
  const step =
    event.key === (vertical.value ? "ArrowUp" : "ArrowLeft")
      ? -sign.value
      : event.key === (vertical.value ? "ArrowDown" : "ArrowRight")
        ? sign.value
        : 0;
  if (!step) return;
  const index = current.value + step;
  if (index < 0 || index >= props.pages.length) return;
  event.preventDefault();
  select(index);
}
</script>

<template>
  <div
    ref="root"
    class="wear-pager"
    :data-orientation="orientation"
    :dir="dir"
    role="region"
    :aria-label="label"
    tabindex="0"
    :data-dragging="dragging"
    @touchstart.passive="begin"
    @touchmove="move"
    @touchend.passive="end"
    @touchcancel.passive="reset"
    @keydown="key"
  >
    <button
      v-if="pages.length > 1"
      type="button"
      class="wear-pager-access wear-pager-access-previous"
      :disabled="current === 0"
      @click="select(current - 1)"
    >
      {{ labels?.previous ?? "Previous page" }}
    </button>
    <button
      v-if="pages.length > 1"
      type="button"
      class="wear-pager-access wear-pager-access-next"
      :disabled="current === pages.length - 1"
      @click="select(current + 1)"
    >
      {{ labels?.next ?? "Next page" }}
    </button>
    <section
      v-for="(page, index) in pages"
      :key="page.id"
      class="wear-pane"
      :data-wear-page-index="index"
      :data-active="index === current"
      :inert="index !== current"
      :aria-hidden="index !== current ? 'true' : undefined"
      :aria-label="page.label"
      :style="pageStyle(index)"
      tabindex="-1"
    >
      <slot :name="page.id" :active="index === current" />
    </section>
    <div
      class="wear-visually-hidden"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>
    <WearPageIndicator
      v-if="indicator"
      :count="pages.length"
      :index="current"
      :progress="progress"
      :dir="direction"
      :orientation="orientation"
    />
  </div>
</template>
