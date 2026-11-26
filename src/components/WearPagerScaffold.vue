<script setup lang="ts">
import { useSlots } from "vue";
import WearPager from "./WearPager.vue";
import type { WearDirection, WearPage, WearPagerLabels } from "../types";
withDefaults(
  defineProps<{
    pages: readonly WearPage[];
    orientation?: "horizontal" | "vertical";
    dir?: WearDirection;
    label?: string;
    labels?: Partial<WearPagerLabels>;
  }>(),
  { orientation: "horizontal" },
);
const current = defineModel<number>({ default: 0 });
const slots = useSlots();
</script>

<template>
  <WearPager
    v-model="current"
    :pages="pages"
    :orientation="orientation"
    :dir="dir"
    :label="label"
    :labels="labels"
  >
    <template v-for="(_, name) in slots" #[name]="scope"
      ><slot :name="name" v-bind="scope"
    /></template>
  </WearPager>
</template>
