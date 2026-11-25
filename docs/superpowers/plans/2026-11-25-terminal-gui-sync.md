# Terminal and Web UI Synchronisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the controlled terminal visible and stateful while GUI actions append meaningful lines to the shared audit.

**Architecture:** Preserve the disposable sidebar component's session state across `VirtualShipDemo.render()` calls. Extend `DemoWorkspace` with a narrow activity-recording method and use it only for accepted, user-visible mission transitions.

**Tech Stack:** TypeScript, native Web Components, Vitest/jsdom, Vite, Playwright smoke.

**Spec:** `docs/superpowers/specs/2026-11-25-terminal-gui-sync-design.md`

## Global Constraints

- Continue using the controlled terminal; do not expose an operating-system shell.
- Do not redesign mission rules or scientific data.
- Preserve the existing GUI/YAML/workspace contract.
- Work only on branch `demo` in the existing repository.

## Review Focus

- Re-render after a GUI action must not return Terminal to Tutor.
- A previously entered terminal command must remain visible after re-render.
- Repeated/no-op mission actions must not create false audit entries.
- Internal station-safety recalculation must not flood the audit.
- Language changes must preserve terminal session state.

---

### Task 1: Persistent terminal session and GUI activity audit

**Files:**
- Modify: `web/src/app.test.ts`
- Modify: `web/src/sidebar/developer-sidebar.ts`
- Modify: `web/src/workspace/demo-workspace.ts`
- Modify: `web/src/app.ts`
- Modify: `web/e2e/mission-smoke.mjs`
- Modify: `docs/academy/it/game-design.md`
- Modify: `docs/academy/en/game-design.md`

**Interfaces:**
- Produces: `DeveloperSidebarSession` and `DeveloperSidebar.sessionState` getter/setter.
- Produces: `DemoWorkspace.recordActivity(message: string): void`.
- Consumes: existing `MissionAction`, `InteractiveMissionState` and workspace audit rendering.

- [x] **Step 1: Write the failing integration test**

Add a test that opens Terminal, runs `pwd`, clicks a vessel section and asserts that Terminal remains selected, `$ pwd` remains visible and a GUI inspection audit line appears.

- [x] **Step 2: Run the focused test and verify RED**

Run: `npm --prefix web run test -- --run src/app.test.ts`

Expected: failure because the sidebar returns to Tutor and no mission activity is recorded.

- [x] **Step 3: Preserve sidebar session state**

Add `DeveloperSidebarSession` with selected tab, terminal lines and open file. Capture the state before `VirtualShipDemo` replaces its HTML and restore it on the new sidebar before assigning the workspace.

- [x] **Step 4: Record accepted GUI actions**

Add `recordActivity(message: string): void` to the workspace. In `applyMissionAction`, compare previous and next mission states and record only accepted `inspect`, `depart`, `operate`, `undo` and tutor-visibility changes.

- [x] **Step 5: Verify GREEN and extend browser smoke**

Run the focused test. Extend smoke to leave Terminal open during a GUI inspection and assert that tab, command transcript and activity line remain visible.

- [x] **Step 6: Update bilingual documentation**

Clarify in both game-design chapters that GUI mission actions are appended to the shared audit and remain visible in the terminal across redraws.

- [x] **Step 7: Run full verification**

Run typecheck, all Vitest tests, production build, Markdown link check and browser smoke.

- [x] **Step 8: Commit, push and deploy**

Commit on `demo`, push to `origin/demo`, build the matching image on the VPS, replace the container and verify `healthy` plus the public `/healthz` endpoint.
