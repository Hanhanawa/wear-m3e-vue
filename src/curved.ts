import type { InjectionKey } from "vue";
export const curvedKey: InjectionKey<{
  radius: () => number;
  angle: () => number;
  bottom: () => boolean;
}> = Symbol("wear-curved");
