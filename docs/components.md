# Component reference and catalog

The package includes Wear-oriented selection rows, buttons, cards, dialogs, pickers,
progress indicators, paging, gestures, curved layout and virtual lists. The baseline
is the published AndroidX Wear Compose 1.7.2 source. Duration selection and pull to
refresh additionally follow the 1.8.0-alpha04 component concepts.

Run `corepack pnpm catalog` and open `http://127.0.0.1:5174/` to browse the interactive catalog.
Open a particular family with `/?section=selection`. Other sections are
`buttons`, `cards`, `slider`, `progress`, `pickers`, `dialogs`, `horizontal`,
`vertical`, `lazy`, `gestures`, and `type`. The existing `scale`, `text`, `dir`, and
`round=false` query parameters apply to the catalog.

## Layout primitives

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

## Selection rows

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  WearSwitchButton,
  WearSplitSwitchButton,
  WearCheckboxButton,
  WearRadioGroup,
  WearRadioButton,
} from "@hanhanawa/wear-m3e-vue";

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

## Families and API

| Family                    | Exports and usage                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Buttons                   | `WearButton`, `WearFilledTonalButton`, `WearOutlinedButton`, `WearChildButton`, `WearCompactButton`, `WearIconButton`, `WearFilledIconButton`, `WearFilledTonalIconButton`, `WearOutlinedIconButton`, `WearTextButton`, `WearEdgeButton`. Common props include `variant`, `shape`, `size`, `compact`, `disabled`, `type`, and `pressed`. Named variants share the same implementation and slots. |
| Button groups and toggles | `WearButtonGroup` requires an accessible `label`. `WearIconToggleButton`, `WearTextToggleButton`, and `WearToggleButton` use boolean `v-model`. Supply an `aria-label` to icon-only buttons.                                                                                                                                                                                                     |
| Selection                 | `WearSwitchButton`, `WearSplitSwitchButton`, `WearCheckboxButton`, `WearSplitCheckboxButton`, `WearRadioButton`, `WearSplitRadioButton`, `WearRadioGroup`.                                                                                                                                                                                                                                       |
| Cards                     | `WearCard`, `WearAppCard`, `WearTitleCard`, `WearOutlinedCard`. Slots are `icon`, `name`, `time`, `title`, `subtitle`, `media`, and the default body. `actionable` makes the whole card a button. Keep nested controls in a non-actionable card.                                                                                                                                                 |
| Text and loading          | `WearText` supports `display`, `title`, `label`, `body`, and `detail` roles, `as`, and optional line clamping with `lines`. `WearIcon` takes optional `label`. `WearAnimatedText` animates changes to `value`. `WearFadingExpandingLabel` takes `text` and `expanded`. `WearPlaceholder` takes `loading`, `shimmer`, and an optional status `label`.                                             |
| List headings             | `WearListHeader` and `WearListSubHeader` accept semantic heading `level` and an optional icon slot. `WearExpandableItem` has boolean `v-model`, `label`, and expandable default content.                                                                                                                                                                                                         |
| Ranges                    | `WearSlider` and `WearStepper` have numeric `v-model`, `label`, `min`, `max`, `step`, `disabled`, `decrease-label`, and `increase-label`. The minus/plus buttons move one step per tap and repeat when held. The slider track supports keyboard and assistive input. `segmented` adds divisions. The stepper default slot receives `value` and `ratio`.                                          |
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
| Swipe actions             | `WearSwipeToReveal` uses boolean `v-model`, `primary-label`, optional `secondary-label`, and `primary` / `secondary` events. The actions appear in the existing row on swipe or from the accessible actions button. The `primary` and `secondary` slots can supply icons. Set `undone` to show the `undo` slot/button and handle the `undo` event.                                               |
| Dismiss and navigation    | `WearSwipeToDismissBox` and `WearBasicSwipeToDismissBox` use boolean `v-model` for dismissal, `edge-only`, `disabled`, and `dismiss-label`. `WearNavigation` takes an array of `{ id, route, label }` entries in `v-model`, caches stacked screens, exposes named route slots, and handles back gestures and buttons. Integrate the stack with application routing as needed.                    |
| Curved layout             | `WearCurvedLayout` provides `radius`, `angle`, and top/bottom `position`. `WearCurvedText` takes `text` and overrides those settings. `WearCurvedBox` places ordinary content with `angle`, `radius`, `size`, and optional rotation. `WearCurvedRow` distributes children by angle, `WearCurvedColumn` by radius, using `spacing`. Geometry uses a 240-unit square.                              |
| Theme and ambient         | `WearMaterialTheme` accepts `colors`, `typography`, `font-family`, and `reduced-motion`. `WearScaffold ambient` and `WearAmbientMode active` render an inert monochrome state and stop animations. `WearAmbientMode` emits minute-aligned `tick` events while active.                                                                                                                            |
| Host gestures             | `WearOneHandedGesture` receives `wear-gesture` custom events and emits `gesture`. The four `WearOneHandedGesture*Indicator` variants render temporary gesture hints followed by click content, a scroll indicator, or a page indicator. Props include `hint`, `duration`, and `label`, plus corresponding indicator data.                                                                        |
| Refresh                   | `WearPullToRefresh` takes boolean `v-model` for the refreshing state and emits `refresh`. Its top-center indicator follows a downward pull. Complete asynchronous work and set the model to false. A keyboard-accessible button is included.                                                                                                                                                     |

See the [integration guide](integration.md) for screen composition, picker bounds, and host wiring.
