import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const deployRoot = resolve(process.cwd(), "..", "deploy", "vps");

function deploymentFile(name: string): string {
  return readFileSync(resolve(deployRoot, name), "utf8");
}

describe("VPS deployment", () => {
  test("keeps local planning files and repository metadata out of the image context", () => {
    const dockerignore = readFileSync(resolve(process.cwd(), "..", ".dockerignore"), "utf8");

    expect(dockerignore).toMatch(/^\.git\/$/m);
    expect(dockerignore).toMatch(/^ZZZ\/$/m);
    expect(dockerignore).toMatch(/^web\/node_modules\/$/m);
  });

  test("keeps VPS credentials and runtime data out of Git", () => {
    const gitignore = readFileSync(resolve(process.cwd(), "..", ".gitignore"), "utf8");

    expect(gitignore).toMatch(/^\/deploy\/vps\/secrets\/$/m);
    expect(gitignore).toMatch(/^\/deploy\/vps\/data\/$/m);
  });

  test("builds the web app into a dedicated unprivileged container", () => {
    const dockerfile = deploymentFile("Dockerfile");

    expect(dockerfile).toContain("FROM node:24-alpine AS build");
    expect(dockerfile).toContain("RUN npm ci");
    expect(dockerfile).toContain("RUN npm run build");
    expect(dockerfile).toContain("FROM nginx:1.27-alpine");
    expect(dockerfile).toContain("USER nginx");
  });

  test("does not publish a host port and mounts only the dedicated secrets directory", () => {
    const compose = deploymentFile("compose.yaml");

    expect(compose).not.toMatch(/^\s*ports:/m);
    expect(compose).toContain("expose:");
    expect(compose).toContain('"8080"');
    expect(compose).toContain("./secrets/academy.htpasswd");
    expect(compose).toContain("read_only: true");
    expect(compose).toContain("virtualship_academy_gateway");
  });

  test("protects the application while leaving a container health endpoint available", () => {
    const nginx = deploymentFile("nginx.conf");

    expect(nginx).toContain("listen 8080");
    expect(nginx).toContain('auth_basic "VirtualShip Academy"');
    expect(nginx).toContain("auth_basic_user_file /run/secrets/academy.htpasswd");
    expect(nginx).toMatch(/location = \/healthz\s*\{[^}]*auth_basic off/s);
    expect(nginx).toContain("try_files $uri $uri/ /index.html");
  });
});
