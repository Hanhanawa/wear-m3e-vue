import type { ComputedRef, CSSProperties, InjectionKey, Ref } from "vue";
import type { WearScrollInfo } from "./types";

export const radioGroupKey: InjectionKey<{
  name: string;
  disabled: ComputedRef<boolean>;
  value: Ref<string | number | undefined>;
}> = Symbol("wear-radio-group");

export const screenKey: InjectionKey<{
  scroll: Ref<WearScrollInfo>;
  register: (element: HTMLElement | undefined) => void;
}> = Symbol("wear-screen");

export const appKey: InjectionKey<{
  ambient: ComputedRef<boolean>;
  scrollOffset: Ref<number>;
  /**
   * Logical diameter of the round frame in dp, and the 192→240 screen ratio.
   * Native defaults such as `CircularProgressIndicatorDefaults.largeStrokeWidth`
   * are chosen from the screen size, not from the component box, so anything
   * with a size-dependent default reads it from here.
   */
  diameter: Ref<number>;
  screenRatio: ComputedRef<number>;
  /** The screen is square: `round === false`, so arc chrome must not be used. */
  round: ComputedRef<boolean>;
}> = Symbol("wear-app");

export const themeKey: InjectionKey<ComputedRef<CSSProperties>> =
  Symbol("wear-theme");

/**
 * Single source of truth for reduced motion: the theme property *or* the
 * system preference. Geometry code has to honour it too, otherwise switching
 * off CSS transitions still leaves the list animating its transforms.
 */
export const reduceMotionKey: InjectionKey<ComputedRef<boolean>> =
  Symbol("wear-reduce-motion");
