/**
 * Copyright IBM Corp. 2022, 2026
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

test("packing clean source builds usable JavaScript and declarations", async (t) => {
  const directory = await mkdtemp(
    join(tmpdir(), "github-actions-core-package-"),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));

  const source = join(directory, "source");
  const excluded = new Set([".git", "node_modules", "dist"]);
  await cp(projectRoot, source, {
    recursive: true,
    filter: (path) => !excluded.has(relative(projectRoot, path).split(sep)[0]),
  });
  await symlink(
    join(projectRoot, "node_modules"),
    join(source, "node_modules"),
    "dir",
  );

  const output = execFileSync(
    "npm",
    [
      "pack",
      "--json",
      "--foreground-scripts=false",
      "--pack-destination",
      directory,
    ],
    { cwd: source, encoding: "utf8" },
  );
  const [packed] = JSON.parse(output);
  const files = new Set(packed.files.map((file) => file.path));
  const manifest = JSON.parse(
    await readFile(join(source, "package.json"), "utf8"),
  );

  assert.equal(
    manifest.type,
    "module",
    "the package must declare its ESM format",
  );
  assert.ok(
    files.has(manifest.main.replace(/^\.\//, "")),
    "the package must contain its built JavaScript entry point",
  );
  assert.equal(
    typeof manifest.types,
    "string",
    "the package must declare its types",
  );
  assert.ok(files.has(manifest.types.replace(/^\.\//, "")));
  assert.ok(
    [...files].every((file) => !file.endsWith(".ts") || file.endsWith(".d.ts")),
    "consumers must not need to compile implementation TypeScript",
  );

  const library = await import(pathToFileURL(join(source, manifest.main)).href);
  assert.equal(typeof library.getHashicorpRelease, "function");
});
