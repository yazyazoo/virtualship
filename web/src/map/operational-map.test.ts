import { afterEach, expect, it } from "vitest";

import { DEMO_EXPEDITION } from "../demo/expedition";
import { DemoWorkspace } from "../workspace/demo-workspace";
import "./operational-map";

afterEach(() => document.body.replaceChildren());

it("updates the shared workspace when a suggested station is moved", () => {
  const workspace = new DemoWorkspace(DEMO_EXPEDITION);
  const map = document.createElement("vs-operational-map") as HTMLElement & {
    workspace: DemoWorkspace;
  };
  map.workspace = workspace;
  document.body.append(map);

  map.querySelector<HTMLButtonElement>("[data-move-station='1']")?.click();

  expect(workspace.revisionId).toBe(2);
  expect(workspace.expedition.schedule.waypoints[1]?.location.longitude).toBe(
    4.47,
  );
});

it("disables station edits while an invalid YAML draft is locked", () => {
  const workspace = new DemoWorkspace(DEMO_EXPEDITION);
  workspace.applyYamlDraft("schedule: [broken");
  const map = document.createElement("vs-operational-map") as HTMLElement & {
    workspace: DemoWorkspace;
  };
  map.workspace = workspace;
  document.body.append(map);

  const button = map.querySelector<HTMLButtonElement>("[data-move-station='1']");
  expect(button?.disabled).toBe(true);
  button?.click();
  expect(workspace.revisionId).toBe(1);
});

it("shows mission progress on the operational chart", () => {
  const workspace = new DemoWorkspace(DEMO_EXPEDITION);
  const map = document.createElement("vs-operational-map") as HTMLElement & {
    workspace: DemoWorkspace;
    phase: string;
  };
  map.workspace = workspace;
  document.body.append(map);
  map.phase = "sampling";

  expect(map.getAttribute("data-phase")).toBe("sampling");
  expect(map.querySelector(".vessel-marker")).not.toBeNull();
});
