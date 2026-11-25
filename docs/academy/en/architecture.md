# Technical architecture

**Language:** English · [Italiano](../it/architecture.md)

## Scope

The repository contains two related but distinct products:

1. **Upstream VirtualShip** — Python package and CLI for oceanographic simulation.
2. **VirtualShip Academy vertical slice** — standalone web application in `web/`, currently driven by preprocessed data.

The Academy does not replace the upstream simulator. It establishes a teaching interface and interaction model intended to connect progressively to real services.

## Vertical-slice stack

| Area | Technology |
| --- | --- |
| Language | TypeScript |
| UI | Native Web Components |
| Build | Vite |
| Chart | MapLibre GL 6.5 |
| Configuration | YAML |
| Tests | Vitest + jsdom |
| Browser smoke | Playwright Core with an installed Chromium browser |
| Production runtime | Nginx in a Docker container |

## State flow

```text
                 ┌──────────────────┐
                 │ DemoWorkspace    │
                 │ expedition.yaml  │
                 │ revision + audit │
                 └────────┬─────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
        Chart          YAML editor      Terminal/Files
          │               │                │
          └──── validated updates ─────────┘
                          │
                          ▼
                  Station evaluation
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
        Mission state              Vessel/CTD
```

`DemoWorkspace` is the authoritative expedition source. It exposes structured copies, serialises YAML, validates edits and notifies components. The GUI and terminal do not maintain independent expedition copies.

Synchronisation is bidirectional but intentionally mediated: the Web UI applies validated patches that the terminal and files can read immediately; the terminal can reinitialise the workspace, open the planner or request mission start, producing immediate UI updates. The controlled terminal provides neither arbitrary writes nor a hidden second configuration.

## Mission state

The interactive state machine stores:

- current phase;
- station safety;
- inspected vessel sections;
- tutor visibility;
- undo history.

Operational transitions are deliberately explicit:

```text
planning → underway → stationkeeping → lowering
         → sampling → recovering → completed
```

## Main module responsibilities

| Path | Responsibility |
| --- | --- |
| `web/src/app.ts` | Composition, language, mode, events and synchronisation. |
| `web/src/workspace/demo-workspace.ts` | Shared state, revisions, audit and YAML validation. |
| `web/src/map/operational-map.ts` | Chart, waypoint, route and geographic updates. |
| `web/src/map/bathymetry-visuals.ts` | Bands, contours, cell boundary and sounding selection. |
| `web/src/mission/rules.ts` | Nearest cell, actual coverage, clearance and safety. |
| `web/src/mission/mission-machine.ts` | Mission gates and transitions. |
| `web/src/ship/ship-cutaway.ts` | Vessel, sections, CTD, status panels and profile. |
| `web/src/sidebar/developer-sidebar.ts` | Tutor, terminal, YAML and files. |
| `web/src/sidebar/controlled-terminal.ts` | Allowed teaching commands and shell rejection. |
| `web/src/demo/mission-dataset.json` | Mission 01 scientific snapshot and metadata. |

## Important contracts

### Waypoint update

1. The user moves NS-01.
2. The chart evaluates the position against available cells.
3. `sea_depth_meter` is updated or set to `null` outside coverage.
4. The workspace revision increments.
5. Chart, vessel, tutor and YAML redraw from the same state.

### Invalid YAML draft

1. The text is retained as an unapplied draft.
2. The GUI is locked to avoid implicit overwrites.
3. Terminal and tutor explain the problem.
4. The learner corrects or stashes the draft.

### Terminal

The terminal recognises only explicitly implemented commands. It rejects metacharacters, redirections and system commands. `virtualship run` starts the precompiled mission; it does not execute the Python package or an external process.

### Web UI, terminal and file synchronisation

1. A chart or configuration-control change goes through `applyGuiPatch` and increments the revision.
2. YAML, `cat expedition.yaml` and the Files viewer read the new serialisation of that same workspace.
3. `virtualship init` changes the workspace from the terminal and causes subscribed components to redraw.
4. `virtualship plan` takes the learner to the YAML view; `virtualship run` emits the same start action used by the UI.
5. Every channel applies the same invalid-draft lock and the same mission gates.

The Files panel is a safe, read-only viewer. Every entry can be opened; `expedition.yaml` is dynamic, while the checkpoint, CTD profile and README are versioned teaching artefacts.

## Deployment security

The production container:

- uses a read-only root filesystem;
- runs Nginx as an unprivileged user;
- drops all Linux capabilities;
- enables `no-new-privileges`;
- mounts the authentication file read-only;
- exposes `/healthz` without authentication;
- applies essential security headers.

## Planned evolution

A future connection to real services should preserve the interface contract:

```text
Browser → authenticated API/Gateway → job queue → Spider/Slurm
                                         │
                                         └→ result and log storage
```

Copernicus and HPC credentials must remain server-side. The browser receives a job ID, state, filtered logs and artefact references, never secrets or shell access.

## Test strategy

- unit tests for geographic rules, state machine and validation;
- component tests for Web Components and synchronisation;
- integration tests for the GUI/YAML/terminal/files/mission flow;
- TypeScript build as a static gate;
- browser smoke for layout, map and complete cycle;
- container and public endpoint health checks after deployment.
