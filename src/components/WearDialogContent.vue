<script setup lang="ts">
import { useId } from "vue";
defineProps<{ title?: string; titleId?: string }>();
const fallbackId = `wear-dialog-content-${useId()}`;
</script>

<template>
  <div class="wear-dialog-scroll">
    <header
      v-if="$slots.title || title || $slots.icon"
      class="wear-dialog-header"
    >
      <span v-if="$slots.icon" class="wear-dialog-icon" aria-hidden="true"
        ><slot name="icon"
      /></span>
      <h2
        v-if="$slots.title || title"
        :id="titleId ?? fallbackId"
        class="wear-dialog-title"
      >
        <slot name="title">{{ title }}</slot>
      </h2>
    </header>
    <div v-if="$slots.default" class="wear-dialog-body"><slot /></div>
    <footer v-if="$slots.actions" class="wear-dialog-actions">
      <slot name="actions" />
    </footer>
  </div>
</template>
