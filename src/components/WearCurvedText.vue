<script setup lang="ts">
import { computed, inject, ref, useId } from "vue";
import { polar } from "../arcs";
import { curvedKey } from "../curved";
import { useLogicalSize } from "../measure";
import { wearPadding, wearTypeScale } from "../tokens";

/**
 * Curved text.
 *
 * `radius` is a logical dp distance from the screen centre; it used to be a
 * unit inside a fixed 240 coordinate space, which made the same component
 * draw a different physical radius on a 192 and a 240 screen. The glyph size
 * now follows the arc role, and the arc itself is clamped so long text stays
 * on the bezel instead of running past the edge.
 */
const props = defineProps<{
  text: string;
  radius?: number;
  angle?: number;
  position?: "top" | "bottom";
  size?: "large" | "medium" | "small";
}>();
const parent = inject(curvedKey, null);
const id = `wear-curved-${useId()}`;

const root = ref<Element>();
const measured = useLogicalSize(root);
const diameter = computed(() =>
  Math.min(measured.width.value || 0, measured.height.value || 0),
);
const arcRoles = {
  large: "arcLarge",
  medium: "arcMedium",
  small: "arcSmall",
} as const satisfies Record<string, keyof typeof wearTypeScale>;
const role = computed(() => arcRoles[props.size ?? "medium"]);
const arcSize = computed(() => wearTypeScale[role.value].size);
/** Upper and lower arcs use different tracking, per TypeScaleTokens. */
const arcTracking = computed(() =>
  bottom.value
    ? wearTypeScale[role.value].trackingBottom ?? wearTypeScale[role.value].tracking
    : wearTypeScale[role.value].tracking,
);
const radius = computed(() => {
  const d = diameter.value || 240;
  const limit = Math.max(20, d / 2 - wearPadding.edge - arcSize.value);
  return Math.min(limit, Math.max(20, props.radius ?? parent?.radius() ?? d / 2 - 20));
});
const bottom = computed(() =>
  props.position ? props.position === "bottom" : (parent?.bottom() ?? false),
);
const angle = computed(() => props.angle ?? parent?.angle() ?? 0);

const path = computed(() => {
  const d = diameter.value || 240;
  const center: [number, number] = [d / 2, d / 2];
  // A half circle at most, centred on the top or bottom of the screen.
  const sweep = 180;
  const [x1, y1] = polar(center, radius.value, bottom.value ? 90 + sweep / 2 : -90 - sweep / 2);
  const [x2, y2] = polar(center, radius.value, bottom.value ? 90 - sweep / 2 : -90 + sweep / 2);
  // The lower arc runs counter-clockwise to keep its glyphs upright.
  return `M${x1} ${y1} A${radius.value} ${radius.value} 0 0 ${bottom.value ? 0 : 1} ${x2} ${y2}`;
});
</script>

<template>
  <span ref="root" class="wear-curved-text"
    ><span class="wear-visually-hidden">{{ text }}</span>
    <svg
      v-if="diameter > 0"
      :viewBox="`0 0 ${diameter} ${diameter}`"
      aria-hidden="true"
      focusable="false"
    >
      <defs><path :id="id" :d="path" /></defs>
      <text
        text-anchor="middle"
        :font-size="arcSize"
        :font-weight="size === 'small' ? 560 : 599"
        :letter-spacing="arcTracking"
        :transform="`rotate(${angle} ${diameter / 2} ${diameter / 2})`"
      >
        <textPath :href="`#${id}`" startOffset="50%">{{ text }}</textPath>
      </text>
    </svg>
  </span>
</template>
