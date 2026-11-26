import { onUnmounted, watch, type Ref } from "vue";
import type { WearGestureAction } from "./types";

export function dispatchWearRotary(target: HTMLElement, delta: number) {
  if (!Number.isFinite(delta)) return false;
  return !target.dispatchEvent(
    new CustomEvent("wear-rotary", {
      detail: { delta },
      bubbles: true,
      cancelable: true,
    }),
  );
}

export function dispatchWearGesture(
  target: HTMLElement,
  action: WearGestureAction,
) {
  return !target.dispatchEvent(
    new CustomEvent("wear-gesture", {
      detail: { action },
      bubbles: true,
      cancelable: true,
    }),
  );
}

export function useWearRotary(
  target: Ref<HTMLElement | undefined>,
  handler: (delta: number) => void,
) {
  let current: HTMLElement | undefined;
  function receive(event: Event) {
    const delta = (event as CustomEvent<{ delta: number }>).detail?.delta;
    if (
      event.defaultPrevented ||
      current?.closest("[inert], [data-ambient='true']") ||
      !Number.isFinite(delta)
    )
      return;
    handler(delta);
    event.preventDefault();
    event.stopPropagation();
  }
  watch(
    target,
    (element) => {
      current?.removeEventListener("wear-rotary", receive);
      current = element;
      current?.addEventListener("wear-rotary", receive);
    },
    { flush: "post" },
  );
  onUnmounted(() => current?.removeEventListener("wear-rotary", receive));
}
