# Bathymetry Map and Research Vessel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Copernicus bathymetry operationally readable, keep waypoint depth data synchronized across the map and vessel, and reclaim vertical space with a map-dominant academic layout and a more credible research-vessel cutaway.

**Architecture:** Derive reusable bathymetry presentation data from the existing preprocessed Copernicus cells, then render it as depth bands, labelled isobaths, a coverage boundary, and a compact legend in MapLibre. Compute station evaluation once in the application and pass it into both map-adjacent mission state and the vessel cutaway, while retaining the existing shared workspace as the source of waypoint coordinates. Keep the vessel as semantic HTML/CSS so its four compartments remain keyboard-accessible buttons.

**Tech Stack:** TypeScript, Web Components, MapLibre GL 6.5, CSS, Vitest, Vite, Playwright smoke test.

**Spec:** Direct user specification in the active Codex chat, 2026-11-25.

## Global Constraints

- Work only in `C:\Users\yazya\Desktop\vscode\virtualship` on branch `demo`; do not create a worktree or second copy.
- Preserve the existing Copernicus mission dataset and provenance; do not fetch or invent bathymetry.
- Keep Italian and English UI copy aligned and maintain an academic visual tone.
- Preserve waypoint dragging, the reversible tutor, YAML synchronization, clickable vessel sections, and the mission flow.
- Do not read, expose, or track `config/copernicus.env`, `ZZZ`, or `.superpowers`.

## Review Focus

- A waypoint outside the Copernicus footprint must show unavailable floor/clearance values without presenting stale vessel data.
- Moving between two covered cells with different depths must update the map card, YAML depth, station safety, and vessel readout from the same evaluation.
- The 35 m safe-depth threshold must remain distinguishable from the 30 m CTD target.
- Zooming out must remain possible beyond the initial extent without allowing map state to break waypoint dragging.
- Compact headers and the map-dominant grid must remain legible at the existing 1180 px minimum viewport.

---

### Task 1: Bathymetry presentation model

**Files:**
- Create: `web/src/map/bathymetry-visuals.ts`
- Create: `web/src/map/bathymetry-visuals.test.ts`

**Interfaces:**
- Consumes: `BathymetryCell` from `web/src/mission/rules.ts`.
- Produces: `bathymetryBounds(cells)`, `bathymetryContours(cells, levels)`, and exported depth-band/contour constants for the MapLibre component.

- [ ] **Step 1: Write failing tests for hand-checked bounds, labelled 10/20/30/35 m contour output, and empty-cell handling.**
- [ ] **Step 2: Run `npm test -- --run src/map/bathymetry-visuals.test.ts` from `web` and confirm the failures are caused by the missing module.**
- [ ] **Step 3: Implement the smallest regular-grid contour builder and bounds helper that satisfy the tests.**
- [ ] **Step 4: Re-run the focused tests and confirm they pass.**

### Task 2: Operational map rendering and zoom behavior

**Files:**
- Modify: `web/src/map/operational-map.ts`
- Modify: `web/src/map/operational-map.test.ts`
- Modify: `web/src/styles.css`

**Interfaces:**
- Consumes: presentation helpers from Task 1 and live `DemoWorkspace` waypoint coordinates.
- Produces: visible depth bands, labelled isobaths, coverage boundary, legend, live station card, and an initial camera based on the real data extent with functional zoom-out.

- [ ] **Step 1: Add failing component tests for the bathymetry legend, live covered/outside station values, and a camera configuration whose minimum zoom is lower than the initial zoom and is not constrained by the old oversized bounds.**
- [ ] **Step 2: Run the focused map tests and verify the expected failures.**
- [ ] **Step 3: Add the contour/boundary sources and layers, reduce basemap dominance, render the metric legend, and replace the fixed camera/maxBounds setup with data-derived fit bounds plus a permissive minimum zoom.**
- [ ] **Step 4: Re-run the focused map tests and confirm they pass.**

### Task 3: One station evaluation shared with the vessel

**Files:**
- Modify: `web/src/app.ts`
- Modify: `web/src/app.test.ts`
- Modify: `web/src/ship/ship-cutaway.ts`
- Modify: `web/src/ship/ship-cutaway.test.ts`

**Interfaces:**
- Consumes: `StationEvaluation | null` returned by `evaluateStation` for the current shared-workspace waypoint.
- Produces: `ShipCutaway.stationEvaluation`, synchronized floor/clearance/safe-state readouts, and CTD geometry based on the mission target rather than hard-coded local values.

- [ ] **Step 1: Add failing ship and app integration tests showing two different covered depths and an outside-coverage waypoint update the vessel readout without stale values.**
- [ ] **Step 2: Run the focused tests and confirm the failures expose the missing station-evaluation input.**
- [ ] **Step 3: Compute the current evaluation in `VirtualShipDemo.render()`, pass it to the cutaway, and render target/floor/clearance values and safety state from that input.**
- [ ] **Step 4: Re-run the focused tests and confirm they pass.**

### Task 4: Compact academic layout and realistic vessel cutaway

**Files:**
- Modify: `web/src/ship/ship-cutaway.ts`
- Modify: `web/src/styles.css`
- Modify: `web/e2e/mission-smoke.mjs`

**Interfaces:**
- Consumes: existing four clickable ship-section buttons and the live evaluation from Task 3.
- Produces: compact global/mission/panel headers, a map-dominant two-row grid, and a restrained research-vessel profile with hull, superstructure, bridge glazing, working deck, compartments, waterline, winch, and CTD.

- [ ] **Step 1: Extend the browser smoke assertions to verify the map is taller than the vessel, the global and panel headers are compact, all four vessel sections are visible/clickable, and the map legend is visible at 2048×987.**
- [ ] **Step 2: Run the smoke test against the current UI and verify it fails on the new geometry/visual contracts.**
- [ ] **Step 3: Adjust CSS dimensions and vessel markup/styles while preserving focus states, labels, and click targets.**
- [ ] **Step 4: Run focused unit tests, the full unit suite, typecheck/build, and browser smoke test; inspect the resulting screenshot for overlaps, clipping, and readability.**

### Task 5: Final regression and repository verification

**Files:**
- Modify only files already listed if verification exposes a regression.

**Interfaces:**
- Consumes: completed Tasks 1–4.
- Produces: a verified local `demo` working tree ready for review.

- [ ] **Step 1: Run `npm test -- --run`, `npm run build`, and `npm run smoke:browser` from `web`.**
- [ ] **Step 2: Confirm `git diff --check`, inspect `git diff --stat`, and verify branch `demo` without reading ignored sensitive files.**
- [ ] **Step 3: Report changed files, test/build/smoke evidence, and any deployment work still pending; do not deploy unless separately requested.**
