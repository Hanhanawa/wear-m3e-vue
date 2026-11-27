<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import type { WearTextVariant } from "../types";
import { wearTypeScale } from "../tokens";

/**
 * Text.
 *
 * `variant` keeps the five roles this library shipped before the audit;
 * `role` names an explicit Wear type role (`titleMedium`, `labelSmall`,
 * `numeralMedium`, `arcMedium`, …) and brings its size, line height, weight
 * and tracking with it. Roles are resolved through the token table, so an
 * unknown name falls back to the legacy variant instead of writing an
 * arbitrary custom property.
 */
const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: WearTextVariant;
    role?: string;
    lines?: number;
  }>(),
  { as: "span", variant: "body" },
);

const knownRoles = new Set<string>(Object.keys(wearTypeScale));

const role = computed(() =>
  props.role && knownRoles.has(props.role) ? props.role : undefined,
);
const style = computed<CSSProperties>(() => {
  if (!role.value) return {};
  const kebab = role.value.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  return {
    "--wear-text-size": `var(--wear-type-${kebab}-size)`,
    "--wear-text-line": `var(--wear-type-${kebab}-line-height)`,
    "--wear-text-weight": `var(--wear-type-${kebab}-weight)`,
    "--wear-text-tracking": `var(--wear-type-${kebab}-tracking)`,
  } as CSSProperties;
});
</script>

<template>
  <component
    :is="as"
    class="wear-text"
    :data-variant="variant"
    :data-role="role"
    :style="{
      ...style,
      ...(lines && lines > 0 ? { '--wear-text-lines': lines } : undefined),
    }"
    ><slot
  /></component>
</template>
