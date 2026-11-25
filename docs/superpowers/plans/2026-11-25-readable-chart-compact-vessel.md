# Readable Chart and Compact Vessel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear the operational chart and reorganize the vessel strip into a short ship plus three readable information cards.

**Architecture:** Keep bathymetric rendering in `OperationalMap`; move legend and station presentation into `ShipCutaway`. Connect the moved recommendation action through `VirtualShipDemo` to a public map method.

**Tech Stack:** TypeScript, Web Components, MapLibre GL, CSS, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-25-readable-chart-compact-vessel-design.md`

## Global Constraints

- Preserve Copernicus data values and mission safety rules.
- Keep Italian and English UI behavior equivalent.
- Do not create a worktree or second copy.

## Review Focus

- The moved recommendation button must still update map, YAML and vessel readouts.
- YAML lock must disable the moved button.
- The bridge must remain keyboard-clickable in the cockpit.
- Every selected section must expose a non-empty description.
- Sparse soundings must still include the deepest water.

---

### Task 1: Clear and clarify the chart

**Files:** `web/src/map/bathymetry-visuals.ts`, `web/src/map/operational-map.ts`, related tests and `web/src/styles.css`.

- [x] Add failing tests for sparse soundings and an overlay-free map.
- [x] Reduce soundings, retain deepest water, remove shadow, increase contrast and remove floating cards.
- [x] Run focused map tests.

### Task 2: Recompose vessel and operational cards

**Files:** `web/src/ship/ship-cutaway.ts`, `web/src/app.ts`, related tests and `web/src/styles.css`.

- [x] Add failing tests for cockpit bridge, three hull rooms, three cards and selected descriptions.
- [x] Implement the compact ship, cards and recommendation event delegation.
- [x] Run focused ship and app tests.

### Task 3: Verify and publish

- [x] Run all tests, type-check, build and browser smoke checks.
- [ ] Commit on `demo`, push `origin/demo`, deploy the versioned container and verify public health.
