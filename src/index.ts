export { default as WearScaffold } from "./components/WearScaffold.vue";
export { default as WearTimeText } from "./components/WearTimeText.vue";
export { default as WearPager } from "./components/WearPager.vue";
export { default as WearPageIndicator } from "./components/WearPageIndicator.vue";
export { default as WearList } from "./components/WearList.vue";
export { default as WearListItem } from "./components/WearListItem.vue";
export { default as WearTitle } from "./components/WearTitle.vue";
export { default as WearStatusCard } from "./components/WearStatusCard.vue";
export { default as WearAlert } from "./components/WearAlert.vue";

export { default as WearMaterialTheme } from "./components/WearMaterialTheme.vue";
export { default as WearAppScaffold } from "./components/WearScaffold.vue";
export { default as WearScreenScaffold } from "./components/WearScreenScaffold.vue";
export { default as WearAnimatedPage } from "./components/WearAnimatedPage.vue";
export { default as WearTransformingLazyColumn } from "./components/WearTransformingLazyColumn.vue";
export { default as WearScrollIndicator } from "./components/WearScrollIndicator.vue";
export { default as WearRadioGroup } from "./components/WearRadioGroup.vue";
export { default as WearButtonGroup } from "./components/WearButtonGroup.vue";
export { default as WearSlider } from "./components/WearSlider.vue";
export { default as WearStepper } from "./components/WearStepper.vue";
export { default as WearPicker } from "./components/WearPicker.vue";
export { default as WearPickerGroup } from "./components/WearPickerGroup.vue";
export { default as WearDatePicker } from "./components/WearDatePicker.vue";
export { default as WearTimePicker } from "./components/WearTimePicker.vue";
export { default as WearDurationPicker } from "./components/WearDurationPicker.vue";
export { default as WearDialog } from "./components/WearDialog.vue";
export { default as WearDialogContent } from "./components/WearDialogContent.vue";
export { default as WearAlertDialogContent } from "./components/WearAlertDialogContent.vue";
export { default as WearPickerScreen } from "./components/WearPickerScreen.vue";
export { default as WearAlertDialog } from "./components/WearAlertDialog.vue";
export { default as WearText } from "./components/WearText.vue";
export { default as WearIcon } from "./components/WearIcon.vue";
export { default as WearAnimatedText } from "./components/WearAnimatedText.vue";
export { default as WearFadingExpandingLabel } from "./components/WearFadingExpandingLabel.vue";
export { default as WearPlaceholder } from "./components/WearPlaceholder.vue";
export { default as WearExpandableItem } from "./components/WearExpandableItem.vue";
export { default as WearSwipeToReveal } from "./components/WearSwipeToReveal.vue";
export { default as WearSwipeToDismissBox } from "./components/WearSwipeToDismissBox.vue";
export { default as WearNavigation } from "./components/WearNavigation.vue";
export { default as WearPullToRefresh } from "./components/WearPullToRefresh.vue";
export { default as WearAmbientMode } from "./components/WearAmbientMode.vue";
export { default as WearOneHandedGesture } from "./components/WearOneHandedGesture.vue";
export { default as WearCurvedLayout } from "./components/WearCurvedLayout.vue";
export { default as WearCurvedText } from "./components/WearCurvedText.vue";
export { default as WearCurvedBox } from "./components/WearCurvedBox.vue";

import { variant } from "./variants";
import WearButton from "./components/WearButton.vue";
import WearToggleButton from "./components/WearToggleButton.vue";
import WearSelectionButton from "./components/WearSelectionButton.vue";
import WearCard from "./components/WearCard.vue";
import WearListHeader from "./components/WearListHeader.vue";
import WearProgressIndicator from "./components/WearProgressIndicator.vue";
import WearConfirmationDialog from "./components/WearConfirmationDialog.vue";
import WearConfirmationDialogContent from "./components/WearConfirmationDialogContent.vue";
import WearPager from "./components/WearPager.vue";
import WearPageIndicator from "./components/WearPageIndicator.vue";
import WearPagerScaffold from "./components/WearPagerScaffold.vue";
import WearGestureIndicator from "./components/WearGestureIndicator.vue";
import WearCurvedArrangement from "./components/WearCurvedArrangement";
import WearSwipeToDismissBox from "./components/WearSwipeToDismissBox.vue";

export {
  WearButton,
  WearToggleButton,
  WearCard,
  WearListHeader,
  WearProgressIndicator,
  WearConfirmationDialog,
  WearConfirmationDialogContent,
};
export const WearFilledTonalButton = variant(
  WearButton,
  "WearFilledTonalButton",
  { variant: "tonal" },
);
export const WearOutlinedButton = variant(WearButton, "WearOutlinedButton", {
  variant: "outlined",
});
export const WearChildButton = variant(WearButton, "WearChildButton", {
  variant: "child",
});
export const WearCompactButton = variant(WearButton, "WearCompactButton", {
  compact: true,
});
export const WearIconButton = variant(WearButton, "WearIconButton", {
  shape: "round",
  variant: "child",
});
export const WearFilledIconButton = variant(
  WearButton,
  "WearFilledIconButton",
  { shape: "round", variant: "filled" },
);
export const WearFilledTonalIconButton = variant(
  WearButton,
  "WearFilledTonalIconButton",
  { shape: "round", variant: "tonal" },
);
export const WearOutlinedIconButton = variant(
  WearButton,
  "WearOutlinedIconButton",
  { shape: "round", variant: "outlined" },
);
export const WearTextButton = variant(WearButton, "WearTextButton", {
  shape: "round",
});
export const WearEdgeButton = variant(WearButton, "WearEdgeButton", {
  shape: "edge",
});
export const WearIconToggleButton = variant(
  WearToggleButton,
  "WearIconToggleButton",
  {},
);
export const WearTextToggleButton = variant(
  WearToggleButton,
  "WearTextToggleButton",
  {},
);
export const WearSwitchButton = variant(
  WearSelectionButton,
  "WearSwitchButton",
  { kind: "switch" },
);
export const WearSplitSwitchButton = variant(
  WearSelectionButton,
  "WearSplitSwitchButton",
  { kind: "switch", split: true },
);
export const WearCheckboxButton = variant(
  WearSelectionButton,
  "WearCheckboxButton",
  { kind: "checkbox" },
);
export const WearSplitCheckboxButton = variant(
  WearSelectionButton,
  "WearSplitCheckboxButton",
  { kind: "checkbox", split: true },
);
export const WearRadioButton = variant(WearSelectionButton, "WearRadioButton", {
  kind: "radio",
});
export const WearSplitRadioButton = variant(
  WearSelectionButton,
  "WearSplitRadioButton",
  { kind: "radio", split: true },
);
export const WearAppCard = variant(WearCard, "WearAppCard", {});
export const WearTitleCard = variant(WearCard, "WearTitleCard", {});
export const WearOutlinedCard = variant(WearCard, "WearOutlinedCard", {
  variant: "outlined",
});
export const WearListSubHeader = variant(WearListHeader, "WearListSubHeader", {
  subheader: true,
});
export const WearCircularProgressIndicator = variant(
  WearProgressIndicator,
  "WearCircularProgressIndicator",
  { variant: "circular" },
);
export const WearLinearProgressIndicator = variant(
  WearProgressIndicator,
  "WearLinearProgressIndicator",
  { variant: "linear" },
);
export const WearArcProgressIndicator = variant(
  WearProgressIndicator,
  "WearArcProgressIndicator",
  { variant: "arc" },
);
export const WearSegmentedCircularProgressIndicator = variant(
  WearProgressIndicator,
  "WearSegmentedCircularProgressIndicator",
  { variant: "segmented" },
);
export const WearLevelIndicator = variant(
  WearProgressIndicator,
  "WearLevelIndicator",
  { variant: "level" },
);
export const WearStepperLevelIndicator = variant(
  WearProgressIndicator,
  "WearStepperLevelIndicator",
  { variant: "level" },
);
export const WearSuccessConfirmationDialog = variant(
  WearConfirmationDialog,
  "WearSuccessConfirmationDialog",
  { kind: "success" },
);
export const WearFailureConfirmationDialog = variant(
  WearConfirmationDialog,
  "WearFailureConfirmationDialog",
  { kind: "failure" },
);
export const WearOpenOnPhoneDialog = variant(
  WearConfirmationDialog,
  "WearOpenOnPhoneDialog",
  { kind: "phone" },
);
export const WearSuccessConfirmationDialogContent = variant(
  WearConfirmationDialogContent,
  "WearSuccessConfirmationDialogContent",
  { kind: "success" },
);
export const WearFailureConfirmationDialogContent = variant(
  WearConfirmationDialogContent,
  "WearFailureConfirmationDialogContent",
  { kind: "failure" },
);
export const WearOpenOnPhoneDialogContent = variant(
  WearConfirmationDialogContent,
  "WearOpenOnPhoneDialogContent",
  { kind: "phone" },
);
export const WearHorizontalPager = variant(WearPager, "WearHorizontalPager", {
  orientation: "horizontal",
});
export const WearVerticalPager = variant(WearPager, "WearVerticalPager", {
  orientation: "vertical",
});
export const WearHorizontalPageIndicator = variant(
  WearPageIndicator,
  "WearHorizontalPageIndicator",
  { orientation: "horizontal" },
);
export const WearVerticalPageIndicator = variant(
  WearPageIndicator,
  "WearVerticalPageIndicator",
  { orientation: "vertical" },
);
export const WearHorizontalPagerScaffold = variant(
  WearPagerScaffold,
  "WearHorizontalPagerScaffold",
  { orientation: "horizontal" },
);
export const WearVerticalPagerScaffold = variant(
  WearPagerScaffold,
  "WearVerticalPagerScaffold",
  { orientation: "vertical" },
);
export const WearOneHandedGestureClickIndicator = variant(
  WearGestureIndicator,
  "WearOneHandedGestureClickIndicator",
  { kind: "click" },
);
export const WearOneHandedGestureScrollIndicator = variant(
  WearGestureIndicator,
  "WearOneHandedGestureScrollIndicator",
  { kind: "scroll" },
);
export const WearOneHandedGestureHorizontalPageIndicator = variant(
  WearGestureIndicator,
  "WearOneHandedGestureHorizontalPageIndicator",
  { kind: "horizontal" },
);
export const WearOneHandedGestureVerticalPageIndicator = variant(
  WearGestureIndicator,
  "WearOneHandedGestureVerticalPageIndicator",
  { kind: "vertical" },
);
export const WearCurvedRow = variant(WearCurvedArrangement, "WearCurvedRow", {
  radial: false,
});
export const WearCurvedColumn = variant(
  WearCurvedArrangement,
  "WearCurvedColumn",
  { radial: true },
);
export const WearBasicSwipeToDismissBox = variant(
  WearSwipeToDismissBox,
  "WearBasicSwipeToDismissBox",
  { showDismissButton: false },
);

export {
  dispatchWearRotary,
  dispatchWearGesture,
  useWearRotary,
} from "./input";
export type {
  WearDirection,
  WearPage,
  WearPagerLabels,
  WearPickerOption,
  WearScrollInfo,
  WearButtonVariant,
  WearTextVariant,
  WearGestureAction,
  WearNavigationEntry,
} from "./types";

import "./style.css";
import "./components.css";
