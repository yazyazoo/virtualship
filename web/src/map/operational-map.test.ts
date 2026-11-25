import { afterEach, expect, it } from "vitest";

import { DEMO_EXPEDITION } from "../demo/expedition";
import { MISSION_DATASET } from "../demo/mission-dataset";
import { DemoWorkspace } from "../workspace/demo-workspace";
import "./operational-map";

afterEach(() => document.body.replaceChildren());

it("updates the shared workspace when the tutor suggests a safe station", () => {
  const workspace = new DemoWorkspace(DEMO_EXPEDITION);
  const map = document.createElement("vs-operational-map") as HTMLElement & {
    workspace: DemoWorkspace;
  };
  map.workspace = workspace;
  document.body.append(map);

  map.querySelector<HTMLButtonElement>("[data-recommend-station]")?.click();

  expect(workspace.revisionId).toBe(2);
  expect(workspace.expedition.schedule.waypoints[1]?.location.longitude).toBe(
    Number(MISSION_DATASET.recommendedStation.longitude.toFixed(3)),
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

  const button = map.querySelector<HTMLButtonElement>("[data-recommend-station]");
  expect(button?.disabled).toBe(true);
  button?.click();
  expect(workspace.revisionId).toBe(1);
});

it("shows mission progress and Copernicus provenance on the chart", () => {
  const workspace = new DemoWorkspace(DEMO_EXPEDITION);
  const map = document.createElement("vs-operational-map") as HTMLElement & {
    workspace: DemoWorkspace;
    phase: string;
  };
  map.workspace = workspace;
  document.body.append(map);
  map.phase = "sampling";

  expect(map.getAttribute("data-phase")).toBe("sampling");
  expect(map.textContent).toContain("Copernicus Marine");
});
