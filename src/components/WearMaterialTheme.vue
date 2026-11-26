<script setup lang="ts">
import { computed, provide, type CSSProperties } from "vue";
import { themeKey } from "../context";

const props = defineProps<{
  colors?: Record<string, string>;
  typography?: Record<string, string>;
  fontFamily?: string;
  reducedMotion?: boolean;
}>();
const style = computed(() => {
  const tokens: Record<string, string> = {};
  for (const [name, value] of Object.entries(props.colors ?? {}))
    tokens[
      `--wear-color-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`
    ] = value;
  for (const [name, value] of Object.entries(props.typography ?? {}))
    tokens[`--wear-type-${name}`] = value;
  if (props.fontFamily) tokens["--wear-font-family"] = props.fontFamily;
  return tokens as CSSProperties;
});
provide(themeKey, style);
</script>

<template>
  <div class="wear-theme" :style="style" :data-reduced-motion="reducedMotion">
    <slot />
  </div>
</template>
