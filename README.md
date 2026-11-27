# Wear M3E for Vue

[简体中文](README.zh-CN.md)

Vue 3 and TypeScript components for round watch WebViews, inspired by Wear Material 3 Expressive and AndroidX Wear Compose. Includes swipe paging, curved time and indicators, transforming lists, touch controls, dialogs, and pickers.

## Quick start

Use Node.js 24 and Corepack. Corepack reads the pnpm version from `package.json`.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm demo
```

Open the [four-page demo](http://127.0.0.1:5173/). Run `corepack pnpm catalog` in another terminal and open the [component catalog](http://127.0.0.1:5174/). Rebuild after changing library source.

To use the library in another Vue 3 project, install the npm package and import the stylesheet.

```sh
corepack pnpm add @hanhanawa/wear-m3e-vue
```

```ts
import { WearScaffold, WearTimeText, WearPager } from "@hanhanawa/wear-m3e-vue";
import "@hanhanawa/wear-m3e-vue/style.css";
```

## Default appearance

The component drawing layer now follows the pinned Wear Material 3 token and
geometry contracts, which changes the default look: the palette uses the Wear
token values and the full set of surface and accent roles, row labels are 15sp
with 13sp details, progress rings keep a real gap between the active arc and the
track, linear bars are 12dp with an endpoint dot, split rows show two distinct
containers, and disabled controls resolve container and content layers instead
of fading the whole group. Pass your own `colors` to pin a previous palette, and
see the migration notes in the remediation record.

## Guides

- [Integration and WebView host](docs/integration.md)
- [Component reference and catalog](docs/components.md)
- [Audit remediation record](docs/remediation.md)
- [Development, CI, and verified package archives](docs/development.md)
- [Design sources and browser compatibility](SOURCES.md)
- [Apache-2.0 license](LICENSE)
