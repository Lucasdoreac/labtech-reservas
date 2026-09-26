// Nenhuma dependência descontinuada no lockfile (o npm marca com "deprecated").
// Antes: eslint 9 ("This version is no longer supported").
import { readFileSync } from "node:fs";
import { join } from "node:path";

test("package-lock.json não tem pacote descontinuado", () => {
  // o vitest roda na pasta reservas (em jsdom, import.meta.url não é file://)
  const lock = JSON.parse(readFileSync(join(process.cwd(), "package-lock.json")));
  const deprecated = Object.entries(lock.packages)
    .filter(([, info]) => info.deprecated)
    .map(([path, info]) => `${path.replace(/^.*node_modules\//, "")}@${info.version}`);
  expect(deprecated).toEqual([]);
});
