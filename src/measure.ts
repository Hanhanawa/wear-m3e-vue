/* SPDX-License-Identifier: Apache-2.0 */

import { onMounted, onUnmounted, ref, watch, type Ref } from "vue";

/**
 * The unit contract of this library (audit 02 §4.2):
 *
 *   a logical size of `d` dp renders as `d / hostScale` CSS px, and the host
 *   scales the WebView back up by `hostScale`. `--wear-unit` is exactly
 *   `1 / hostScale` px, so `px / unitPx` recovers logical dp.
 *
 * DOM consumers get that for free by writing `calc(d * var(--wear-unit))`.
 * SVG consumers need it as a number, because a `viewBox` cannot carry CSS
 * units: measuring here and writing `viewBox="0 0 D D"` makes one SVG unit one
 * logical dp, which is what stops strokes, dots and arc text from thinning out
 * on small screens.
 */

/** Logical dp per CSS px, read back from the inherited `--wear-unit`. */
export function unitScale(node: Element | undefined): number {
  if (!node) return 1;
  const raw = getComputedStyle(node).getPropertyValue("--wear-unit").trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? 1 / parsed : 1;
}

export interface LogicalSize {
  /** 0 until the element has been measured. */
  width: Ref<number>;
  height: Ref<number>;
  /** Re-attach the observer when the measured node changes. */
  observe: (node: Element | undefined) => void;
}

/**
 * Live logical (dp) size of an element. Falls back to the un-scaled pixel size
 * before the first measurement so server-rendered markup stays stable.
 */
export function useLogicalSize(target: Ref<Element | undefined>): LogicalSize {
  const width = ref(0);
  const height = ref(0);
  let observer: ResizeObserver | undefined;

  function read(node: Element | undefined) {
    if (!node) return;
    const scale = unitScale(node);
    const box = node.getBoundingClientRect();
    // A detached or hidden node measures 0; keep the last real size.
    if (box.width > 0) width.value = box.width * scale;
    if (box.height > 0) height.value = box.height * scale;
  }

  function observe(node: Element | undefined) {
    observer?.disconnect();
    observer = undefined;
    if (!node || typeof ResizeObserver === "undefined") return;
    observer = new ResizeObserver(() => read(node));
    read(node);
  }

  onMounted(() => observe(target.value));
  // Re-attach when a `v-if` swaps the measured node out from under us.
  watch(target, observe, { flush: "post" });
  onUnmounted(() => observer?.disconnect());

  return { width, height, observe };
}


/**
 * `ScreenSize.screenSizeDp()` in the native sources resolves to 192 dp on a
 * small watch and 240 dp on a large one, and the size-dependent defaults
 * (circular stroke widths, scroll-indicator stroke) are written as
 * `if (isSmallScreen()) a else b` around that. The spec interpolates linearly
 * between the two anchors, which is what `ratio` exposes: 0 at 192 dp, 1 at
 * 240 dp.
 */
export const SMALL_SCREEN_DP = 192;
export const LARGE_SCREEN_DP = 240;

export function screenRatio(diameter: number): number {
  if (!Number.isFinite(diameter) || diameter <= 0) return 0;
  return Math.min(
    1,
    Math.max(
      0,
      (diameter - SMALL_SCREEN_DP) / (LARGE_SCREEN_DP - SMALL_SCREEN_DP),
    ),
  );
}
