import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
const root = process.cwd();
const server = await createServer({ root: path.join(root, "examples/watch"),
  configFile: path.join(root, "examples/watch/vite.config.ts"), mode: "catalog",
  server: { port: 5299, strictPort: true, host: "127.0.0.1" } });
await server.listen();
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 240, height: 240 } });
await page.goto("http://127.0.0.1:5299/?scale=1&section=buttons", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
console.log(await page.evaluate(() => {
  const btn = document.querySelector('.wear-button:not([data-compact="true"])');
  const label = btn.querySelector(".wear-label");
  const rules = [];
  for (const sheet of document.styleSheets) {
    try { for (const r of sheet.cssRules) if (r.selectorText && r.style && r.style.fontSize && label.matches(r.selectorText.replace(/:not\([^)]*\)|\[data[^]]*\]/g, ""))) rules.push([r.selectorText, r.style.fontSize]); } catch {}
  }
  return {
    classes: label.className,
    parentChain: [btn.className, label.parentElement.className].join(" | "),
    fontSize: getComputedStyle(label).fontSize,
    mediumVar: getComputedStyle(btn).getPropertyValue("--wear-type-label-medium-size"),
    legacyVar: getComputedStyle(btn).getPropertyValue("--wear-type-label"),
    matchingRules: rules,
  };
}));
await browser.close(); await server.close();
