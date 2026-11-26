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
}> = Symbol("wear-app");

export const themeKey: InjectionKey<ComputedRef<CSSProperties>> =
  Symbol("wear-theme");
