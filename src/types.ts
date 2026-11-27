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

/**
 * `text` is the TextButton table: a transparent container with onSurface
 * content. Before it existed `WearTextButton` inherited `filled` and drew a
 * primary background, which is not the native default
 * (TextButton.kt:557-571, TextButtonTokens.kt:25-32).
 */
export type WearButtonVariant =
  | "filled"
  | "tonal"
  | "outlined"
  | "child"
  | "text";

/**
 * The five roles this library shipped with. They still resolve to their old
 * sizes through the `--wear-type-*` aliases; new code should name an explicit
 * Wear role instead.
 */
export type WearTextVariant = "display" | "title" | "label" | "body" | "detail";

/** Arc placement shared by level and scroll indicators. */
export type WearIndicatorSide = "start" | "end";

export type WearGestureAction = "click" | "next" | "previous" | "dismiss";

export interface WearNavigationEntry {
  id: string;
  route: string;
  label: string;
}
