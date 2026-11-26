<script setup lang="ts" generic="Item">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import WearList from "./WearList.vue";
import WearListItem from "./WearListItem.vue";
import type { WearScrollInfo } from "../types";

const props = withDefaults(
  defineProps<{
    items: readonly Item[];
    itemKey: (item: Item, index: number) => string | number;
    estimatedHeight?: number;
    overscan?: number;
    label?: string;
    transform?: boolean;
    indicator?: boolean;
  }>(),
  { estimatedHeight: 64, overscan: 4, transform: true, indicator: true },
);
const emit = defineEmits<{ scrollInfo: [value: WearScrollInfo] }>();
const list = ref<InstanceType<typeof WearList>>();
const header = ref<HTMLElement>();
const heights = shallowRef(new Map<string | number, number>());
const elements = new Map<Element, string | number>();
const position = ref(0);
const viewport = ref(240);
const headerHeight = ref(0);
const unit = ref(1);
let layoutWidth = 0;
let fontSize = "";
let observer: ResizeObserver | undefined;
const keys = computed(() => props.items.map(props.itemKey));
const offsets = computed(() => {
  const positions = [0];
  const estimate =
    Number.isFinite(props.estimatedHeight) && props.estimatedHeight > 0
      ? props.estimatedHeight
      : 64;
  for (const key of keys.value)
    positions.push(
      positions[positions.length - 1] +
        (heights.value.get(key) ?? estimate * unit.value),
    );
  return positions;
});
const overscan = computed(() =>
  Number.isFinite(props.overscan) ? Math.max(0, Math.floor(props.overscan)) : 4,
);

function indexAt(top: number) {
  let start = 0;
  let end = keys.value.length;
  while (start < end) {
    const middle = Math.floor((start + end) / 2);
    if (offsets.value[middle + 1] < top) start = middle + 1;
    else end = middle;
  }
  return start;
}
const first = computed(() =>
  Math.max(0, indexAt(position.value - headerHeight.value) - overscan.value),
);
const last = computed(() =>
  Math.min(
    props.items.length,
    indexAt(position.value + viewport.value - headerHeight.value) +
      overscan.value +
      1,
  ),
);
const visible = computed(() =>
  props.items.slice(first.value, last.value).map((item, offset) => ({
    item,
    index: first.value + offset,
    key: keys.value[first.value + offset],
  })),
);

function register(element: unknown, key: string | number) {
  if (element instanceof HTMLElement) {
    elements.set(element, key);
    observer?.observe(element);
  }
}
function scroll(info: WearScrollInfo) {
  position.value = info.position;
  viewport.value = info.viewport;
  emit("scrollInfo", info);
}
onMounted(() => {
  unit.value =
    Number.parseFloat(
      getComputedStyle(header.value!).getPropertyValue("--wear-unit"),
    ) || 1;
  observer = new ResizeObserver((entries) => {
    const parent = header.value!.parentElement!;
    const currentStyle = getComputedStyle(parent);
    if (
      layoutWidth !== parent.clientWidth ||
      fontSize !== currentStyle.fontSize
    ) {
      layoutWidth = parent.clientWidth;
      fontSize = currentStyle.fontSize;
      unit.value =
        Number.parseFloat(currentStyle.getPropertyValue("--wear-unit")) || 1;
      heights.value = new Map();
    }
    const next = new Map(heights.value);
    const anchor = indexAt(position.value - headerHeight.value);
    let adjustment = 0;
    for (const entry of entries) {
      if (entry.target === header.value) {
        headerHeight.value = header.value.offsetHeight;
        continue;
      }
      const key = elements.get(entry.target);
      if (key === undefined) continue;
      const height = (entry.target as HTMLElement).offsetHeight;
      const index = keys.value.indexOf(key);
      if (index < anchor)
        adjustment +=
          height - (offsets.value[index + 1] - offsets.value[index]);
      next.set(key, height);
    }
    heights.value = next;
    if (adjustment)
      nextTick(() => list.value?.scrollTo(position.value + adjustment));
  });
  if (header.value) observer.observe(header.value);
  for (const element of elements.keys()) observer.observe(element);
});
watch(
  visible,
  () => {
    for (const element of elements.keys()) {
      if (!element.isConnected) {
        observer?.unobserve(element);
        elements.delete(element);
      }
    }
  },
  { flush: "post" },
);
onUnmounted(() => observer?.disconnect());
defineExpose({
  scrollToIndex: (index: number) => {
    if (!props.items.length || !Number.isFinite(index)) return;
    const target = Math.max(
      0,
      Math.min(props.items.length - 1, Math.floor(index)),
    );
    list.value?.scrollTo(offsets.value[target] + headerHeight.value);
  },
});
</script>

<template>
  <WearList
    ref="list"
    class="wear-virtual-list"
    :label="label"
    :transform="transform"
    :indicator="indicator"
    @scroll-info="scroll"
  >
    <div ref="header"><slot name="header" /></div>
    <div aria-hidden="true" :style="{ height: `${offsets[first]}px` }" />
    <WearListItem v-for="entry in visible" :key="entry.key" effect="surface">
      <div
        :ref="(element) => register(element, entry.key)"
        class="wear-virtual-row"
      >
        <slot :item="entry.item" :index="entry.index" />
      </div>
    </WearListItem>
    <div
      aria-hidden="true"
      :style="{ height: `${offsets[items.length] - offsets[last]}px` }"
    />
    <slot name="footer" />
  </WearList>
</template>
