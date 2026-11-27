# Audit remediation record

This branch executes the fix and optimisation work recorded in the component
audit (`KSU/docs/wear-m3e`, audit date 2026-11-27, baseline commit `cccef0d`)
against the pinned AndroidX Wear Compose Material 3 sources. It records what
changed, how it was verified, and what is still open. It does not restate the
audit; the audit stays the source of the findings.

Verification for every row below: `pnpm check`, `pnpm test` (unit tests for the
geometry and token contracts), `pnpm verify:package`, and the packed-consumer
browser suites (`pnpm test:browser`, `pnpm test:catalog`) at 192dp and 240dp,
host scale 1/0.8/0.6, LTR and RTL, 150% text, reduced motion and ambient.
Numbers marked *measured* were read from the running build with Playwright, not
from the source.

## Done

| Audit item | Change | Evidence |
| --- | --- | --- |
| A01 theme roles | `src/tokens.ts` declares the 29 `ColorScheme` roles at their token values; `WearMaterialTheme` completes any partial input; `surface` is an alias for `surfaceContainer` | `tests/arcs.test.ts` "a four-role brand input…", *measured* split row under `?theme=basic`: main `rgb(51,46,60)`, tail `rgb(73,68,83)` |
| A02 typography | Full type scale (display/title/label/body/numeral/arc) with size, line height, weight, tracking and a per-role font-scale policy; legacy `--wear-type-*` aliases keep their old sizes; `WearText` gained `role` | row label *measured* 15px, detail 13px, compact 13px, list header titleMedium, card slots per `CardTokens` |
| A03 shapes/motion/disabled | Shape roles 4/8/18/26/36/full/none; motion tokens and easings from `MotionTokens`/`MotionScheme`; disabled resolves container `onSurface@0.12` and content `onSurface@0.38` per layer instead of one `opacity: 0.45` | *measured* disabled row button background `color(srgb … / 0.12)`, content `/ 0.38` |
| A04 buttons | TextButton default is now its transparent/`onSurface` table (it inherited `filled` and drew a primary background); row padding 14x6, icon spacing 6, per-slot colours; compact face 32dp inside a 48dp target with 18dp corners and 12dp horizontal padding; icon ramp 32/48/52/60 with matching 24/24/26/32 icons; row buttons no longer morph to 14dp on press | *measured* compact radius 18px, padding `0 12px`; text button background transparent |
| A05/A06 toggles and groups | Toggle pressed shape uses `shapes.small` (8dp) and checked 18dp rather than one 14/16dp pair for everything; group spacing 4dp kept, expansion algorithm still open | see Open items |
| A07 selection | Split rows draw two real containers (`surfaceContainer` / `surfaceContainerHigh`, checked `primaryContainer` + 12% `onPrimaryContainer` overlay) with 4dp inner corners; switch track/thumb/tick roles; checkbox is an 18dp box with 2dp stroke and 2dp corners and a `primaryContainer` checkmark; radio ring/dot roles; label and detail roles with the 0.9 checked detail opacity | *measured* checkbox box 18x18, border 2px, radius 2px, tick `rgb(52,75,16)`; radio ring 20dp/2dp; switch checked thumb `primaryContainer`, tick `primary` |
| A12 page indicator | 6dp dots on a 4dp pitch, 12dp track, radius `(D - 12)/2 - 2`, window of 6 with the 0.66 edge shrink, `onBackground`/30%/`background`85% roles, all in a dp-sized viewBox | *measured* dot diameter 6dp at **both** 192 and 240 (was 4.96 vs 6.20), track stroke 12dp |
| A13 time text | `arcMedium` 15dp at weight 599, `onBackground` at 80 luminance, 70° sweep clamp, dp viewBox, and the scroll threshold compared in dp | *measured* at 192: viewBox `0 0 192 192`, font-size 15px (was 12), weight 599 |
| A14 curved text | Radius is a dp distance from the screen centre; glyph size and upper/lower arc tracking follow the arc role instead of a 16-unit constant | unit-tested through `wearTypeScale`; visual check at 192/240 |
| A15 slider | 12dp selected and 4dp unselected bars, 2dp-radius separator dots placed with the native `(width + 2r) · i / visibleSegments − r` formula, distinct separator roles, `MaxSegmentSteps` density, `background@30%` unselected bar | *measured* fill 12px, bar 4px, 8 dots of 4dp, dot colours `primaryContainer` and `primary` |
| A16 stepper | 0.35/0.30/0.35 arrangement, 60x48dp control faces, `primaryContainer` container with `primary` icon, numeral role for the value | catalog "range icons…" passes icon centring at RTL/150% text |
| A17 progress | `src/arcs.ts` implements the per-family contracts: cap gap `2·asin((stroke+gap)/(D−stroke))` with `gap = stroke/3`, track and active as separate pieces, sub-gap segments degrading to a shrinking dot, gap merge at 100%, per-segment round caps, linear endpoint dot with its 4dp fade, level `secondaryDim` on the start side growing from the bottom with a 6dp stroke and a screen-derived radius, indeterminate circular motion on the native 5000ms rotation/phase keyframes, overflow wrapping | `tests/arcs.test.ts` (physical gap constant across diameters, merged ring, segmented piece counts, endpoint dot fade, level side/direction); *measured* ring strokes 12dp/8dp on an 80dp box at 240, linear bar 12dp with a 4dp endpoint dot at 65% |
| A27 reduced motion | One injected state from the theme property **or** the system preference, consumed by the list geometry as well as CSS | browser suite "reduced motion" scenario |
| A29 demo | The full-screen level indicator no longer overlays the scrolling progress list (it crossed the linear bar and competed with the list scroll indicator for the same edge); it now has its own Levels screen paired with the stepper it controls, with 28dp of clear band on both edges. The catalog theme passes a broad scheme by default and keeps `?theme=basic` for the four-role path | screenshots at 192/240, catalog suite |
| Unit contract (02 §4.2) | `src/measure.ts` converts layout boxes to logical dp through `--wear-unit`; SVG viewBoxes are in dp; screen-dependent defaults interpolate between the 192 and 240 anchors | see A12/A13/A17 rows |

Two defects were found by measuring rather than by reading the code, and both
are worth keeping in mind for future changes here:

- `useLogicalSize` first used `getBoundingClientRect()`, which includes the
  ancestor transform a transforming list applies, so a bar inside a scaled row
  computed its endpoint dot from 57% of its real width. Layout boxes
  (`ResizeObserverEntry.contentRect`, `clientWidth`) are pre-transform.
- The OKLab inverse used to derive missing tonal roles skipped cubing the LMS
  responses, so `surfaceContainerLow` came out *lighter* than its base. The
  derivation now lands close to the native ramp (low `#282330` against
  Neutral15 `#272430`).

## Open items

These are the parts of the plan this branch deliberately did not claim.

| Item | Why it is still open |
| --- | --- |
| A08 / R3 transformed **layout** height | The container and content transforms now follow the spec values, but rows are still placed at their untransformed height, so edge spacing does not tighten the way `getTransformedHeight` does. This is the highest-risk change in the plan (scroll anchoring, virtual spacers, focus reveal, per-frame measurement) and needs the native golden comparison before it is worth attempting. |
| A08 surface protocol for every control | `effect="surface"` still transforms `.wear-surface-visual`; Selection and Slider are not wired into one shared container/content transform layer. |
| A11 edge button geometry | Still a percentage-radius approximation. `ShapeHelper`/`EdgeButtonShape` (46/56/70/96dp sizes, tangent-connected path, computed `contentWindow`, continuous height-driven fades) is a self-contained package that has not been ported. |
| A18-A19 picker and date/time visuals | Item scale by distance from the centre, active-column state, numeral roles per column, locale column widths and the full next/confirm flow. Value logic (leap years, month bounds, 12/24h) is unchanged and still covered by the unit tests. |
| A20-A21 dialog layouts | Alert button-pair/stack/edge modes, curved vs linear content, per-kind confirmation artwork, and the OpenOnPhone arc explanation. Foreground/background transitions need the scaffold coordination. |
| A22-A25 continuous motion | Variable-font `AnimatedText`, measured line-by-line `FadingExpandingLabel`, per-slot placeholders, and the reveal state machine (`revealing/revealed/committing/undo`) with full-swipe primary action. |
| A26 host gesture stages | The event bridge stays a fallback; native gesture availability, priority and staged hints need a host. |
| A28 alpha extensions | DurationPicker and PullToRefresh still reference 1.8.0-alpha04 concepts without the adjusted-distance and damping contracts. |
| Square fallback | Arc chrome now derives its radius from the inscribed circle, but the plan's request to give `round=false` its own non-arc layout is not implemented. |
| Native pixel and device acceptance | No Android emulator run, no same-font same-state native golden comparison, no TalkBack, rotary, haptics or power checks. The audit's own limits still apply to this branch. |

## Compatibility notes

- Default colours moved from the mobile Material baseline to the Wear token
  values (for example `primary` `#eaddff` → `#e9ddff`), and the neutral surface
  roles are now real. Applications that pinned the old look should pass their
  own `colors`.
- `WearTextButton` no longer paints a primary background. Applications that
  wanted the filled look pass `variant="filled"`.
- Row button labels are 15sp and details 13sp (they were 16 and 14); list
  headers are titleMedium (was 20). The legacy `--wear-type-*` variables still
  resolve to their previous sizes for application CSS.
- Disabled controls no longer use a single group opacity, so screenshots of
  disabled states will differ.
- `WearList` `edge-scale` now defaults to the screen-dependent spec value
  instead of 0.73; pass `:edge-scale="0.73"` to restore the old curve.
- Progress components gained props; none of the existing `value`, `max`,
  `segments`, `label` or `value-text` contracts changed. `WearStepperLevelIndicator`
  is no longer a bare alias: it maps `min`/`max` onto the fraction.
