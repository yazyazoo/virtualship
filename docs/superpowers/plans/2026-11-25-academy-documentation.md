# VirtualShip Academy Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a complete, maintainable documentation set for the VirtualShip Academy serious game and its current Copernicus vertical slice.

**Architecture:** Add a dedicated `docs/academy/` section that separates product vision, game design, progression, scientific provenance, software architecture and operations. Link it from the Sphinx documentation and update the browser-demo README so current claims match the implementation.

**Tech Stack:** Markdown/MyST, Sphinx toctree, repository source code and versioned mission metadata.

**Spec:** Direct user request in the active Codex chat, 2026-11-25.

## Global Constraints

- Write in Italian with stable English product and technical names where appropriate.
- Mark current, planned and upstream capabilities explicitly.
- Do not expose credentials or ignored local configuration.
- Describe the four game levels in depth without presenting planned features as implemented.

## Review Focus

- Copernicus bathymetry and CTD provenance must match the versioned mission dataset.
- Current demo limitations must remain distinct from the upstream Python simulator.
- Level progression must increase autonomy and scientific responsibility, not only task count.
- Deployment documentation must not contain passwords or private material.
- Navigation links must resolve from the Sphinx documentation root.

---

### Task 1: Product and game documentation

- [x] Create the Academy documentation index, vision, game design and detailed level progression.
- [x] Separate implemented Level 1 behavior from planned Levels 2–4.

### Task 2: Mission, science and architecture

- [x] Document Mission 01, Copernicus provenance, simulation boundaries and technical architecture.
- [x] Document terminology and the GUI → YAML → CLI shared-workspace model.

### Task 3: Operations and roadmap

- [x] Document local development, verification, deployment, rollback and maintenance.
- [x] Add a milestone roadmap and update repository navigation and `web/README.md`.
- [x] Validate links, inspect the diff and commit the documentation on `demo`.
