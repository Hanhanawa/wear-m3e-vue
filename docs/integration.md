# Integration and WebView host

Install the package and import its stylesheet as shown in the [README](../README.md).

## Round screens and horizontal paging

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  WearScaffold,
  WearTimeText,
  WearPager,
  WearList,
  WearListItem,
  WearTitle,
  WearStatusCard,
} from "@hanhanawa/wear-m3e-vue";
import "@hanhanawa/wear-m3e-vue/style.css";

const page = ref(0);
const pages = [
  { id: "status", label: "Status" },
  { id: "info", label: "Info" },
];
</script>

<template>
  <!-- Give the host a definite width and height, e.g. the full WebView. -->
  <WearScaffold>
    <template #time><WearTimeText /></template>
    <WearPager v-model="page" :pages="pages" label="Watch pages">
      <template #status>
        <WearList label="Status">
          <WearListItem><WearTitle>Status</WearTitle></WearListItem>
          <WearListItem effect="surface">
            <WearStatusCard tone="primary"
              >Ready<template #detail>2 items active</template></WearStatusCard
            >
          </WearListItem>
        </WearList>
      </template>
      <template #info>
        <WearList label="Info">
          <WearListItem><WearTitle>Info</WearTitle></WearListItem>
        </WearList>
      </template>
    </WearPager>
  </WearScaffold>
</template>
```

The pager leaves the start zones around both sides, the top and the bottom to its embedding host. It classifies vertical gestures without cancelling them and claims only an internal horizontal gesture with an available destination. Set `data-wear-gesture-ignore` on a nested surface to keep its own gestures. Wheel and rotary-generated wheel input are never mapped to page changes. Page panels stay mounted and inactive panels are inert. The page status and separate previous/next buttons support keyboard and screen-reader navigation; the buttons become visible on keyboard focus. Arrow keys honor direction and leave editable fields alone. Reduced motion disables the visual list transformation and page animation.

For a host applying an external 60%, 80%, or 100% view transform, pass the **actual** value `0.6`, `0.8`, or `1`. This keeps dp-oriented text sizes, touch targets, and guards in physical proportion. The DOM cannot infer an Android view transform, and a regular unscaled WebView should use the default of `1`. Customize semantic colors and spacing through the `--wear-*` properties on the scaffold, or pass `colors` / `colorScheme` to `WearMaterialTheme`. Prefer the named roles: components consume the 29 Wear roles (`surfaceContainer`, `surfaceContainerHigh`, `primaryDim`, `outlineVariant`, …), and a partial input is completed rather than left half-applied, so overriding only `primary`/`onPrimary`/`primaryContainer`/`onPrimaryContainer` still yields a coherent palette with derived `…Dim` and surface-container roles. Setting only `--wear-color-surface` moves the whole container family, because `surface` is a migration alias for `surfaceContainer`, not a separate role. Use a separate font scale for the user's text preference.

A level indicator is a full-screen arc on one edge of the screen. Give it a screen of its own with clear edge space — do not overlay it on a scrolling list, where it competes with the list's scroll indicator and crosses its rows.

## Screen integration

```vue
<WearScaffold>
  <template #time><WearTimeText scroll-away /></template>
  <WearScreenScaffold>
    <WearList label="Settings">
      <WearListItem><WearListHeader>Settings</WearListHeader></WearListItem>
      <WearListItem effect="none"><WearSwitchButton v-model="enabled">Enabled</WearSwitchButton></WearListItem>
    </WearList>
    <template #edge><WearEdgeButton @click="save">Save</WearEdgeButton></template>
  </WearScreenScaffold>
</WearScaffold>
```

Keep one `WearScaffold` around the app. Put edge actions in the screen's `edge`
slot. Mount modal dialogs inside that scaffold so they inherit its tokens and
physical scaling. The generic dialog's `content` slot receives `titleId` and
`close` for custom content. Pass `titleId` to the custom content heading.

## Host input and lifecycle

`dispatchWearRotary(element, delta)` dispatches CSS-pixel rotary input to a list,
picker, slider or stepper. Lists consume the pixel delta; pickers and range
controls consume its direction as one step. `dispatchWearGesture(element, action)`
supports `click`, `next`, `previous`, and `dismiss` through a matching
`WearOneHandedGesture`. These functions return whether a component handled the
event. The embedding Android application supplies real hardware and lifecycle
events and may supply dynamic colors through `WearMaterialTheme`.

Wheel text fits its column width so dates and localized values stay readable on
small screens. Labels and other text follow the supplied font scale. The browser
implementation approximates native spring motion and text font morphing.
Date pickers also accept inclusive `min-date` / `max-date` in
`YYYY-MM-DD` format and an explicit `order` of `day-month-year`, `month-day-year`,
or `year-month-day`. Selecting another month or year clamps the day to a valid date
within these bounds.
Native Android back dispatch, rotary haptics, ambient lifecycle, device gesture
recognition, and phone launch require application integration. Gesture rendering
and callback handling are available in the web package.

See [component APIs](components.md) and [browser compatibility](../SOURCES.md) for details.
