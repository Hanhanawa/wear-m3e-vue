<script setup lang="ts">
import { computed, ref } from "vue";
import { useWearSwipe } from "../swipe";

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    edgeOnly?: boolean;
    dismissLabel?: string;
    showDismissButton?: boolean;
  }>(),
  { edgeOnly: true, dismissLabel: "Back", showDismissButton: true },
);
const dismissed = defineModel<boolean>({ default: false });
const emit = defineEmits<{ dismiss: [] }>();
const root = ref<HTMLElement>();
const direction = ref(1);

function dismiss() {
  if (!props.disabled) {
    dismissed.value = true;
    emit("dismiss");
  }
}
const swipe = useWearSwipe(root, {
  direction: () => direction.value,
  enabled: () => !props.disabled,
  edgeOnly: () => props.edgeOnly,
  finish: (distance, velocity) => {
    if (
      distance * direction.value >=
        Math.max(40, (root.value?.clientWidth ?? 200) * 0.3) ||
      (distance * direction.value > 24 && velocity * direction.value > 0.4)
    )
      dismiss();
  },
});
const transform = computed(() => ({
  transform: `translateX(${Math.max(0, swipe.distance.value * direction.value) * direction.value}px)`,
}));
function begin(event: TouchEvent) {
  direction.value = getComputedStyle(root.value!).direction === "rtl" ? -1 : 1;
  swipe.begin(event);
}
</script>

<template>
  <div
    v-show="!dismissed"
    ref="root"
    class="wear-dismiss"
    :data-dragging="swipe.dragging.value"
    @touchstart.passive="begin"
    @touchmove="swipe.move"
    @touchend.passive="swipe.end"
    @touchcancel.passive="swipe.reset"
    @click.capture="swipe.click"
    @keydown.esc.stop.prevent="dismiss"
  >
    <div class="wear-dismiss-background"><slot name="background" /></div>
    <div class="wear-dismiss-content" :style="transform"><slot /></div>
    <button
      v-if="showDismissButton"
      type="button"
      class="wear-dismiss-access wear-control"
      :disabled="disabled"
      :aria-label="dismissLabel"
      @click="dismiss"
    >
      <span aria-hidden="true">‹</span>
    </button>
  </div>
</template>
