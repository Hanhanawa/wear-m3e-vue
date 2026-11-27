import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { chromium } from "playwright";

const origin = process.env.WEAR_URL ?? "http://127.0.0.1:4289";
const output = process.env.WEAR_ARTIFACTS ?? "artifacts/catalog";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.WEAR_CHROMIUM || undefined,
  args: ["--no-sandbox"],
});
console.log(`Catalog Chromium ${browser.version()}`);
const failures = [];

// Exercise public props not exposed by the gallery, using the built package
// and Vue's browser runtime. These routes exist only in this test context.
const componentAssets = {
  "library.js": readFileSync(new URL("../dist/wear-m3e-vue.js", import.meta.url), "utf8"),
  "style.css": readFileSync(new URL("../dist/style.css", import.meta.url), "utf8"),
  "vue.js": readFileSync(createRequire(import.meta.url).resolve("vue/dist/vue.esm-browser.prod.js"), "utf8"),
};

async function setupComponents(components, scale = 1, dir = "ltr") {
  const page = await browser.newPage({
    viewport: { width: 240, height: 240 },
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(`${origin}/__component-test/**`, (route) => {
    const name = new URL(route.request().url()).pathname.split("/").pop();
    return route.fulfill({
      contentType: name === "style.css" ? "text/css" : name ? "text/javascript" : "text/html",
      body: name ? componentAssets[name] : `<!doctype html>
        <style>html,body{margin:0}#host{width:${240 / scale}px;height:${240 / scale}px;transform:scale(${scale});transform-origin:0 0}</style>
        <link rel="stylesheet" href="style.css">
        <script type="importmap">{"imports":{"vue":"./vue.js"}}</script>
        <div id="host"></div>`,
    });
  });
  await page.goto(`${origin}/__component-test/`);
  await page.evaluate(async ({ components, scale, dir }) => {
    const { createApp, h, reactive } = await import("./vue.js");
    const library = await import("./library.js");
    window.components = reactive(components);
    createApp({
      render: () => h(library.WearScaffold, { hostScale: scale, dir }, {
        default: () => window.components.map(({ name, props, slots }, index) =>
          h(library[name], { ...props, key: index }, Object.fromEntries(
            Object.entries(slots ?? {}).map(([name, text]) => [name, () => text]),
          ))),
      }),
    }).mount("#host");
  }, { components, scale, dir });
  return { page, errors };
}

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 0.1, `expected ${expected}, got ${actual}`);
}

for (const scale of [1, 0.8, 0.6]) {
  await check(`progress dp, dots and resizing at host scale ${scale}`, async () => {
    const { page, errors } = await setupComponents([
      { name: "WearCircularProgressIndicator", props: { size: 80, stroke: 12, value: 65 } },
      { name: "WearLinearProgressIndicator", props: { value: 100 } },
      { name: "WearPageIndicator", props: { count: 4 } },
    ], scale);
    const ring = page.locator('.wear-progress[data-variant="circular"]');
    const box = await ring.boundingBox();
    near(box.width, 80);
    near(box.height, 80);
    near(await ring.locator(".wear-progress-active").evaluate((path) => {
      const matrix = path.getScreenCTM();
      return parseFloat(getComputedStyle(path).strokeWidth) * Math.hypot(matrix.a, matrix.b);
    }), 12);

    const line = page.locator(".wear-progress-line");
    const track = await line.boundingBox();
    const fill = await line.locator(".wear-progress-line-active").boundingBox();
    near(track.width, 236);
    near(fill.width, track.width);
    near(fill.x, track.x);
    assert.equal(await line.locator(".wear-progress-line-dot").count(), 0);

    await page.evaluate(() => {
      window.components[0].props.value = 1;
      window.components[1].props.value = 65;
    });
    const dot = ring.locator(".wear-progress-dot");
    await dot.waitFor();
    const paint = await dot.evaluate((element) => ({
      fill: getComputedStyle(element).fill,
      stroke: getComputedStyle(element).stroke,
      radius: element.r.baseVal.value,
    }));
    assert.notEqual(paint.fill, "none");
    assert.equal(paint.stroke, "none");
    assert.ok(paint.radius > 0 && paint.radius < 1);

    await page.evaluate((scale) => {
      const host = document.querySelector("#host");
      host.style.width = `${192 / scale}px`;
      host.style.height = `${192 / scale}px`;
    }, scale);
    await page.waitForFunction(() => {
      const svg = document.querySelector(".wear-page-indicator");
      return Math.abs(svg.viewBox.baseVal.width - 192) < 0.1;
    });
    const endDot = await line.locator(".wear-progress-line-dot").boundingBox();
    const resized = await line.boundingBox();
    near(resized.width, 188);
    near(resized.x + resized.width - endDot.x - endDot.width, 4);
    assert.deepEqual(errors, []);
    await page.close();
  });
}

for (const dir of ["ltr", "rtl"]) {
  await check(`page and level directions and upright lower text ${dir}`, async () => {
    const { page, errors } = await setupComponents([
      { name: "WearPageIndicator", props: { count: 4, dir } },
      { name: "WearLevelIndicator", props: { value: 65 } },
      { name: "WearCurvedText", props: { text: "Bottom arc", position: "bottom" } },
    ], 1, dir);
    const indicator = page.locator(".wear-page-indicator");
    const coordinates = () => indicator.locator(".wear-page-indicator-dot").evaluateAll((dots) =>
      dots.map((dot) => {
        const point = new DOMPoint(dot.cx.baseVal.value, dot.cy.baseVal.value).matrixTransform(dot.getScreenCTM());
        return { x: point.x, y: point.y };
      }),
    );
    const horizontal = await coordinates();
    assert.equal(horizontal[0].x < horizontal[3].x, dir === "ltr");
    const level = page.locator('.wear-progress[data-variant="level"] .wear-progress-active');
    const side = await level.boundingBox();
    assert.equal(side.x + side.width / 2 < 120, dir === "ltr");

    await page.evaluate(() => {
      window.components[0].props.orientation = "vertical";
      window.components[1].props.side = "end";
    });
    const vertical = await coordinates();
    assert.ok(vertical[0].y < vertical[3].y);
    const otherSide = await level.boundingBox();
    assert.equal(otherSide.x + otherSide.width / 2 < 120, dir === "rtl");
    const rotation = await page.locator(".wear-curved-text text").evaluate((text) =>
      text.getRotationOfChar(Math.floor(text.getNumberOfChars() / 2)),
    );
    assert.ok(Math.abs(((rotation + 540) % 360) - 180) < 20, `glyph rotation ${rotation}`);
    assert.deepEqual(errors, []);
    await page.close();
  });
}

await check("small button faces, disabled slots and explicit type roles", async () => {
  const { page, errors } = await setupComponents([
    { name: "WearIconButton", props: { size: "extra-small" }, slots: { icon: "+" } },
    { name: "WearIconButton", props: { size: "small" }, slots: { icon: "+" } },
    { name: "WearFilledTonalButton", props: { disabled: true }, slots: { default: "Disabled", icon: "+", detail: "Details" } },
    { name: "WearRadioButton", props: { modelValue: true, disabled: true }, slots: { default: "Selected" } },
    { name: "WearText", props: { role: "titleSmall", variant: "display" }, slots: { default: "Title" } },
  ]);
  for (const [size, expected] of [["extra-small", 32], ["small", 48]]) {
    const button = page.locator(`.wear-button[data-size="${size}"]`);
    const target = await button.boundingBox();
    const face = await button.locator(".wear-button-face").boundingBox();
    near(target.width, 48);
    near(target.height, 48);
    near(face.width, expected);
    near(face.height, expected);
    near(face.x + face.width / 2, target.x + target.width / 2);
    near(face.y + face.height / 2, target.y + target.height / 2);
  }
  const button = page.locator(".wear-button:disabled");
  const content = await button.locator(".wear-button-face").evaluate((e) => getComputedStyle(e).color);
  for (const selector of [".wear-button-icon", ".wear-button-detail"])
    assert.equal(await button.locator(selector).evaluate((e) => getComputedStyle(e).color), content);
  assert.equal(await button.locator(".wear-button-detail").evaluate((e) => getComputedStyle(e).opacity), "1");
  const container = await button.locator(".wear-button-face").evaluate((e) => getComputedStyle(e).backgroundColor);
  const radio = await page.locator(".wear-selection-mark").evaluate((e) => ({
    border: getComputedStyle(e).borderColor,
    dot: getComputedStyle(e, "::after").backgroundColor,
  }));
  assert.equal(radio.border, container);
  assert.equal(radio.dot, container);
  const text = await page.locator(".wear-text").evaluate((e) => ({
    size: getComputedStyle(e).fontSize,
    weight: getComputedStyle(e).fontWeight,
  }));
  assert.deepEqual(text, { size: "14px", weight: "550" });
  assert.deepEqual(errors, []);
  await page.close();
});

async function setup(
  section,
  diameter = 240,
  scale = 1,
  font = 1,
  dir = "ltr",
) {
  const page = await browser.newPage({
    viewport: { width: diameter, height: diameter },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(5000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(`${origin}/__catalog-host`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;overflow:hidden;background:#000}iframe{border:0;width:${diameter / scale}px;height:${diameter / scale}px;transform-origin:0 0;transform:scale(${scale})}</style><iframe title="Watch" src="/?catalog&section=${section}&scale=${scale}&text=${font}&dir=${dir}"></iframe>`,
    }),
  );
  await page.goto(`${origin}/__catalog-host`);
  const frame = page.frames().find((entry) => entry.parentFrame());
  await frame.locator(".wear-navigation-entry[data-active=true]").waitFor();
  return { page, frame, errors };
}

async function centered(locator) {
  await locator.evaluate((element) =>
    element.scrollIntoView({ block: "center", inline: "nearest" }),
  );
}

async function check(name, run) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(name);
    console.error(`FAIL ${name}\n${error.stack}`);
  }
}

for (const diameter of [192, 240]) {
  await check(`catalog preserves progress sizes at ${diameter}dp`, async () => {
    const { page, frame, errors } = await setup("progress", diameter);
    for (const [label, size] of [["Activity", 80], ["Daily goals", 80], ["Loading activity", 24]]) {
      const box = await frame.getByRole("progressbar", { name: label, exact: true }).boundingBox();
      near(box.width, size);
      near(box.height, size);
    }
    assert.deepEqual(errors, []);
    await page.close();
  });
}

async function swipe(page, from, to) {
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: from[0], y: from[1], id: 1 }],
  });
  for (let step = 1; step <= 10; step++) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: from[0] + ((to[0] - from[0]) * step) / 10,
          y: from[1] + ((to[1] - from[1]) * step) / 10,
          id: 1,
        },
      ],
    });
  }
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await session.detach();
}

for (const [diameter, scale, font, dir] of [
  [192, 1, 1, "ltr"],
  [240, 1, 1, "ltr"],
  [192, 0.6, 1.35, "ltr"],
  [240, 0.8, 1.35, "rtl"],
]) {
  await check(`selection ${diameter} ${scale} ${font} ${dir}`, async () => {
    const { page, frame, errors } = await setup(
      "selection",
      diameter,
      scale,
      font,
      dir,
    );
    const notification = frame.getByRole("switch", {
      name: "Notifications",
      exact: true,
    });
    await centered(notification);
    await notification.uncheck();
    assert.equal(await notification.isChecked(), false);
    const box = await notification.boundingBox();
    assert.ok(
      box.width >= 47.5 && box.height >= 47.5,
      `physical target ${box.width} × ${box.height}`,
    );
    await notification.focus();
    await page.keyboard.press("Space");
    assert.equal(await notification.isChecked(), true);
    const main = frame.getByRole("button", { name: /Connectivity/ });
    await centered(main);
    await main.tap();
    const toggle = frame.getByRole("switch", { name: "Enable connectivity" });
    assert.equal(await toggle.isChecked(), false);
    assert.match(await main.innerText(), /1 details opened/);
    await toggle.check();
    assert.match(await main.innerText(), /1 details opened/);
    const checkbox = frame.getByRole("checkbox", {
      name: "Sync over Wi-Fi",
      exact: true,
    });
    await centered(checkbox);
    await checkbox.check();
    assert.equal(await checkbox.isChecked(), true);
    assert.equal(
      await frame
        .getByRole("checkbox", { name: "Disabled check" })
        .isDisabled(),
      true,
    );
    const mixed = frame.getByRole("checkbox", { name: "Mixed selection" });
    assert.equal(
      await mixed.evaluate((element) => element.indeterminate),
      true,
    );
    const radio = frame.getByRole("radio", {
      name: "Performance",
      exact: true,
    });
    await centered(radio);
    await radio.check();
    assert.equal(
      await frame
        .getByRole("radio", { name: "Balanced", exact: true })
        .isChecked(),
      false,
    );
    assert.equal(await radio.isChecked(), true);
    await centered(notification);
    await page.screenshot({
      path: join(output, `selection-${diameter}-${scale}-${dir}.png`),
    });
    assert.deepEqual(errors, []);
    await page.close();
  });
}

await check("buttons and edge slot", async () => {
  const { page, frame, errors } = await setup("buttons");
  const button = frame.getByRole("button", { name: /Start workout/ });
  await centered(button);
  await button.tap();
  assert.match(await button.innerText(), /1 activities started/);
  assert.equal(
    await frame.getByRole("button", { name: "Unavailable" }).isDisabled(),
    true,
  );
  const favorite = frame.getByRole("button", { name: "Favorite" });
  await centered(favorite);
  await favorite.tap();
  assert.equal(await favorite.getAttribute("aria-pressed"), "true");
  assert.equal(
    await frame
      .locator(".wear-screen-edge .wear-button[data-shape=edge]")
      .count(),
    1,
  );
  assert.deepEqual(errors, []);
  await page.close();
});

await check("range clamping and rotary input", async () => {
  const { page, frame, errors } = await setup("slider");
  const slider = frame.getByRole("slider", { name: "Volume" });
  await centered(slider);
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await slider.inputValue(), "50");
  await slider.evaluate((element) =>
    element.dispatchEvent(
      new CustomEvent("wear-rotary", {
        detail: { delta: 1 },
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.equal(await slider.inputValue(), "60");
  await page.keyboard.press("End");
  assert.equal(await slider.inputValue(), "100");
  assert.equal(
    await frame
      .locator(".wear-slider")
      .first()
      .getByRole("button", { name: "Increase" })
      .isDisabled(),
    true,
  );
  const stepper = frame.getByRole("group", { name: "Repetitions" });
  await centered(stepper);
  await stepper.focus();
  await page.keyboard.press("End");
  assert.equal(
    await stepper.getByRole("button", { name: "Increase" }).isDisabled(),
    true,
  );
  assert.deepEqual(errors, []);
  await page.close();
});

await check("range icons, rapid steps and hold-to-repeat", async () => {
  const { page, frame, errors } = await setup("slider", 240, 0.8, 1.35, "rtl");
  const sliders = frame.locator(".wear-slider");
  const slider = sliders.first();
  const volume = slider.getByRole("slider");
  const stepper = frame.getByRole("group", { name: "Repetitions" });

  for (const control of [slider, stepper]) {
    for (const name of ["Increase", "Decrease"]) {
      const button = control.getByRole("button", { name });
      await centered(button);
      const [target, icon] = await Promise.all([
        button.boundingBox(),
        button.locator("svg").boundingBox(),
      ]);
      assert.ok(Math.abs(target.x + target.width / 2 - icon.x - icon.width / 2) < 1);
      assert.ok(Math.abs(target.y + target.height / 2 - icon.y - icon.height / 2) < 1);
    }
  }

  await centered(slider);
  const plus = slider.getByRole("button", { name: "Increase" });
  await plus.dblclick();
  assert.equal(await volume.inputValue(), "60");
  await plus.evaluate((button) => {
    button.click();
    button.click();
  });
  assert.equal(await volume.inputValue(), "80");
  const track = slider.locator(".wear-slider-track");
  await track.tap({ position: { x: 4, y: 4 } });
  assert.equal(await volume.inputValue(), "80");

  await stepper.evaluate((group) => {
    const [plus, minus] = group.querySelectorAll("button");
    plus.click();
    minus.click();
    minus.click();
  });
  assert.match(await stepper.locator("output").innerText(), /^2/);

  const minus = slider.getByRole("button", { name: "Decrease" });
  await centered(minus);
  const box = await minus.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 200);
  await page.mouse.down();
  await page.clock.runFor(499);
  assert.equal(await volume.inputValue(), "80");
  await page.clock.runFor(61);
  assert.equal(await volume.inputValue(), "60");
  await page.mouse.up();
  await page.clock.runFor(120);
  assert.equal(await volume.inputValue(), "60");
  assert.deepEqual(errors, []);
  await page.close();
});

for (const diameter of [192, 240]) {
  await check(`dialogs focus and geometry ${diameter}`, async () => {
    const { page, frame, errors } = await setup("dialogs", diameter, 0.8, 1.35);
    const opener = frame.getByRole("button", { name: /Confirm changes/ });
    await centered(opener);
    await opener.tap();
    const panel = frame.getByRole("dialog", { name: "Save changes?" });
    await panel.waitFor();
    const box = await panel.boundingBox();
    assert.ok(
      Math.abs(box.width - diameter) < 1 && Math.abs(box.height - diameter) < 1,
      `dialog ${JSON.stringify(box)}`,
    );
    const confirm = panel.getByRole("button", { name: "Save changes" });
    await centered(confirm);
    await confirm.tap();
    await panel.waitFor({ state: "hidden" });
    assert.match(await opener.innerText(), /1 confirmed/);
    assert.equal(
      await opener.evaluate((element) => document.activeElement === element),
      true,
    );
    await opener.tap();
    await page.keyboard.press("Escape");
    await panel.waitFor({ state: "hidden" });
    const phone = frame.getByRole("button", {
      name: "Open on phone",
      exact: true,
    });
    await centered(phone);
    await phone.tap();
    const phonePanel = frame.getByRole("dialog", { name: "Continue on phone" });
    await phonePanel.waitFor();
    await page.screenshot({ path: join(output, `dialog-${diameter}.png`) });
    await page.keyboard.press("Escape");
    await phonePanel.waitFor({ state: "hidden" });
    assert.deepEqual(errors, []);
    await page.close();
  });
}

await check("picker disabled options and calendar rollover", async () => {
  const { page, frame, errors } = await setup("pickers", 240);
  const amount = frame.getByRole("listbox", { name: "Amount" });
  await centered(amount);
  await amount.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  assert.equal(
    await amount
      .getByRole("option", { name: "5", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  const opener = frame.getByRole("button", { name: /^Date/ });
  await centered(opener);
  await opener.tap();
  const month = frame.getByRole("listbox", { name: "Month" });
  await month.focus();
  await page.keyboard.press("ArrowDown");
  const day = frame.getByRole("listbox", { name: "Day" });
  assert.equal(
    await day
      .getByRole("option", { name: "29", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  const year = frame.getByRole("listbox", { name: "Year" });
  await year.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(
    await day
      .getByRole("option", { name: "28", exact: true })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.screenshot({ path: join(output, "date-picker.png") });
  const done = frame.getByRole("dialog").getByRole("button", { name: "Done" });
  await centered(done);
  await done.tap();
  assert.match(await opener.innerText(), /2025-02-28/);
  const time = frame.getByRole("button", { name: /^Time 23/ });
  await centered(time);
  await time.tap();
  const hour = frame.getByRole("listbox", { name: "Hour" });
  await hour.focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await frame
      .getByRole("listbox", { name: "Minute" })
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await page.keyboard.press("ArrowDown");
  await centered(done);
  await done.tap();
  assert.match(
    await frame.getByRole("button", { name: /^Time/ }).innerText(),
    /00:59:30/,
  );
  assert.deepEqual(errors, []);
  await page.close();
});

await check("compact picker screen at 192dp and large text", async () => {
  const { page, frame, errors } = await setup("pickers", 192, 0.6, 1.5);
  const opener = frame.getByRole("button", { name: /^Date/ });
  await centered(opener);
  await opener.tap();
  const panel = frame.getByRole("dialog");
  const widths = await panel
    .getByRole("option", { selected: true })
    .evaluateAll((elements) =>
      elements.map((element) => ({
        client: element.clientWidth,
        content: element.scrollWidth,
      })),
    );
  assert.ok(
    widths.every((width) => width.content <= width.client + 1),
    JSON.stringify(widths),
  );
  const done = panel.getByRole("button", { name: "Done" });
  await centered(done);
  await done.tap();
  await panel.waitFor({ state: "hidden" });
  const duration = frame.getByRole("button", { name: /^Duration/ });
  await centered(duration);
  await duration.tap();
  const hours = frame.getByRole("listbox", { name: "Hours" });
  await hours.focus();
  await page.keyboard.press("Home");
  await centered(done);
  await done.tap();
  assert.match(await duration.innerText(), /61 seconds/);
  assert.deepEqual(errors, []);
  await page.close();
});

for (const section of ["horizontal", "vertical"]) {
  await check(`${section} touch paging and back`, async () => {
    const { page, frame, errors } = await setup(section);
    await swipe(
      page,
      section === "horizontal" ? [180, 120] : [120, 180],
      section === "horizontal" ? [70, 120] : [120, 70],
    );
    await frame
      .locator('.wear-pane[data-active=true][aria-label="Second"]')
      .waitFor();
    const pager = frame.getByRole("region", {
      name: `${section[0].toUpperCase()}${section.slice(1)} catalog`,
    });
    await pager.focus();
    await page.keyboard.press(
      section === "horizontal" ? "ArrowRight" : "ArrowDown",
    );
    await frame
      .locator('.wear-pane[data-active=true][aria-label="Third"]')
      .waitFor();
    await page.screenshot({ path: join(output, `${section}-pager.png`) });
    await frame.getByRole("button", { name: "Back", exact: true }).tap();
    await frame.getByRole("heading", { name: "Wear M3E" }).waitFor();
    assert.deepEqual(errors, []);
    await page.close();
  });
}

await check("virtual list and measured row heights", async () => {
  const { page, frame, errors } = await setup("lazy");
  assert.ok((await frame.locator(".wear-virtual-row").count()) < 30);
  const jump = frame.getByRole("button", { name: "Jump to record 151" });
  await centered(jump);
  await jump.tap();
  await frame.getByText("Record 151", { exact: true }).waitFor();
  assert.ok((await frame.locator(".wear-virtual-row").count()) < 30);
  await page.screenshot({ path: join(output, "virtual-list.png") });
  assert.deepEqual(errors, []);
  await page.close();
});

await check(
  "reveal actions undo expandable refresh and host gestures",
  async () => {
    const { page, frame, errors } = await setup("gestures");
    const actions = frame.getByRole("button", { name: "Actions", exact: true });
    await centered(actions);
    await actions.tap();
    await frame.getByRole("button", { name: "Delete", exact: true }).tap();
    await frame.getByRole("button", { name: "Undo", exact: true }).tap();
    const expand = frame.getByRole("button", { name: "Show activity details" });
    await centered(expand);
    await expand.tap();
    assert.equal(await expand.getAttribute("aria-expanded"), "true");
    const refresh = frame.getByRole("button", { name: /^Refresh data/ });
    await centered(refresh);
    await refresh.tap();
    await frame.getByText("1 updates", { exact: true }).waitFor();
    const gesture = frame.getByRole("button", { name: /^Simulate gesture/ });
    await centered(gesture);
    await gesture.tap();
    assert.match(await gesture.innerText(), /1 received/);
    assert.deepEqual(errors, []);
    await page.close();
  },
);

await check("touch reveal and edge dismiss", async () => {
  const { page, frame, errors } = await setup("gestures");
  const reveal = frame.locator(".wear-reveal");
  await centered(reveal);
  const box = await reveal.boundingBox();
  await swipe(
    page,
    [box.x + box.width * 0.75, box.y + box.height / 2],
    [box.x + box.width * 0.25, box.y + box.height / 2],
  );
  await frame.locator('.wear-reveal[data-open="true"]').waitFor();
  await frame.getByRole("button", { name: "Close actions" }).tap();
  await swipe(page, [6, 120], [130, 120]);
  await frame.getByRole("heading", { name: "Wear M3E", exact: true }).waitFor();
  assert.deepEqual(errors, []);
  await page.close();
});

await check("reveal keeps a single row and keyboard actions in RTL", async () => {
  const { page, frame, errors } = await setup("gestures", 192, 0.8, 1.35, "rtl");
  const actions = frame.getByRole("button", { name: "Actions", exact: true });
  const reveal = frame.locator(".wear-reveal");
  await centered(actions);
  const closed = await reveal.boundingBox();
  assert.equal(await frame.getByRole("button", { name: "Delete" }).count(), 0);
  await actions.focus();
  await page.keyboard.press("Enter");
  const close = frame.getByRole("button", { name: "Close actions" });
  const archive = frame.getByRole("button", { name: "Archive" });
  const remove = frame.getByRole("button", { name: "Delete" });
  const [opened, closeBox, archiveBox, removeBox] = await Promise.all(
    [reveal, close, archive, remove].map((locator) => locator.boundingBox()),
  );
  assert.equal(opened.height, closed.height);
  assert.ok(removeBox.x < archiveBox.x && archiveBox.x < closeBox.x);
  for (const box of [closeBox, archiveBox, removeBox]) {
    assert.ok(box.width >= 47.5 && box.height >= 47.5);
    assert.ok(Math.abs(box.y + box.height / 2 - opened.y - opened.height / 2) < 1);
  }
  await archive.focus();
  await page.keyboard.press("Escape");
  assert.equal(await actions.getAttribute("aria-expanded"), "false");
  assert.equal(await actions.evaluate((button) => document.activeElement === button), true);
  assert.deepEqual(errors, []);
  await page.close();
});

await check("pull-to-refresh is centered at watch scale and only fires past the threshold", async () => {
  const { page, frame, errors } = await setup("gestures", 192, 0.6, 1.35, "rtl");
  const refresh = frame.getByRole("button", { name: /^Refresh data/ });
  await swipe(page, [96, 66], [96, 120]);
  assert.match(await refresh.innerText(), /0 updates/);
  await swipe(page, [96, 66], [96, 150]);
  const progress = frame.getByRole("progressbar", { name: "Refreshing" });
  await progress.waitFor();
  const box = await progress.boundingBox();
  assert.ok(Math.abs(box.x + box.width / 2 - 96) < 1);
  assert.ok(Math.abs(box.y + box.height / 2 - 48) < 1);
  await frame.getByText("1 updates", { exact: true }).waitFor();
  assert.equal(await progress.count(), 0);
  assert.deepEqual(errors, []);
  await page.close();
});

await check("ambient makes controls inert and pauses animation", async () => {
  const { page, frame, errors } = await setup("type");
  const preview = frame.getByRole("button", { name: "Preview ambient" });
  await centered(preview);
  await preview.tap();
  assert.equal(
    await frame.locator(".wear-app-content").getAttribute("inert"),
    "",
  );
  assert.equal(
    await frame.locator(".wear-app").getAttribute("data-ambient"),
    "true",
  );
  await frame.locator('.wear-app[data-ambient="false"]').waitFor();
  assert.deepEqual(errors, []);
  await page.close();
});

for (const section of ["buttons", "cards", "progress", "pickers", "type"]) {
  await check(`render ${section}`, async () => {
    const { page, frame, errors } = await setup(section, 192);
    assert.equal(
      await frame
        .locator(".wear-frame")
        .evaluate((element) => element.scrollWidth > element.clientWidth),
      false,
    );
    await page.screenshot({ path: join(output, `${section}-192.png`) });
    assert.deepEqual(errors, []);
    await page.close();
  });
}

await browser.close();
assert.deepEqual(failures, [], `Failed catalog checks: ${failures.join(", ")}`);
