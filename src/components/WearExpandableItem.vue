<script setup lang="ts">
import { useId } from "vue";
import WearButton from "./WearButton.vue";
const expanded = defineModel<boolean>({ default: false });
defineProps<{ label: string; disabled?: boolean }>();
const id = `wear-expand-${useId()}`;
</script>

<template>
  <div class="wear-expandable">
    <WearButton
      variant="tonal"
      :aria-expanded="expanded"
      :aria-controls="id"
      :disabled="disabled"
      @click="expanded = !expanded"
      >{{ label }}</WearButton
    >
    <Transition name="wear-fade"
      ><div v-show="expanded" :id="id" class="wear-expandable-content">
        <slot /></div
    ></Transition>
  </div>
</template>
