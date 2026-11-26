import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
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
const archives = readdirSync(run).filter((name) => name.endsWith(".tgz"));
if (archives.length !== 1) {
  throw new Error(`Expected one tarball from pnpm pack, found ${archives.length}`);
}
const [archive] = archives;
for (const name of ["package.json", "tsconfig.json"]) {
  copyFileSync(join(root, "fixtures/consumer", name), join(run, name));
}
for (const name of [
  "index.html",
  "main.ts",
  "WatchDemo.vue",
  "WearGallery.vue",
  "vite.config.ts",
]) {
  copyFileSync(join(root, "examples/watch", name), join(run, name));
}

const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const fixturePath = join(run, "package.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
fixture.dependencies[manifest.name] =
  `file:./${archive}`;
writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n");

// Reuse locked registry resolutions. Only the generated file dependency and
// fixture's importer need to be resolved for this temporary install.
copyFileSync(join(root, "pnpm-lock.yaml"), join(run, "pnpm-lock.yaml"));
pnpm(run, "install", "--prefer-offline", "--no-frozen-lockfile");
pnpm(run, "build");
writeFileSync(join(dir, "current"), run + "\n");
writeFileSync(join(dir, "tarball"), join(run, archive) + "\n");
console.log(`\nIndependent packed-package consumer built in ${run}`);
