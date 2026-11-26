import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dir = join(root, ".consumer");
mkdirSync(dir, { recursive: true });
const run = mkdtempSync(join(tmpdir(), "wear-m3e-consumer-"));

function pnpm(cwd, ...args) {
  const result = spawnSync("corepack", ["pnpm", ...args], {
    cwd,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

pnpm(root, "build");
pnpm(root, "pack", "--pack-destination", run);
for (const name of ["package.json", "tsconfig.json"]) {
  copyFileSync(join(root, "fixtures/consumer", name), join(run, name));
}
for (const name of [
  "index.html",
  "main.ts",
  "WatchDemo.vue",
  "vite.config.ts",
]) {
  copyFileSync(join(root, "examples/watch", name), join(run, name));
}

const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const fixturePath = join(run, "package.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
fixture.dependencies[manifest.name] =
  `file:./${manifest.name}-${manifest.version}.tgz`;
writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n");

pnpm(run, "install", "--offline");
pnpm(run, "build");
writeFileSync(join(dir, "current"), run + "\n");
console.log(`\nIndependent packed-package consumer built in ${run}`);
