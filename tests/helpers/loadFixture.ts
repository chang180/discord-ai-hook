import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const fixturesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures",
);

export function loadFixture(name: string): string {
  return readFileSync(path.join(fixturesDir, name), "utf-8");
}
