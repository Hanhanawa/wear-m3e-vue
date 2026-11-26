import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const url = process.env.WEAR_URL ?? "http://127.0.0.1:4287";
const browser = await chromium.launch({
  executablePath: process.env.WEAR_CHROMIUM || undefined,
  args: ["--no-sandbox"],
});
const output = process.env.WEAR_ARTIFACTS ?? "artifacts";
mkdirSync(output, { recursive: true });
console.log("Chromium " + browser.version());

async function swipe(cdp, x, y, tx, ty) {
  const event = (type, touchPoints) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
  await event("touchStart", [{ x, y, id: 0 }]);
  for (let step = 1; step <= 8; step++) {
    await event("touchMove", [
      { x: x + ((tx - x) * step) / 8, y: y + ((ty - y) * step) / 8, id: 0 },
    ]);
  }
  await event("touchEnd", []);
}

async function setup(
  diameter,
  scale,
  params = "",
  reducedMotion = "no-preference",
) {
  const page = await browser.newPage({
    viewport: { width: diameter, height: diameter },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    reducedMotion,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const width = diameter / scale;
  await page.route(url + "/__host-model", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>html,body{margin:0;overflow:hidden;background:#000} iframe {
        border:0;width:${width}px;height:${width}px;transform-origin:0 0;transform:scale(${scale});
      }</style>
      <iframe title="Wear viewport" src="/?scale=${scale}${params}"></iframe>`,
    }),
  );
  await page.goto(url + "/__host-model");
  const frame = page.frames().find((entry) => entry.parentFrame());
  assert.ok(frame);
  await frame.getByRole("heading", { name: "Status", exact: true }).waitFor();
  const cdp = await page.context().newCDPSession(page);
  return { page, frame, cdp, errors };
}

function waitPage(frame, name, position) {
  return frame
    .getByRole("heading", { name, exact: true })
    .waitFor()
    .then(async () => {
      const active = frame.locator(".wear-pane[data-active=true]");
      assert.equal(await active.getAttribute("aria-label"), name);
      assert.equal(
        await frame.locator(".wear-pane[inert][aria-hidden=true]").count(),
        3,
      );
      assert.match(
        await frame.getByRole("status").textContent(),
        new RegExp(`Page ${position} of 4`),
      );
    });
}

async function fullRound(diameter, scale) {
  const { page, frame, cdp, errors } = await setup(diameter, scale);
  await waitPage(frame, "Status", 1);
  const physicalTime = await frame.locator(".wear-time").textContent();
  assert.match(physicalTime, /[0-9]+:[0-9]{2}/);
  assert.equal(await frame.locator(".wear-page-indicator-dot").count(), 4);
  assert.equal(
    await frame
      .locator(".wear-page-indicator")
      .evaluate((el) => getComputedStyle(el).pointerEvents),
    "none",
  );

  await frame.evaluate(() => {
    window.wearGestureCancels = [];
    document.addEventListener("touchmove", (event) =>
      window.wearGestureCancels.push(event.defaultPrevented),
    );
  });
  const center = diameter / 2;
  await page.touchscreen.tap(center, diameter * 0.958);
  await waitPage(frame, "Status", 1);
  await swipe(cdp, diameter * 0.985, center, diameter * 0.28, center);
  await waitPage(frame, "Status", 1);
  await swipe(cdp, center, diameter * 0.12, center, diameter * 0.64);
  await waitPage(frame, "Status", 1);
  const edgeCancels = await frame.evaluate(() => window.wearGestureCancels);
  assert.ok(edgeCancels.length > 0 && !edgeCancels.includes(true));
  if (scale === 1)
    await page.screenshot({
      path: join(output, `chromium-${diameter}-status.png`),
    });

  const statusScroll = frame.getByRole("region", { name: "Status list" });
  await page.mouse.move(center, center);
  await page.mouse.wheel(150, 0);
  await waitPage(frame, "Status", 1);
  await page.mouse.wheel(0, 115);
  await statusScroll.evaluate(
    (el) =>
      new Promise((resolve) => {
        if (el.scrollTop) resolve();
        else el.addEventListener("scroll", () => resolve(), { once: true });
      }),
  );
  await page.waitForTimeout(100);
  const initialScroll = await statusScroll.evaluate((el) => el.scrollTop);
  assert.ok(initialScroll > 0);
  const scales = await statusScroll
    .locator(".wear-list-item")
    .evaluateAll((rows) =>
      rows.map((el) => Number(el.style.getPropertyValue("--wear-item-scale"))),
    );
  assert.ok(Math.min(...scales) < 0.85 && Math.max(...scales) > 0.97, scales);
  if (scale === 1)
    await page.screenshot({
      path: join(output, `chromium-${diameter}-scrolled.png`),
    });

  const forward = () =>
    swipe(
      cdp,
      diameter * 0.79,
      diameter * 0.36,
      diameter * 0.23,
      diameter * 0.36,
    );
  const back = () =>
    swipe(
      cdp,
      diameter * 0.22,
      diameter * 0.36,
      diameter * 0.79,
      diameter * 0.36,
    );
  await forward();
  await waitPage(frame, "Config", 2);
  assert.ok(
    await frame.evaluate(() => window.wearGestureCancels.includes(true)),
  );
  const button = frame.getByRole("button", { name: /Default mode/ });
  assert.ok((await button.boundingBox()).height >= 47.75);
  const note = frame.getByRole("textbox", { name: "Draft note" });
  await note.fill("Carry into the next page");
  await note.blur();
  await forward();
  await waitPage(frame, "Modules", 3);
  await forward();
  await waitPage(frame, "Info", 4);
  await back();
  await waitPage(frame, "Modules", 3);
  await back();
  await waitPage(frame, "Config", 2);
  assert.equal(await note.inputValue(), "Carry into the next page");
  await back();
  await waitPage(frame, "Status", 1);
  assert.equal(
    await statusScroll.evaluate((el) => el.scrollTop),
    initialScroll,
  );
  assert.deepEqual(errors, []);
  console.log(
    `${diameter}dp @${scale * 100}%: round, passive dots, edge/tool gestures, vertical scroll, four touch pages and retained state`,
  );
  await page.close();
}

async function accessibility() {
  const { page, frame, cdp, errors } = await setup(
    192,
    0.6,
    "&text=1.5&dir=rtl",
    "reduce",
  );
  const pager = frame.getByRole("region", { name: "Wear example pages" });
  await pager.focus();
  await page.keyboard.press("ArrowLeft");
  await waitPage(frame, "Config", 2);

  const next = frame.getByRole("button", { name: "Next page" });
  await next.focus();
  assert.ok((await next.boundingBox()).height >= 47.75);
  await page.keyboard.press("Enter");
  await waitPage(frame, "Modules", 3);
  const panes = await frame
    .locator(".wear-pane")
    .evaluateAll((panes) =>
      panes.map((el) => getComputedStyle(el).transitionDuration),
    );
  assert.ok(panes.every((duration) => duration === "0s"));
  const list = frame.getByRole("region", { name: "Modules list" });
  assert.ok(await list.evaluate((el) => el.clientWidth === el.scrollWidth));
  assert.ok(
    (
      await list
        .locator(".wear-list-content")
        .evaluateAll((rows) =>
          rows.map((node) => getComputedStyle(node).transform),
        )
    ).every(
      (value) => value === "none" || value === "matrix(1, 0, 0, 1, 0, 0)",
    ),
  );
  await swipe(cdp, 42, 80, 150, 80);
  await waitPage(frame, "Info", 4);
  const snapshot = await pager.ariaSnapshot();
  assert.match(snapshot, /heading "Info"/);
  assert.doesNotMatch(snapshot, /heading "Status"/);
  assert.deepEqual(errors, []);
  console.log(
    "192dp @60%: RTL swipe and keys, 150% text, reduced motion, keyboard activation and accessibility tree",
  );
  await page.close();
}

try {
  for (const diameter of [192, 240]) {
    for (const scale of [1, 0.8, 0.6]) await fullRound(diameter, scale);
  }
  await accessibility();
} finally {
  await browser.close();
}
