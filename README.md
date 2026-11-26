# Wear M3E for Vue

A local Vue 3 and TypeScript component library for round watch web views. Its behavior and visual hierarchy follow Wear Material 3 Expressive. It provides browser components inspired by AndroidX Wear Compose, with an independent ESM and CSS build and no application, module, account, or system bridge dependencies.

## Run locally

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm check
corepack pnpm test
corepack pnpm build
corepack pnpm example
```

The package exports its TypeScript declarations with the ESM entry. The example uses the package name and the CSS export. Run `corepack pnpm verify:package` to pack the ESM, declarations, and CSS and build the example inside a fresh Vue consumer with the tarball installed as an ordinary dependency. This step also type-checks the consumer. The package remains private.

## Integrate

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
} from "wear-m3e-vue";
import "wear-m3e-vue/style.css";

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

| Component                      | Interface                                                                                                                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WearScaffold`                 | Sets round clipping, safe areas and design tokens. `round`, `dir`, `host-scale`, and `font-scale` configure shape, direction and scale. The `time` slot stays above the scrolling content.                                       |
| `WearTimeText`                 | Curved visual time with one semantic HTML `time`. Supports `locale`, `hour-cycle`, a controlled `date`, and a straight `arc=false` placement.                                                                                    |
| `WearPager`                    | Pass unique stable `{ id, label }` pages and a named slot per ID. Optional zero-based `v-model`, `change`, `label`, `labels`, `dir`, `edge-guard` (dp), and `indicator`. Slots receive `active`.                                 |
| `WearPageIndicator`            | Passive SVG lower arc, also exported separately. Supports `count`, `index`, interpolated `progress`, and `dir`.                                                                                                                  |
| `WearList`                     | Native vertical scroller. Optional `label`, `edge-scale`, `transform`, and `indicator`.                                                                                                                                          |
| `WearListItem`                 | `effect="content"` transforms the row contents. Use `effect="surface"` with the exported card and alert to preserve their full-size action hit regions. Use `effect="none"` for editable or other arbitrary interactive content. |
| `WearTitle`                    | A centered semantic heading with `level` from 1 to 6.                                                                                                                                                                            |
| `WearStatusCard` / `WearAlert` | Visible copy and optional `icon` slot. Cards have a `detail` slot. `actionable` renders a native button and supports `disabled`; attach a normal click listener. Use descriptive text for static status and warnings.            |

The pager leaves the start zones around both sides, the top and the bottom to its embedding host. It classifies vertical gestures without cancelling them and claims only an internal horizontal gesture with an available destination. Set `data-wear-gesture-ignore` on a nested surface to keep its own gestures. Wheel and rotary-generated wheel input are never mapped to page changes. Page panels stay mounted and inactive panels are inert. The page status and separate previous/next buttons support keyboard and screen-reader navigation; the buttons become visible on keyboard focus. Arrow keys honor direction and leave editable fields alone. Reduced motion disables the visual list transformation and page animation.

For a host applying an external 60%, 80%, or 100% view transform, pass the **actual** value `0.6`, `0.8`, or `1`. This keeps dp-oriented text sizes, touch targets, and guards in physical proportion. The DOM cannot infer an Android view transform, and a regular unscaled WebView should use the default of `1`. Customize semantic colors and spacing through the `--wear-*` properties on the scaffold; use a separate font scale for the user's text preference.

## Verify the package boundary

```sh
corepack pnpm verify:package
cd "$(cat .consumer/current)"
corepack pnpm preview --port 4287 --strictPort
```

In another terminal, run `corepack pnpm test:browser` from the library root after installing Playwright Chromium. Set `WEAR_CHROMIUM` to reuse an existing matching Chromium executable. `WEAR_URL` overrides the preview URL. Set `WEAR_ARTIFACTS` to choose the screenshot directory. The suite verifies built package output through this independent app. It models host zoom by transforming the complete iframe, with 192dp and 240dp watch viewports. For manual checks, the example accepts `?scale=0.8&text=1.35&dir=rtl`.

See [SOURCES.md](SOURCES.md) for the specification mapping, host boundary and compatibility details.
