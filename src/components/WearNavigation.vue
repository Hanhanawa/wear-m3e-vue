<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import WearSwipeToDismissBox from "./WearSwipeToDismissBox.vue";
import type { WearNavigationEntry } from "../types";

const stack = defineModel<WearNavigationEntry[]>({ default: () => [] });
withDefaults(defineProps<{ backLabel?: string }>(), { backLabel: "Back" });
const emit = defineEmits<{ back: [entry: WearNavigationEntry] }>();
const root = ref<HTMLElement>();
const focused = new Map<string, HTMLElement>();
watch(
  () => stack.value[stack.value.length - 1]?.id,
  async (current, previous) => {
    const active = document.activeElement;
    if (
      previous &&
      active instanceof HTMLElement &&
      root.value?.contains(active)
    )
      focused.set(previous, active);
    await nextTick();
    const saved = current ? focused.get(current) : undefined;
    if (saved?.isConnected && !saved.closest("[inert]"))
      saved.focus({ preventScroll: true });
    else
      root.value
        ?.querySelector<HTMLElement>(
          '.wear-navigation-entry[data-active="true"]',
        )
        ?.focus({ preventScroll: true });
    for (const key of focused.keys())
      if (!stack.value.some((entry) => entry.id === key)) focused.delete(key);
  },
);
function pop() {
  if (stack.value.length <= 1) return;
  const removed = stack.value[stack.value.length - 1];
  stack.value = stack.value.slice(0, -1);
  emit("back", removed);
}
</script>

<template>
  <div ref="root" class="wear-navigation">
    <section
      v-for="(entry, index) in stack"
      :key="entry.id"
      class="wear-navigation-entry"
      :inert="index !== stack.length - 1"
      tabindex="-1"
      :aria-hidden="index !== stack.length - 1 ? 'true' : undefined"
      :aria-label="entry.label"
      :data-active="index === stack.length - 1"
    >
      <WearSwipeToDismissBox
        :model-value="false"
        :disabled="index === 0"
        :show-dismiss-button="index > 0"
        :dismiss-label="backLabel"
        @dismiss="pop"
      >
        <slot
          :name="entry.route"
          :entry="entry"
          :active="index === stack.length - 1"
          :back="pop"
          ><slot
            :entry="entry"
            :active="index === stack.length - 1"
            :back="pop"
        /></slot>
      </WearSwipeToDismissBox>
    </section>
  </div>
</template>
