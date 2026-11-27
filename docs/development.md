# Development and verification

Use Node.js 24 and Corepack from the repository root. The repository's `packageManager` pins pnpm.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm check
corepack pnpm test
corepack pnpm build
```

## Preview from the checkout

Run `corepack pnpm demo` for the four-page demo on port 5173 and `corepack pnpm catalog` for the component catalog on port 5174. These commands select the page at the root URL and fail if their port is occupied. Run them in separate terminals. `corepack pnpm example` serves the original query-based entry, where `/?catalog` opens the catalog. Rebuild the library after changes to its source.

## Working with the dp contract

Every size in this library is a logical Wear dp, converted once: `d` dp becomes
`d / hostScale` CSS px through `calc(d * var(--wear-unit))`, and the host scales
the WebView back up. Two consequences are worth knowing before changing a
component.

An SVG cannot carry CSS units in its `viewBox`, so a component measures its own
box, divides by `--wear-unit`, and writes that number as its viewBox. One user
unit is then one dp, and strokes, dots and arc text keep their physical size at
192dp, 240dp and any host scale. Never hard-code a 240-unit coordinate space
again; that is what made a "6 unit" dot render as 4.96dp on a small screen.

Measure layout boxes, not visual boxes. `getBoundingClientRect()` includes the
transform a transforming list applies to its rows, so an element inside a row
scaled to 0.57 reports 57% of its real width and every radius, dot and gap
derived from it shrinks with it. `ResizeObserverEntry.contentRect` and
`clientWidth` are pre-transform, which is what `src/measure.ts` uses. When
checking a value in a browser, read `offsetWidth` or the computed `blockSize`
rather than the bounding rectangle, or the scaled row will look wrong when it is
correct.

## Test as an independent Vue consumer

```sh
corepack pnpm verify:package
corepack pnpm exec playwright install --only-shell chromium
corepack pnpm --dir "$(cat .consumer/current)" preview --port 4287 --strictPort
```

On Linux, add `--with-deps` to the Playwright install command if system browser dependencies are missing. In another terminal at the library root, run both suites against the same preview.

```sh
WEAR_URL=http://127.0.0.1:4287 corepack pnpm test:browser
WEAR_URL=http://127.0.0.1:4287 corepack pnpm test:catalog
```

The verifier builds the library, packs the ESM, types, and CSS, and installs that archive into a temporary Vue application outside the checkout. It type-checks and builds the app against the public exports. `.consumer/current` records the preview directory, and `.consumer/tarball` records the exact archive to reuse.

Both suites accept `WEAR_CHROMIUM` to reuse a compatible executable and `WEAR_ARTIFACTS` to override the screenshot directory. They model 192dp and 240dp round screens and host zoom with an externally transformed iframe. The catalog covers touch targets, split events, disabled controls, radio groups, keyboard and rotary behavior, dates, dialog focus, paging, virtual rows, and swipe actions. For manual checks, the preview accepts `?scale=0.8&text=1.35&dir=rtl`.

## CI and merge checks

The CI workflow runs for pull requests targeting `main` and pushes to `main`. Configure the **Verify package** job from the **CI** workflow as the required check on `main` after the first run. It covers the frozen root install, type-check, unit tests, packed consumer build and both browser suites.

After a successful run, download the `wear-m3e-vue-package` artifact from that run's summary. It contains the same `.tgz` the consumer installed and a `SHA256SUMS` file. From the extracted artifact directory, run `sha256sum -c SHA256SUMS` before installing it. CI artifacts are retained for 14 days.

## Stage an npm release

Use npm CLI 11.15.0 or later. After **Verify package** passes for the release commit on `main`, download and extract its `wear-m3e-vue-package` artifact. Use the npm account with publish access to the `@hanhanawa` scope and enable two-factor authentication for approval.

From the extracted artifact directory, verify the checksum and stage the tested archive.

```sh
set -- ./hanhanawa-wear-m3e-vue-*.tgz
test "$#" -eq 1 && test -f "$1" &&
sha256sum -c SHA256SUMS &&
npm whoami --registry https://registry.npmjs.org/ &&
npm stage publish "$1" --access public --registry https://registry.npmjs.org/
```

Review the stage ID and package contents in npm's **Staged Packages** interface or with `npm stage view <stage-id>`. The release becomes public after a maintainer approves it with two-factor authentication. [npm staged publishing](https://docs.npmjs.com/staged-publishing/)
