import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const repositoryRoot = resolve(process.cwd(), "..");

describe("Copernicus local credentials", () => {
  test("keeps the populated config out of Git and Docker", () => {
    const gitignore = readFileSync(resolve(repositoryRoot, ".gitignore"), "utf8");
    const dockerignore = readFileSync(resolve(repositoryRoot, ".dockerignore"), "utf8");

    expect(gitignore).toMatch(/^\/config\/copernicus\.env$/m);
    expect(dockerignore).toMatch(/^config\/copernicus\.env$/m);
  });

  test("tracks only a password-free example", () => {
    const example = readFileSync(
      resolve(repositoryRoot, "config", "copernicus.env.example"),
      "utf8",
    );

    expect(example).toContain("COPERNICUSMARINE_SERVICE_USERNAME=");
    expect(example).toContain("COPERNICUSMARINE_SERVICE_PASSWORD=");
    expect(example).not.toContain("yazyazoo");
  });
});
