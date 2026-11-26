import { ref, type Ref } from "vue";
import { gestureAxis } from "./geometry";

export function useWearSwipe(
  root: Ref<HTMLElement | undefined>,
  options: {
    direction: () => number;
    enabled: () => boolean;
    edgeOnly?: () => boolean;
    finish: (distance: number, velocity: number) => void;
  },
) {
  const distance = ref(0);
  const dragging = ref(false);
  let suppressClick = false;
  let start: {
    x: number;
    y: number;
    time: number;
    id: number;
    scale: number;
    axis: "x" | null;
  } | null = null;

  function reset() {
    start = null;
    dragging.value = false;
    distance.value = 0;
  }
  function begin(event: TouchEvent) {
    if (
      !root.value ||
      !options.enabled() ||
      event.touches.length !== 1 ||
      event.defaultPrevented
    )
      return;
    if (
      (event.target as Element)?.closest(
        "input, textarea, select, [contenteditable], [data-wear-swipe-ignore]",
      )
    )
      return;
    const touch = event.touches[0];
    suppressClick = false;
    const bounds = root.value.getBoundingClientRect();
    const scale = bounds.width / root.value.clientWidth || 1;
    const edge =
      options.direction() > 0
        ? touch.clientX - bounds.left
        : bounds.right - touch.clientX;
    if (options.edgeOnly?.() && edge > Math.min(bounds.width * 0.2, 32 * scale))
      return;
    start = {
      x: touch.clientX,
      y: touch.clientY,
      time: event.timeStamp,
      id: touch.identifier,
      scale,
      axis: null,
    };
  }
  function move(event: TouchEvent) {
    if (
      !start ||
      event.defaultPrevented ||
      event.touches.length !== 1 ||
      !options.enabled()
    ) {
      reset();
      return;
    }
    const touch = event.touches[0];
    if (touch.identifier !== start.id) return;
    const horizontal = (touch.clientX - start.x) / start.scale;
    const vertical = (touch.clientY - start.y) / start.scale;
    const axis = start.axis ?? gestureAxis(horizontal, vertical, 8);
    if (axis === "y" || !event.cancelable) {
      reset();
      return;
    }
    if (axis !== "x") return;
    start.axis = axis;
    event.preventDefault();
    event.stopPropagation();
    dragging.value = true;
    distance.value = horizontal;
  }
  function end(event: TouchEvent) {
    if (!start) return;
    const elapsed = Math.max(1, event.timeStamp - start.time);
    const completed = distance.value;
    const claimed = start.axis === "x";
    suppressClick = claimed;
    reset();
    if (claimed) options.finish(completed, completed / elapsed);
  }
  function click(event: MouseEvent) {
    if (suppressClick) {
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }
  }
  return { distance, dragging, begin, move, end, reset, click };
}
