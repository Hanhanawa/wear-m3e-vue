export interface WearPage {
  id: string;
  label: string;
}

export interface WearPagerLabels {
  previous: string;
  next: string;
  position: (index: number, count: number, label: string) => string;
}

export type WearDirection = "ltr" | "rtl";

export interface WearPickerOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface WearScrollInfo {
  position: number;
  maximum: number;
  viewport: number;
  content: number;
}

export type WearButtonVariant = "filled" | "tonal" | "outlined" | "child";
export type WearTextVariant = "display" | "title" | "label" | "body" | "detail";
export type WearGestureAction = "click" | "next" | "previous" | "dismiss";

export interface WearNavigationEntry {
  id: string;
  route: string;
  label: string;
}
