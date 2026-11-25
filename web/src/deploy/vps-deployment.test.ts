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
    expect(dockerignore).toMatch(/^deploy\/vps\/secrets\/$/m);
    expect(dockerignore).toMatch(/^deploy\/vps\/data\/$/m);
    expect(dockerignore).toMatch(/^deploy\/vps\/backups\/$/m);
  });

  test("keeps VPS credentials and runtime data out of Git", () => {
    const gitignore = readFileSync(resolve(process.cwd(), "..", ".gitignore"), "utf8");

    expect(gitignore).toMatch(/^\/deploy\/vps\/secrets\/$/m);
    expect(gitignore).toMatch(/^\/deploy\/vps\/data\/$/m);
    expect(gitignore).toMatch(/^\/deploy\/vps\/backups\/$/m);
  });

  test("builds the web app into a dedicated unprivileged container", () => {
    const dockerfile = deploymentFile("Dockerfile");

    expect(dockerfile).toContain("FROM node:24-alpine AS build");
    expect(dockerfile).toContain("RUN npm ci");
    expect(dockerfile).toContain("RUN npm run build");
    expect(dockerfile).toContain("FROM nginx:1.30.8-alpine");
    expect(dockerfile).toContain("COPY deploy/vps/entrypoint.sh /usr/local/bin/academy-entrypoint");
    expect(dockerfile).toContain('ENTRYPOINT ["/usr/local/bin/academy-entrypoint"]');
    expect(dockerfile).toContain("USER nginx");
  });

  test("does not publish a host port and requires the dedicated secrets directory to exist", () => {
    const compose = deploymentFile("compose.yaml");

    expect(compose).not.toMatch(/^\s*ports:/m);
    expect(compose).toContain("expose:");
    expect(compose).toContain('"8080"');
    expect(compose).toContain("source: ./secrets");
    expect(compose).toContain("target: /run/secrets");
    expect(compose).toContain("create_host_path: false");
    expect(compose).toContain("read_only: true");
    expect(compose).toContain("virtualship_academy_gateway");
  });

  test("refuses to start unless the password file is a readable nonempty regular file", () => {
    const entrypoint = deploymentFile("entrypoint.sh");

    expect(entrypoint).toContain('test -f "$password_file"');
    expect(entrypoint).toContain('test -s "$password_file"');
    expect(entrypoint).toContain('test -r "$password_file"');
    expect(entrypoint).toContain('exec nginx -g "daemon off;"');
  });

  test("protects the application while leaving a container health endpoint available", () => {
    const nginx = deploymentFile("nginx.conf");

    expect(nginx).toContain("listen 8080");
    expect(nginx).toContain('auth_basic "VirtualShip Academy"');
    expect(nginx).toContain("auth_basic_user_file /run/secrets/academy.htpasswd");
    expect(nginx).toMatch(/location = \/healthz\s*\{[^}]*auth_basic off/s);
    expect(nginx).toContain("try_files $uri $uri/ /index.html");
    expect(nginx).toContain('Cache-Control "private, max-age=31536000, immutable"');
    expect(nginx).not.toContain('Cache-Control "public, immutable"');
  });
});
