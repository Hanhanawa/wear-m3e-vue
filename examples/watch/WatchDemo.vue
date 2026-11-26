<script setup lang="ts">
import { ref } from "vue";
import {
  WearAlert,
  WearList,
  WearListItem,
  WearPager,
  WearScaffold,
  WearStatusCard,
  WearTimeText,
  WearTitle,
  type WearPage,
} from "@hanhanawa/wear-m3e-vue";

const query = new URLSearchParams(window.location.search);
const rtl = query.get("dir") === "rtl";
const hostScale = Number(query.get("scale")) || 1;
const fontScale = Number(query.get("text")) || 1;
const page = ref(0);
const modes = ["Balanced", "Performance"] as const;
const mode = ref(0);
const draft = ref("");
const saved = ref(false);

const pages: WearPage[] = [
  { id: "status", label: "Status" },
  { id: "config", label: "Config" },
  { id: "modules", label: "Modules" },
  { id: "info", label: "Info" },
];

const entries = [
  ["Audio Profile", "2.1 · Active"],
  ["Hosts Redirect", "1.3 · Active"],
  ["Sample Overlay", "1.0 · Pending"],
  ["Local Resources", "1.2 · Idle"],
];

function cycleMode() {
  mode.value = (mode.value + 1) % modes.length;
  saved.value = false;
}
</script>

<template>
  <WearScaffold
    :dir="rtl ? 'rtl' : 'ltr'"
    :host-scale="hostScale"
    :font-scale="fontScale"
  >
    <template #time><WearTimeText :hour-cycle="'h23'" /></template>
    <WearPager v-model="page" :pages="pages" label="Wear example pages">
      <template #status>
        <WearList label="Status list">
          <WearListItem><WearTitle>Status</WearTitle></WearListItem>
          <WearListItem effect="surface">
            <WearAlert>
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2 1 21h22L12 2Zm-1 6h2v6h-2V8Zm0 8h2v2h-2v-2Z" />
                </svg>
              </template>
              1 warning
            </WearAlert>
          </WearListItem>
          <WearListItem effect="surface">
            <WearStatusCard tone="primary">
              <template #icon>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="m7.5 12 3 3 6-6" />
                </svg>
              </template>
              Running
              <template #detail>2 items active</template>
            </WearStatusCard>
          </WearListItem>
          <WearListItem><WearTitle :level="2">Modes</WearTitle></WearListItem>
          <WearListItem
            v-for="(item, index) in modes"
            :key="item"
            effect="surface"
          >
            <WearStatusCard
              >{{ item
              }}<template #detail
                >{{ index + 1 }} item{{ index ? "s" : "" }}</template
              ></WearStatusCard
            >
          </WearListItem>
          <WearListItem effect="surface"
            ><WearStatusCard
              >Last check<template #detail>Completed</template></WearStatusCard
            ></WearListItem
          >
        </WearList>
      </template>

      <template #config>
        <WearList label="Config list">
          <WearListItem><WearTitle>Config</WearTitle></WearListItem>
          <WearListItem effect="surface">
            <WearStatusCard actionable @click="cycleMode">
              Default mode
              <template #detail>{{ modes[mode] }}</template>
            </WearStatusCard>
          </WearListItem>
          <WearListItem effect="none">
            <label class="demo-field"
              >Draft note<input v-model="draft" @input="saved = false"
            /></label>
          </WearListItem>
          <WearListItem effect="surface">
            <WearStatusCard actionable tone="primary" @click="saved = true">{{
              saved ? "Saved in demo" : "Save"
            }}</WearStatusCard>
          </WearListItem>
        </WearList>
      </template>

      <template #modules>
        <WearList label="Modules list">
          <WearListItem><WearTitle>Modules</WearTitle></WearListItem>
          <WearListItem
            v-for="[name, detail] in entries"
            :key="name"
            effect="surface"
          >
            <WearStatusCard
              >{{ name
              }}<template #detail>{{ detail }}</template></WearStatusCard
            >
          </WearListItem>
        </WearList>
      </template>

      <template #info>
        <WearList label="Info list">
          <WearListItem><WearTitle>Info</WearTitle></WearListItem>
          <WearListItem effect="surface">
            <WearStatusCard
              >Wear Vue<template #detail
                >Example · 0.1</template
              ></WearStatusCard
            >
          </WearListItem>
          <WearListItem effect="surface">
            <WearStatusCard
              >Data<template #detail>Local fixtures</template></WearStatusCard
            >
          </WearListItem>
        </WearList>
      </template>
    </WearPager>
  </WearScaffold>
</template>

<style>
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: #000;
}
.demo-field {
  display: grid;
  gap: calc(4 * var(--wear-unit));
  font-size: var(--wear-type-detail);
  padding-inline: 12%;
}
.demo-field input {
  width: 100%;
  min-height: var(--wear-touch-target);
  color: inherit;
  background: var(--wear-color-surface);
  border: 1px solid var(--wear-color-on-surface-variant);
  border-radius: calc(12 * var(--wear-unit));
  font: inherit;
  padding-inline: calc(8 * var(--wear-unit));
}
.demo-field input:focus-visible {
  outline: 2px solid var(--wear-color-primary);
}
</style>
