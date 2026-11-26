<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, useId, watch } from "vue";
import WearDialogContent from "./WearDialogContent.vue";
import { appKey } from "../context";

const open = defineModel<boolean>({ default: false });
const props = withDefaults(
  defineProps<{ label?: string; dismissOnEscape?: boolean }>(),
  { dismissOnEscape: true },
);
const emit = defineEmits<{ dismiss: [] }>();
const dialog = ref<HTMLDialogElement>();
const title = `wear-dialog-${useId()}`;
const app = inject(appKey, null);
let frame: HTMLElement | null = null;
let resize: ResizeObserver | undefined;
let opener: HTMLElement | null = null;
let mounted = false;

function align() {
  if (!dialog.value || !frame) return;
  const bounds = frame.getBoundingClientRect();
  for (const [key, value] of Object.entries({
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
  })) {
    dialog.value.style.setProperty(`--wear-dialog-${key}`, `${value}px`);
  }
  dialog.value.dataset.round = frame.dataset.round;
}

function restoreFocus() {
  if (opener?.isConnected && !opener.closest("[inert]"))
    opener.focus({ preventScroll: true });
  opener = null;
}

function update() {
  const panel = dialog.value;
  if (!mounted || !panel) return;
  if (open.value && !panel.open) {
    opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    align();
    panel.showModal();
  } else if (!open.value && panel.open) {
    panel.close();
    restoreFocus();
  }
}

function dismiss() {
  if (!open.value) return;
  open.value = false;
  emit("dismiss");
}

function cancel(event: Event) {
  event.preventDefault();
  if (props.dismissOnEscape) dismiss();
}

watch(open, update, { flush: "post" });
onMounted(() => {
  mounted = true;
  frame = dialog.value?.closest<HTMLElement>(".wear-frame") ?? null;
  if (frame) {
    resize = new ResizeObserver(align);
    resize.observe(frame);
  }
  window.addEventListener("resize", align);
  window.addEventListener("scroll", align, true);
  update();
});
onUnmounted(() => {
  resize?.disconnect();
  window.removeEventListener("resize", align);
  window.removeEventListener("scroll", align, true);
  restoreFocus();
});
</script>

<template>
  <dialog
    ref="dialog"
    class="wear-dialog"
    :inert="app?.ambient.value"
    :aria-label="label"
    :aria-labelledby="
      !label && ($slots.title || $slots.content) ? title : undefined
    "
    @cancel="cancel"
    @close="!dialog?.open && dismiss()"
  >
    <slot name="content" :close="dismiss" :title-id="title">
      <WearDialogContent :title-id="title">
        <template v-if="$slots.title" #title><slot name="title" /></template>
        <template v-if="$slots.icon" #icon><slot name="icon" /></template>
        <slot v-if="$slots.default" :close="dismiss" />
        <template v-if="$slots.actions" #actions
          ><slot name="actions" :close="dismiss"
        /></template>
      </WearDialogContent>
    </slot>
  </dialog>
</template>
