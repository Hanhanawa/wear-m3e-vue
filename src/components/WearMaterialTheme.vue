<script setup lang="ts">
import { computed, provide, type CSSProperties } from "vue";
import { reduceMotionKey, themeKey } from "../context";
import { colorSchemeVars, type WearColorSchemeInput } from "../tokens";

/**
 * Maps a Wear `ColorScheme` onto CSS custom properties.
 *
 * `colors` keeps the loose record the library shipped before the audit (any
 * subset of roles, camelCase or kebab-case, plus the legacy `surface` alias);
 * `colorScheme` is the same data with the 29 official roles typed. Both go
 * through `resolveColorScheme()`, which fills in every role the caller left
 * out, so a four-colour brand input produces a complete, consumable palette
 * instead of a handful of empty variables.
 */
const props = defineProps<{
  colors?: WearColorSchemeInput;
  colorScheme?: WearColorSchemeInput;
  typography?: Record<string, string>;
  fontFamily?: string;
  reducedMotion?: boolean;
}>();

function hyphenate(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

const style = computed(() => {
  const tokens: Record<string, string> = {
    ...colorSchemeVars(props.colorScheme ?? props.colors),
  };
  for (const [name, value] of Object.entries(props.typography ?? {}))
    tokens[`--wear-type-${hyphenate(name)}`] = value;
  if (props.fontFamily) tokens["--wear-font-family"] = props.fontFamily;
  return tokens as CSSProperties;
});

/** Reduced motion has to reach the JS geometry, not only the CSS transitions. */
const reduceMotion = computed(
  () =>
    !!props.reducedMotion ||
    (typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches),
);
provide(reduceMotionKey, reduceMotion);
provide(themeKey, style);
</script>

<template>
  <div class="wear-theme" :style="style" :data-reduced-motion="reduceMotion">
    <slot />
  </div>
</template>
