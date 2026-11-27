<script setup lang="ts">
/**
 * Cards.
 *
 * `layout` selects the arrangement rather than only a name: the standard card
 * stacks its slots, `title` puts the title and the time on one row, and `app`
 * keeps the app header (icon, name, time) above the title row. Those are the
 * three content builders the native `Card`/`TitleCard`/`AppCard` expose
 * (Card.kt:722-786, :819-884). The `media` slot stays a separate top image:
 * native's image *background* with its contrast handling is a different
 * feature and is not claimed here.
 */
withDefaults(
  defineProps<{
    variant?: "filled" | "tonal" | "outlined";
    layout?: "standard" | "title" | "app";
    actionable?: boolean;
    disabled?: boolean;
  }>(),
  { variant: "tonal", layout: "standard" },
);
</script>

<template>
  <component
    :is="actionable ? 'button' : 'article'"
    class="wear-surface wear-card"
    :data-variant="variant"
    :data-layout="layout"
    :type="actionable ? 'button' : undefined"
    :disabled="actionable ? disabled : undefined"
  >
    <span class="wear-surface-visual wear-card-face">
      <span v-if="$slots.media" class="wear-card-media"
        ><slot name="media"
      /></span>
      <span
        v-if="$slots.icon || $slots.name || ($slots.time && layout !== 'title')"
        class="wear-card-metadata"
      >
        <span v-if="$slots.icon" class="wear-icon" aria-hidden="true"
          ><slot name="icon"
        /></span>
        <span v-if="$slots.name"><slot name="name" /></span>
        <span
          v-if="$slots.time && layout !== 'title'"
          class="wear-card-time"
          ><slot name="time"
        /></span>
      </span>
      <template v-if="$slots.title">
        <span v-if="layout === 'title'" class="wear-card-heading">
          <span class="wear-label"><slot name="title" /></span>
          <span v-if="$slots.time" class="wear-card-time"
            ><slot name="time"
          /></span>
        </span>
        <span v-else class="wear-label"><slot name="title" /></span>
      </template>
      <span v-if="$slots.subtitle" class="wear-detail"
        ><slot name="subtitle"
      /></span>
      <span v-if="$slots.default" class="wear-card-content"><slot /></span>
    </span>
  </component>
</template>
