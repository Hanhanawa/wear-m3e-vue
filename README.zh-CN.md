# Wear M3E for Vue

[English](README.md)

适用于圆形手表 WebView 的 Vue 3 和 TypeScript 组件库，参考 Wear Material 3 Expressive 与 AndroidX Wear Compose。包含滑动分页、弧形时间与指示器、随滚动变形的列表、触控控件、对话框和选择器。

**此包尚未发布到 npm。** 可使用 CI 验证过的归档，或在本地检出后自行构建。

## 快速开始

使用 Node.js 24 与 Corepack。Corepack 会读取 `package.json` 中指定的 pnpm 版本。

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm demo
```

打开[四页示例](http://127.0.0.1:5173/)。在另一个终端运行 `corepack pnpm catalog`，再打开[组件目录](http://127.0.0.1:5174/)。修改库源码后需重新构建。

要在另一个 Vue 3 项目中使用，可安装下载或本地构建的归档，再导入样式。

```sh
corepack pnpm add ./wear-m3e-vue-0.1.0.tgz
```

```ts
import { WearScaffold, WearTimeText, WearPager } from "wear-m3e-vue";
import "wear-m3e-vue/style.css";
```

## 指南

- [接入方式与 WebView 宿主](docs/integration.md)
- [组件参考与目录](docs/components.md)
- [开发、CI 与已验证的包归档](docs/development.md)
- [设计来源与浏览器兼容性](SOURCES.md)
- [Apache-2.0 许可证](LICENSE)
