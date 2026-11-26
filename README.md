# Wear M3E for Vue

[简体中文](README.zh-CN.md)

Vue 3 and TypeScript components for round watch WebViews, inspired by Wear Material 3 Expressive and AndroidX Wear Compose. Includes swipe paging, curved time and indicators, transforming lists, touch controls, dialogs, and pickers.

Use a verified CI archive or build one locally while the first npm release of `@hanhanawa/wear-m3e-vue` is pending.

## Quick start

Use Node.js 24 and Corepack. Corepack reads the pnpm version from `package.json`.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm demo
```

Open the [four-page demo](http://127.0.0.1:5173/). Run `corepack pnpm catalog` in another terminal and open the [component catalog](http://127.0.0.1:5174/). Rebuild after changing library source.

To use the library in another Vue 3 project, install the downloaded or locally built archive and import the stylesheet.

```sh
corepack pnpm add ./hanhanawa-wear-m3e-vue-0.1.0.tgz
```

```ts
import { WearScaffold, WearTimeText, WearPager } from "@hanhanawa/wear-m3e-vue";
import "@hanhanawa/wear-m3e-vue/style.css";
```

## Guides

- [Integration and WebView host](docs/integration.md)
- [Component reference and catalog](docs/components.md)
- [Development, CI, and verified package archives](docs/development.md)
- [Design sources and browser compatibility](SOURCES.md)
- [Apache-2.0 license](LICENSE)
