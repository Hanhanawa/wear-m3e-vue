import { chromium } from "playwright";
import { createServer } from "vite";
import path from "node:path";
import { mkdirSync } from "node:fs";
const root = process.cwd();
mkdirSync("/tmp/shots2", { recursive: true });
const server = await createServer({ root: path.join(root, "examples/watch"),
  configFile: path.join(root, "examples/watch/vite.config.ts"), mode: "catalog",
  server: { port: 5299, strictPort: true, host: "127.0.0.1" } });
await server.listen();
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const shots = [
  ["selection", "section=selection", 240],
  ["selection-basic", "section=selection&theme=basic", 240],
  ["buttons", "section=buttons", 240],
  ["progress", "section=progress", 240],
  ["levels", "section=levels", 240],
  ["slider", "section=slider", 192],
  ["cards", "section=cards", 240],
];
for (const [name, query, size] of shots) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(`http://127.0.0.1:5299/?scale=1&${query}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `/tmp/shots2/${name}.png` });
  if (errs.length) console.log(name, "ERRORS", errs);
  await page.close();
}
await browser.close(); await server.close();
console.log("shots done");
