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

  /**
   * Layout size, never the *visual* size: `getBoundingClientRect()` includes
   * the ancestor transform a transforming list applies, so a row scaled to
   * 0.5 would report half its real width and every derived drawing (endpoint
   * dots, arc radii) would shrink with it. `ResizeObserverEntry.contentRect`
   * and `clientWidth` are both pre-transform.
   */
  function apply(boxWidth: number, boxHeight: number, node: Element) {
    const scale = unitScale(node);
    if (boxWidth > 0) width.value = boxWidth * scale;
    if (boxHeight > 0) height.value = boxHeight * scale;
  }

  function read(node: Element) {
    // SVG elements have no clientWidth; the observer covers those.
    const box = node as HTMLElement;
    apply(
      typeof box.clientWidth === "number" ? box.clientWidth : 0,
      typeof box.clientHeight === "number" ? box.clientHeight : 0,
      node,
    );
  }

  function observe(node: Element | undefined) {
    observer?.disconnect();
    observer = undefined;
    if (!node || typeof ResizeObserver === "undefined") return;
    observer = new ResizeObserver(([entry]) =>
      apply(entry.contentRect.width, entry.contentRect.height, node),
    );
    observer.observe(node);
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
