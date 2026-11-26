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
