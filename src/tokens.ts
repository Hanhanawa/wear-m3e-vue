/* SPDX-License-Identifier: Apache-2.0 */

/**
 * Wear Material 3 (Material 3 Expressive) design tokens.
 *
 * Values are transcribed from the pinned `androidx.wear.compose:compose-material3`
 * stable sources used by the audit (see SOURCES.md):
 *   - `tokens/ColorTokens.kt` / `tokens/PaletteTokens.kt`  -> default color roles
 *   - `tokens/TypeScaleTokens.kt` / `tokens/TypographyTokens.kt` -> type roles
 *   - `tokens/ShapeTokens.kt` -> shape roles
 *   - `tokens/MotionTokens.kt` + `MotionScheme.kt` -> motion roles
 *   - `Padding.kt` -> screen padding fractions
 *   - `ColorScheme.kt:413-414` -> disabled alphas
 *
 * Every length here is a logical Wear dp/sp value. CSS turns them into device
 * pixels through `--wear-unit` (1 logical dp, already corrected for the host
 * zoom) and `--wear-font-scale`, so a "6" in this file is 6 dp on every screen
 * diameter and at every host scale.
 */

/* ------------------------------------------------------------------ colors */

/** The 29 semantic color roles of `MaterialTheme.colorScheme` (ColorScheme.kt:88-117). */
export const wearColorRoles = [
  "primary",
  "primaryDim",
  "primaryContainer",
  "onPrimary",
  "onPrimaryContainer",
  "secondary",
  "secondaryDim",
  "secondaryContainer",
  "onSecondary",
  "onSecondaryContainer",
  "tertiary",
  "tertiaryDim",
  "tertiaryContainer",
  "onTertiary",
  "onTertiaryContainer",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "onSurface",
  "onSurfaceVariant",
  "outline",
  "outlineVariant",
  "background",
  "onBackground",
  "error",
  "errorDim",
  "errorContainer",
  "onError",
  "onErrorContainer",
] as const;

export type WearColorRole = (typeof wearColorRoles)[number];

/**
 * Partial scheme: any subset of the 29 roles. Hosts that only ever passed the
 * legacy four (`primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`)
 * keep working: `resolveColorScheme()` derives the rest.
 */
export type WearColorSchemeInput = Partial<Record<WearColorRole, string>> &
  Record<string, string | undefined>;

/** Default dark scheme, from ColorTokens.kt through PaletteTokens.kt. */
export const wearDefaultColorScheme: Record<WearColorRole, string> = {
  primary: "#e9ddff", // Primary90
  primaryDim: "#d0bcff", // Primary80
  primaryContainer: "#4d3d76", // Primary30
  onPrimary: "#210f48", // Primary10
  onPrimaryContainer: "#f6edff", // Primary95
  secondary: "#dee0ff", // Secondary90
  secondaryDim: "#bac3ff", // Secondary80
  secondaryContainer: "#3a4376", // Secondary30
  onSecondary: "#0c1649", // Secondary10
  onSecondaryContainer: "#f0efff", // Secondary95
  tertiary: "#ffdcc2", // Tertiary90
  tertiaryDim: "#ffb77a", // Tertiary80
  tertiaryContainer: "#6c3a03", // Tertiary30
  onTertiary: "#2e1500", // Tertiary10
  onTertiaryContainer: "#ffece2", // Tertiary95
  surfaceContainerLow: "#272430", // Neutral15
  surfaceContainer: "#332e3c", // Neutral20
  surfaceContainerHigh: "#494453", // Neutral30
  onSurface: "#f6edff", // Neutral95
  onSurfaceVariant: "#cac4d0", // NeutralVariant80
  outline: "#948f9a", // NeutralVariant60
  outlineVariant: "#615d67", // NeutralVariant40
  background: "#000000", // Neutral0
  onBackground: "#ffffff", // Neutral100
  error: "#f2b8b5", // Error80
  errorDim: "#ec928e", // Error70
  errorContainer: "#8c1d18", // Error30
  onError: "#410e0b", // Error10
  onErrorContainer: "#fceeee", // Error95
};

/**
 * Project extension, kept outside the official roles: the library has always
 * had a semantic warning surface and it has no Wear `ColorScheme` counterpart.
 */
export const wearExtensionColors: Record<string, string> = {
  warning: "#ffb961",
  warningContainer: "#693b04",
  onWarningContainer: "#ffdfa8",
  indicatorTrack: "#1e1c21",
  indicatorInactive: "#77727c",
  indicatorActive: "#ffffff",
};

/* ------------------------------------------------------------- oklch maths */

/**
 * Tonal derivation for hosts that supply anchors instead of a full scheme.
 * Implemented in OKLab (the space the Material tonal ramp is built on) so that
 * "one step darker" means the same thing for every hue.
 */
const LIN = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const DELIN = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;

function hexToOklab(color: string): [number, number, number] | null {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(color.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  const [r, g, b] = [0, 2, 4].map((i) =>
    LIN(parseInt(hex.slice(i, i + 2), 16) / 255),
  );
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024617 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827718638 * m - 0.8086757623 * s,
  ];
}

function oklabToHex([l, a, b]: [number, number, number]): string {
  // The forward pass took a cube root of the LMS responses, so the inverse has
  // to cube them again before converting back to linear sRGB.
  const x = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const y = (l - 0.1055613458 * a - 0.0638541729 * b) ** 3;
  const z = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const [r, g, bl] = [
    4.0767416621 * x - 3.3077115913 * y + 0.2309699292 * z,
    -1.2684380046 * x + 2.6097574011 * y - 0.3413193965 * z,
    -0.0041960863 * x - 0.7034186147 * y + 1.707614701 * z,
  ].map((c) => DELIN(Math.min(1, Math.max(0, c))));
  return (
    "#" +
    [r, g, bl]
      .map((c) => Math.round(c * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Shift a color along the tonal ramp. `step` is in Material tone units/100. */
export function toneShift(color: string, step: number): string {
  const lab = hexToOklab(color);
  if (!lab) return color;
  lab[0] = Math.min(1, Math.max(0, lab[0] + step));
  return oklabToHex(lab);
}

/* ------------------------------------------------------------- resolution */

/** Legacy single-surface alias, kept for one migration window (audit A01). */
const roleAliases: Record<string, string> = {
  surface: "surfaceContainer",
  onSurfaceVariantLegacy: "onSurfaceVariant",
};

function camelCase(name: string): string {
  return name.replace(/[-_]([a-z])/gi, (_, c: string) => c.toUpperCase());
}

/**
 * Expand a partial (possibly legacy-named) scheme into the complete 29-role
 * set plus the project extensions, so that every consumer resolves a real
 * color: no role is ever left empty.
 *
 * Derivation contract (documented in docs/components.md):
 *   - `surface` maps onto `surfaceContainer`; the container family is then
 *     derived from it (low -0.045, high +0.055 in OKLab lightness).
 *   - `primaryDim`/`secondaryDim`/`tertiaryDim` follow their accent anchor.
 *   - Anything not supplied and not derivable keeps the Wear default token.
 */
export function resolveColorScheme(
  input?: WearColorSchemeInput,
): Record<string, string> {
  const provided: Record<string, string> = {};
  for (const [key, value] of Object.entries(input ?? {})) {
    if (!value) continue;
    const name = camelCase(key);
    const role = roleAliases[name] ?? name;
    provided[role] = value;
  }

  const scheme: Record<string, string> = {
    ...wearDefaultColorScheme,
    ...wearExtensionColors,
    ...provided,
  };

  // `surface` is an alias, never its own variable, so that a legacy override
  // still repaints the container roles the components consume.
  if (provided.surfaceContainer) {
    if (!provided.surfaceContainerLow)
      scheme.surfaceContainerLow = toneShift(provided.surfaceContainer, -0.045);
    if (!provided.surfaceContainerHigh)
      scheme.surfaceContainerHigh = toneShift(provided.surfaceContainer, 0.055);
  }
  const accents = [
    ["primary", "primaryDim", "onPrimary"],
    ["secondary", "secondaryDim", "onSecondary"],
    ["tertiary", "tertiaryDim", "onTertiary"],
  ] as const;
  for (const [anchor, dim] of accents) {
    // Primary90 -> Primary80 is the documented dim step.
    if (provided[anchor] && !provided[dim])
      scheme[dim] = toneShift(provided[anchor], -0.09);
  }
  if (provided.error && !provided.errorDim)
    scheme.errorDim = toneShift(provided.error, -0.09);

  // Scroll/page indicators derive from onBackground exactly as the native
  // brightness roles do, so a host that only changes text color still moves
  // them with it.
  if (provided.onBackground) {
    if (!provided.indicatorInactive)
      scheme.indicatorInactive = toneShift(provided.onBackground, -0.35);
    scheme.indicatorActive = provided.indicatorActive ?? "#ffffff";
  }
  return scheme;
}

/** CSS custom properties for a resolved scheme. */
export function colorSchemeVars(
  input?: WearColorSchemeInput,
): Record<string, string> {
  const scheme = resolveColorScheme(input);
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(scheme))
    vars[`--wear-color-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] =
      value;
  return vars;
}

/* ----------------------------------------------------------------- shapes */

/** `tokens/ShapeTokens.kt:28-34`. */
export const wearShapes = {
  extraSmall: 4,
  small: 8,
  medium: 18,
  large: 26,
  extraLarge: 36,
} as const;

export type WearShapeRole = keyof typeof wearShapes;

/* --------------------------------------------------------------- type roles */

export interface WearTypeRole {
  /** sp */
  size: number;
  /** sp */
  lineHeight: number;
  /** variable weight axis */
  weight: number;
  /** sp letter-spacing (TrackingTop) */
  tracking: number;
  /** sp counter-clockwise letter-spacing, used on the lower arc (TrackingBottom) */
  trackingBottom?: number;
  /**
   * Font-scale policy: "full" follows the host scale, "limited" compresses it
   * and "fixed" ignores it. Wear reserves the large display/numeral ramps for
   * glanceable values, so those must not grow without bound (audit 02 §4.2).
   */
  scaling?: "full" | "limited" | "fixed";
}

/** `tokens/TypeScaleTokens.kt`, the roles this library consumes. */
export const wearTypeScale = {
  displayLarge: { size: 40, lineHeight: 44, weight: 500, tracking: 0.2, scaling: "limited" },
  displayMedium: { size: 30, lineHeight: 34, weight: 520, tracking: 0.2, scaling: "limited" },
  displaySmall: { size: 24, lineHeight: 26, weight: 550, tracking: 0.2, scaling: "limited" },
  titleLarge: { size: 18, lineHeight: 20, weight: 500, tracking: 0.2 },
  titleMedium: { size: 16, lineHeight: 18, weight: 550, tracking: 0.4 },
  titleSmall: { size: 14, lineHeight: 16, weight: 550, tracking: 0.4 },
  labelLarge: { size: 20, lineHeight: 22, weight: 500, tracking: 0.4 },
  labelMedium: { size: 15, lineHeight: 18, weight: 500, tracking: 0.4 },
  labelSmall: { size: 13, lineHeight: 16, weight: 500, tracking: 0.4 },
  bodyLarge: { size: 16, lineHeight: 18, weight: 450, tracking: 0.4 },
  bodyMedium: { size: 14, lineHeight: 16, weight: 450, tracking: 0.4 },
  bodySmall: { size: 12, lineHeight: 14, weight: 500, tracking: 0.4 },
  numeralExtraLarge: { size: 60, lineHeight: 60, weight: 560, tracking: 0, scaling: "limited" },
  numeralLarge: { size: 50, lineHeight: 50, weight: 580, tracking: 0, scaling: "limited" },
  numeralMedium: { size: 40, lineHeight: 40, weight: 580, tracking: 0, scaling: "limited" },
  numeralSmall: { size: 30, lineHeight: 30, weight: 550, tracking: 0, scaling: "limited" },
  numeralExtraSmall: { size: 24, lineHeight: 24, weight: 550, tracking: 0, scaling: "limited" },
  arcLarge: { size: 18, lineHeight: 22, weight: 599, tracking: 0.4, trackingBottom: 1.6, scaling: "fixed" },
  arcMedium: { size: 15, lineHeight: 18, weight: 599, tracking: 0.6, trackingBottom: 1.4, scaling: "fixed" },
  arcSmall: { size: 14, lineHeight: 16, weight: 560, tracking: 0.6, trackingBottom: 1.4, scaling: "fixed" },
} satisfies Record<string, WearTypeRole>;

export type WearTypeRoleName = keyof typeof wearTypeScale;

/**
 * Migration map for the five roles this library shipped before the audit.
 * The legacy CSS variables keep their original sizes so that existing hosts do
 * not silently change meaning; components switch to the explicit roles above.
 */
export const wearLegacyTypeAliases = {
  display: "displayMedium", // shipped at 32 sp, between displayMedium and -Large
  title: "titleLarge", // shipped at 20 sp
  label: "labelMedium", // shipped at 16 sp
  body: "bodyLarge", // shipped at 16 sp
  detail: "labelSmall", // shipped at 14 sp
} satisfies Record<string, WearTypeRoleName>;

/* ----------------------------------------------------------------- motion */

/**
 * `MotionScheme.kt` standard/expressive springs, expressed as the CSS
 * equivalents this library can actually evaluate, together with
 * `tokens/MotionTokens.kt` durations (ms) and easings.
 */
export const wearMotion = {
  spatial: {
    standard: { dampingRatio: 1.0, stiffness: 500, css: "cubic-bezier(0.2, 0, 0, 1)" },
    fast: { dampingRatio: 1.0, stiffness: 1400, css: "cubic-bezier(0.2, 0, 0, 1)" },
    slow: { dampingRatio: 1.0, stiffness: 260, css: "cubic-bezier(0.05, 0.7, 0.1, 1)" },
  },
  expressive: {
    standard: { dampingRatio: 0.75, stiffness: 350, css: "cubic-bezier(0.05, 0.7, 0.2, 1)" },
    fast: { dampingRatio: 0.7, stiffness: 800, css: "cubic-bezier(0.05, 0.7, 0.2, 1)" },
    slow: { dampingRatio: 0.8, stiffness: 200, css: "cubic-bezier(0.05, 0.7, 0.1, 1)" },
  },
  durations: { short1: 50, short2: 100, short3: 150, short4: 200, medium1: 250, medium2: 300, medium3: 350, medium4: 400, long1: 450, long2: 500 },
  easings: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    standardAccelerate: "cubic-bezier(0.3, 0, 1, 1)",
    standardDecelerate: "cubic-bezier(0, 0, 0, 1)",
    emphasizedAccelerate: "cubic-bezier(0.3, 0, 0.8, 0.15)",
    emphasizedDecelerate: "cubic-bezier(0.05, 0.7, 0.1, 1)",
  },
} as const;

/** `ColorScheme.kt:413-414`. */
export const wearDisabledAlpha = { container: 0.12, content: 0.38 } as const;

/* -------------------------------------------------------------- component */

/** Screen padding fractions, `Padding.kt:34-73`. */
export const wearPadding = {
  verticalContentFraction: 0.1,
  horizontalContentFraction: 0.052,
  edge: 2,
  topListContentFraction: 0.13,
  bottomListContentFraction: 0.23,
} as const;

/** Progress-family contracts, cited where each value is used. */
export const wearProgress = {
  /** CircularProgressIndicatorDefaults.largeStrokeWidth: 192 -> 8, 240 -> 12. */
  circularLargeStroke: [8, 12] as const,
  /** smallStrokeWidth: 192 -> 5, 240 -> 8. */
  circularSmallStroke: [5, 8] as const,
  /** calculateRecommendedGapSize(strokeWidth) = strokeWidth / 3f. */
  gapOverStroke: 3,
  /** CircularProgressIndicatorDefaults.StartAngle. */
  startAngle: 270,
  /** GapExtraProgress, the merged-gap window at 100%. */
  gapExtraProgress: 0.05,
  /** IndeterminateStrokeWidth / IndeterminateCircularIndicatorDiameter. */
  indeterminateStroke: 3,
  indeterminateDiameter: 24,
  /** ArcProgressIndicatorDefaults: 65° -> 115°, 6 dp stroke. */
  arcStroke: 6,
  arcStart: 65,
  arcEnd: 115,
  /** LinearProgressIndicatorDefaults. */
  linearStroke: { large: 12, small: 8 },
  linearOuterMargin: 2,
  linearDotRadius: 2,
  linearDotMargin: 4,
  /** LevelIndicatorDefaults. */
  levelSweepAngle: 72,
  levelStroke: 6,
  /** ScrollIndicator: 5 dp below 225 dp, 6 dp at or above. */
  scrollStroke: [5, 6] as const,
  scrollGap: 3,
  scrollMiddleSection: 25,
  /** PageIndicator: 6 dp dots, 4 dp spacing, 3 dp background radius. */
  pageDot: 6,
  pageSpacing: 4,
  pageBackgroundRadius: 3,
  pageMaxVisible: 6,
  pageSmallIndicatorFraction: 0.66,
  /** Slider.kt:852-858. */
  sliderSelectedBar: 12,
  sliderUnselectedBar: 4,
  sliderSeparatorRadius: 2,
  sliderSegmentBarPadding: 4,
  sliderMaxSegmentSteps: 8,
  /** Stepper.kt:468-484. */
  stepperWeights: [0.35, 0.3, 0.35],
  stepperButton: { width: 60, height: 48 },
  /** Screen anchors used by ResponsiveTransformationSpec + isSmallScreen(). */
  smallScreen: 192,
  largeScreen: 240,
  /**
   * ResponsiveTransformationSpec.kt:102,169: the container scale at the edge
   * of the list is 0.7 on a 192 screen and 0.6 on a 240 one, and both the
   * container and the content alpha reach 0.5 there (":100-101, :167-168").
   */
  listEdgeScale: [0.7, 0.6] as const,
  listAlphaEdge: 0.5,
} as const;

/**
 * Interpolate a screen-size-dependent stroke exactly like the native
 * `if (isSmallScreen()) a else b` pair, so a component sized between 192 and
 * 240 dp gets a value on the same ramp instead of a step.
 */
export function screenScaled(
  diameter: number,
  [small, large]: readonly [number, number],
): number {
  const d = Math.min(1, Math.max(0, (diameter - wearProgress.smallScreen) /
    (wearProgress.largeScreen - wearProgress.smallScreen)));
  return small + (large - small) * d;
}
