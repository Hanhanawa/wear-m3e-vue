# Wear M3E for Vue

A local Vue 3 and TypeScript component library for round watch web views. Its behavior and visual hierarchy follow Wear Material 3 Expressive. It provides browser components inspired by AndroidX Wear Compose, with an independent ESM and CSS build and no application, module, account, or system bridge dependencies.

## Run locally

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm check
corepack pnpm test
corepack pnpm build
```

Run these commands from this checkout's root, where `package.json` is located.
Start the four-page application demo with `corepack pnpm demo` and open
`http://127.0.0.1:5173/`. Start the component catalog with `corepack pnpm catalog`
and open `http://127.0.0.1:5174/`. They can run together in separate terminals.
Each command selects its page at the root URL and fails if its port is occupied.
Rebuild the library after changing its source to update these previews.

`corepack pnpm example` keeps the original query-based entry, where `/?catalog`
opens the catalog. Packed consumer builds use the same query-based entry.

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

## Wear component catalog

The package includes Wear-oriented selection rows, buttons, cards, dialogs, pickers,
progress indicators, paging, gestures, curved layout and virtual lists. The baseline
is the published AndroidX Wear Compose 1.7.2 source. Duration selection and pull to
refresh additionally follow the 1.8.0-alpha04 component concepts.

Run `corepack pnpm catalog` and open `http://127.0.0.1:5174/` to browse the interactive catalog.
Open a particular family with `/?section=selection`. Other sections are
`buttons`, `cards`, `slider`, `progress`, `pickers`, `dialogs`, `horizontal`,
`vertical`, `lazy`, `gestures`, and `type`. The existing `scale`, `text`, `dir`, and
`round=false` query parameters apply to the catalog.

### Selection rows

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  WearSwitchButton,
  WearSplitSwitchButton,
  WearCheckboxButton,
  WearRadioGroup,
  WearRadioButton,
} from "wear-m3e-vue";

const enabled = ref(true);
const backup = ref(false);
const mode = ref<string | number>("balanced");
const showNotificationSettings = ref(false);
</script>

<template>
  <WearSwitchButton v-model="enabled">
    Notifications
    <template #detail>Alerts on your watch</template>
  </WearSwitchButton>
  <WearSplitSwitchButton
    v-model="enabled"
    control-label="Enable notifications"
    @action="showNotificationSettings = true"
  >
    Notification settings
  </WearSplitSwitchButton>
  <WearCheckboxButton v-model="backup">Back up data</WearCheckboxButton>
  <WearRadioGroup v-model="mode" label="Power mode">
    <WearRadioButton value="balanced">Balanced</WearRadioButton>
    <WearRadioButton value="performance">Performance</WearRadioButton>
  </WearRadioGroup>
</template>
```

Selection components accept `disabled`, `name`, `value`, and `control-label`.
The `icon` and `detail` slots are optional. `action` on a split row only activates
the body. The end control owns its independent state and accessible label.
Checkboxes also support `indeterminate`. Use `WearRadioGroup` to coordinate radio
values and native keyboard behavior. Place editable selection rows in
`WearListItem effect="none"` to preserve their physical targets.

### Families and API

| Family                    | Exports and usage                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Buttons                   | `WearButton`, `WearFilledTonalButton`, `WearOutlinedButton`, `WearChildButton`, `WearCompactButton`, `WearIconButton`, `WearFilledIconButton`, `WearFilledTonalIconButton`, `WearOutlinedIconButton`, `WearTextButton`, `WearEdgeButton`. Common props include `variant`, `shape`, `size`, `compact`, `disabled`, `type`, and `pressed`. Named variants share the same implementation and slots. |
| Button groups and toggles | `WearButtonGroup` requires an accessible `label`. `WearIconToggleButton`, `WearTextToggleButton`, and `WearToggleButton` use boolean `v-model`. Supply an `aria-label` to icon-only buttons.                                                                                                                                                                                                     |
| Selection                 | `WearSwitchButton`, `WearSplitSwitchButton`, `WearCheckboxButton`, `WearSplitCheckboxButton`, `WearRadioButton`, `WearSplitRadioButton`, `WearRadioGroup`.                                                                                                                                                                                                                                       |
| Cards                     | `WearCard`, `WearAppCard`, `WearTitleCard`, `WearOutlinedCard`. Slots are `icon`, `name`, `time`, `title`, `subtitle`, `media`, and the default body. `actionable` makes the whole card a button. Keep nested controls in a non-actionable card.                                                                                                                                                 |
| Text and loading          | `WearText` supports `display`, `title`, `label`, `body`, and `detail` roles, `as`, and optional line clamping with `lines`. `WearIcon` takes optional `label`. `WearAnimatedText` animates changes to `value`. `WearFadingExpandingLabel` takes `text` and `expanded`. `WearPlaceholder` takes `loading`, `shimmer`, and an optional status `label`.                                             |
| List headings             | `WearListHeader` and `WearListSubHeader` accept semantic heading `level` and an optional icon slot. `WearExpandableItem` has boolean `v-model`, `label`, and expandable default content.                                                                                                                                                                                                         |
| Ranges                    | `WearSlider` and `WearStepper` have numeric `v-model`, `label`, `min`, `max`, `step`, `disabled`, `decrease-label`, and `increase-label`. The slider includes independent minus/plus buttons and an accessible range track. `segmented` adds divisions. The stepper default slot receives `value` and `ratio`.                                                                                   |
| Progress                  | `WearCircularProgressIndicator`, `WearSegmentedCircularProgressIndicator`, `WearArcProgressIndicator`, `WearLinearProgressIndicator`, `WearLevelIndicator`, `WearStepperLevelIndicator`. `value` is from 0 to `max` (default 100). Omitting it enables indeterminate progress. Set `segments`, `label`, and `value-text` where useful. Level indicators overlay a positioned parent.             |
| Scrolling                 | `WearScrollIndicator` takes CSS-pixel `position`, `viewport`, and `content`. `WearList` adds `snap`, a `scroll-info` event, and exposed `scrollTo(top)` and `scrollToItem(index)` methods.                                                                                                                                                                                                       |
| Virtual lists             | `WearTransformingLazyColumn` accepts `items`, stable `item-key(item,index)`, `estimated-height` in dp, and `overscan`. The default slot receives `item` and `index`. Header/footer slots and `scrollToIndex(index)` are available. Rows are measured and only the visible range plus overscan is mounted. Store item state outside row components.                                               |
| Picker wheels             | `WearPicker` accepts `options: { value, label, disabled? }[]`, `label`, `disabled`, and string/number `v-model`. Use `WearPickerGroup` for left/right keyboard focus between wheels. Up/down skips disabled options. Touch scrolling snaps to a selected row.                                                                                                                                    |
| Dates and times           | `WearDatePicker` uses `YYYY-MM-DD`, `locale`, `min-year`, `max-year`, and optional column `labels`. `WearTimePicker` uses `HH:mm` or `HH:mm:ss`, optional `seconds`, and `hour-cycle="h12"` or `"h23"`. `WearDurationPicker` uses integer seconds with configurable `hours`, `seconds`, and `max-hours`. Values normalize when changed through the control.                                      |
| Picker screens            | Compose wheels inside `WearPickerScreen` with `title`, `confirm-label`, and `@confirm`. It provides compact round-screen positioning. It can occupy a screen or the `content` slot of `WearDialog`.                                                                                                                                                                                              |
| Dialogs                   | `WearDialog`, `WearAlertDialog`, `WearConfirmationDialog`, `WearSuccessConfirmationDialog`, `WearFailureConfirmationDialog`, `WearOpenOnPhoneDialog` use boolean `v-model`. Dialogs provide native focus containment, Escape dismissal, opener focus restoration, and scrollable round-screen content. Give a generic dialog a `label` or `title` slot.                                          |
| Dialog content            | `WearDialogContent`, `WearAlertDialogContent`, `WearConfirmationDialogContent`, `WearSuccessConfirmationDialogContent`, `WearFailureConfirmationDialogContent`, `WearOpenOnPhoneDialogContent` render the corresponding content within an existing screen or overlay.                                                                                                                            |
| Confirmation              | Alert dialogs emit `confirm` / `cancel` and accept `confirm-label`, `cancel-label`, `confirm-disabled`, `edge`, and `dismiss-on-escape`. Confirmation dialogs have `title`, `duration` in milliseconds (default 3000, 0 for manual close), `close-label`, and a `dismiss` event. The phone dialog renders feedback for an application-managed handoff.                                           |
| Scaffolds and pages       | `WearAppScaffold` aliases `WearScaffold`. `WearScreenScaffold` coordinates list scrolling, time, and the `edge` slot. `WearHorizontalPager`, `WearVerticalPager`, both `*PagerScaffold` variants, and both `*PageIndicator` variants share `WearPager` / `WearPageIndicator` APIs. `WearAnimatedPage` takes `active`.                                                                            |
| Swipe actions             | `WearSwipeToReveal` uses boolean `v-model`, `primary-label`, optional `secondary-label`, and `primary` / `secondary` events. A visible actions control supplies a keyboard/touch alternative. Set `undone` to show the `undo` slot/button and handle the `undo` event.                                                                                                                           |
| Dismiss and navigation    | `WearSwipeToDismissBox` and `WearBasicSwipeToDismissBox` use boolean `v-model` for dismissal, `edge-only`, `disabled`, and `dismiss-label`. `WearNavigation` takes an array of `{ id, route, label }` entries in `v-model`, caches stacked screens, exposes named route slots, and handles back gestures and buttons. Integrate the stack with application routing as needed.                    |
| Curved layout             | `WearCurvedLayout` provides `radius`, `angle`, and top/bottom `position`. `WearCurvedText` takes `text` and overrides those settings. `WearCurvedBox` places ordinary content with `angle`, `radius`, `size`, and optional rotation. `WearCurvedRow` distributes children by angle, `WearCurvedColumn` by radius, using `spacing`. Geometry uses a 240-unit square.                              |
| Theme and ambient         | `WearMaterialTheme` accepts `colors`, `typography`, `font-family`, and `reduced-motion`. `WearScaffold ambient` and `WearAmbientMode active` render an inert monochrome state and stop animations. `WearAmbientMode` emits minute-aligned `tick` events while active.                                                                                                                            |
| Host gestures             | `WearOneHandedGesture` receives `wear-gesture` custom events and emits `gesture`. The four `WearOneHandedGesture*Indicator` variants render temporary gesture hints followed by click content, a scroll indicator, or a page indicator. Props include `hint`, `duration`, and `label`, plus corresponding indicator data.                                                                        |
| Refresh                   | `WearPullToRefresh` takes boolean `v-model` for the refreshing state and emits `refresh`. Complete asynchronous work and set the model to false. A keyboard-accessible button is included.                                                                                                                                                                                                       |

### Screen integration

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

### Host integration and verification

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
Date pickers additionally accept inclusive `min-date` / `max-date` in
`YYYY-MM-DD` format and an explicit `order` of `day-month-year`, `month-day-year`,
or `year-month-day`. Selecting another month or year clamps the day to a valid date
within these bounds.
Native Android back dispatch, rotary haptics, ambient lifecycle, device gesture
recognition, and phone launch require application integration. Gesture rendering
and callback handling are available in the web package.

After `corepack pnpm verify:package`, serve the directory recorded in
`.consumer/current` on port 4289 with `corepack pnpm preview --port 4289 --strictPort`.
Run `WEAR_URL=http://127.0.0.1:4289 corepack pnpm test:browser` for the original
integration scenarios and `corepack pnpm test:catalog` for the extended catalog.
Both accept `WEAR_CHROMIUM` and `WEAR_ARTIFACTS` overrides. The catalog checks
physical touch targets, split events, disabled controls, radio groups, keyboard
and rotary behavior, date changes, modal focus, paging, virtual rows and swipe
actions across sizes and scale factors.
