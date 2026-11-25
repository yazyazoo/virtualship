# Development, verification and deployment

**Language:** English · [Italiano](../it/operations.md)

## Local requirements

- Node.js 24 or newer;
- npm;
- a Chromium browser for smoke tests;
- Docker with Compose to build the production image.

## Run locally

From the repository root:

```powershell
npm --prefix web install
npm --prefix web run dev
```

By default, the demo is available at `http://127.0.0.1:5173/`.

## Verification

```powershell
npm --prefix web run typecheck
npm --prefix web run test -- --run
npm --prefix web run build
```

The browser smoke test must verify at least:

1. briefing and entry into the operations room;
2. presence of the chart, the 19 selected soundings and the data boundary;
3. absence of panels overlapping the chart;
4. clickable cockpit and three hull compartments;
5. three operational panels beside the vessel;
6. station suggestion with 36.1 m seafloor depth and 6.1 m clearance;
7. inspection of the sample lab and winch;
8. complete cycle through to the debrief.

The `web/e2e/mission-smoke.mjs` script is the intended automation point for this check. Its layout assertions must be updated whenever the interface structure is reorganised.

## Container build

```bash
export ACADEMY_VERSION=$(git rev-parse --short HEAD)
docker compose -f deploy/vps/compose.yaml build web
```

The resulting image is `virtualship-academy:<short-commit>`.

## Current production environment

- URL: `https://yazvmoracle.duckdns.org/virtualship/`
- public health endpoint: `https://yazvmoracle.duckdns.org/virtualship/healthz`
- deployed branch: `demo`
- VPS repository: `/home/ubuntu/virtualship-academy`
- container: `virtualship-academy-web`
- external Docker network: `virtualship_academy_gateway`

The main page is protected by HTTP Basic authentication. A `401` response without credentials is expected; `/healthz` must return `200` and `ok`.

## Deployment

On the VPS:

```bash
cd /home/ubuntu/virtualship-academy
git pull --ff-only origin demo
export ACADEMY_VERSION=$(git rev-parse --short HEAD)
docker compose -f deploy/vps/compose.yaml build web
docker compose -f deploy/vps/compose.yaml up -d web
docker inspect --format '{{.Config.Image}} {{.State.Status}} {{.State.Health.Status}}' virtualship-academy-web
```

External verification:

```bash
curl -fsS https://yazvmoracle.duckdns.org/virtualship/healthz
```

A deployment is successful only when the local commit, `origin/demo`, the VPS commit, the image tag and the healthy status agree.

## Rollback

Images are versioned with the short commit. If the previous image is still present:

```bash
cd /home/ubuntu/virtualship-academy
export ACADEMY_VERSION=<previous-commit>
docker compose -f deploy/vps/compose.yaml up -d web
```

Check the container and `/healthz` again. Rolling back the image does not automatically change the server Git working copy; that difference must be documented during the incident.

## Secrets

The authentication file is mounted in the container as `/run/secrets/academy.htpasswd`. Passwords, local `.env` files and Copernicus credentials:

- must not be added to Git;
- must not appear in logs, screenshots or documentation;
- must not be copied into the web bundle;
- must be managed only on the authorised system.

## Container operating properties

- read-only filesystem;
- temporary directory in `tmpfs`;
- unprivileged Nginx user;
- all capabilities dropped;
- `no-new-privileges`;
- automatic `unless-stopped` restart;
- internal health check at `127.0.0.1:8080/healthz`.

## Essential diagnostics

| Symptom | Check |
| --- | --- |
| `/healthz` does not respond | Container state, Nginx logs and gateway network. |
| Main page returns `401` | Expected without authentication; inspect the secret only on the server. |
| Chart has no geographic basemap | Connectivity to OpenStreetMap tiles; mission data remain local. |
| Waypoint cannot be moved | Phase is not planning, or the YAML draft is invalid. |
| Departure button is disabled | Unsafe station, missing inspections or locked workspace. |
| Depth is `–` | Waypoint is outside available Copernicus cells. |
| Layout changed but smoke test fails | Realign visual assertions with the documented intent; do not disable them. |
