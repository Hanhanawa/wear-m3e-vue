import { computed, nextTick, onUnmounted, type Ref } from "vue";
import { rangeValue } from "./values";

export function useWearRange(
  props: { min?: number; max?: number; step?: number; disabled?: boolean },
  model: Ref<number | undefined>,
) {
  const min = computed(() => (Number.isFinite(props.min) ? props.min! : 0));
  const max = computed(() =>
    Number.isFinite(props.max)
      ? Math.max(min.value, props.max!)
      : Math.max(min.value, 100),
  );
  const step = computed(() =>
    Number.isFinite(props.step) && props.step! > 0 ? props.step! : 1,
  );
  const value = computed(() =>
    rangeValue(model.value, min.value, max.value, step.value),
  );
  const ratio = computed(() =>
    max.value === min.value
      ? 0
      : (value.value - min.value) / (max.value - min.value),
  );
  let pending: number | undefined;
  let press: { id: number; x: number; y: number; repeated: boolean } | undefined;
  let repeatTimer: number | undefined;

  function change(next: number) {
    const target = rangeValue(next, min.value, max.value, step.value);
    if (props.disabled || target === (pending ?? value.value)) return false;
    // A controlled model receives its new prop after the parent renders.
    const firstChange = pending === undefined;
    pending = target;
    model.value = target;
    if (firstChange)
      void nextTick(() => {
        pending = undefined;
      });
    return true;
  }

  function adjust(direction: number) {
    const current = pending ?? value.value;
    const index = (current - min.value) / step.value;
    // The upper bound can be a partial step. Rejoin the step grid just below it.
    const nextIndex =
      direction < 0 && current === max.value
        ? Math.ceil(Number(index.toPrecision(12))) - 1
        : Math.round(index) + Math.sign(direction);
    return direction !== 0 && change(min.value + nextIndex * step.value);
  }

  function stopRepeat(event?: PointerEvent) {
    if (event && event.pointerId !== press?.id) return;
    window.clearTimeout(repeatTimer);
  }

  function startRepeat(event: PointerEvent, direction: number) {
    if (!event.isPrimary || event.button !== 0) return;
    stopRepeat();
    const current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      repeated: false,
    };
    press = current;
    function repeat() {
      if (!adjust(direction)) return;
      current.repeated = true;
      repeatTimer = window.setTimeout(repeat, 60);
    }
    repeatTimer = window.setTimeout(repeat, 500);
  }

  function moveRepeat(event: PointerEvent) {
    if (
      press &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8
    ) {
      stopRepeat(event);
    }
  }

  function clickStep(event: MouseEvent, direction: number) {
    if (event.detail > 0 && press?.repeated) {
      press = undefined;
      return;
    }
    adjust(direction);
  }

  function buttonEvents(direction: number) {
    return {
      pointerdown: (event: PointerEvent) => startRepeat(event, direction),
      pointermove: moveRepeat,
      pointerup: stopRepeat,
      pointercancel: stopRepeat,
      pointerleave: stopRepeat,
      click: (event: MouseEvent) => clickStep(event, direction),
    };
  }

  onUnmounted(stopRepeat);
  return { min, max, step, value, ratio, change, adjust, buttonEvents };
}
