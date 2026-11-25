import { afterEach, expect, it } from "vitest";

import { DEMO_EXPEDITION } from "../demo/expedition";
import { MISSION_DATASET } from "../demo/mission-dataset";
import { DemoWorkspace } from "../workspace/demo-workspace";
import { operationalMapCameraOptions } from "./operational-map";

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

it("explains the Copernicus depth bands and operational isobaths", () => {
  const workspace = new DemoWorkspace(DEMO_EXPEDITION);
  const map = document.createElement("vs-operational-map") as HTMLElement & {
    workspace: DemoWorkspace;
  };
  map.workspace = workspace;
  document.body.append(map);

  const legend = map.querySelector<HTMLElement>(".bathymetry-legend");
  expect(legend?.textContent).toContain("Profondità");
  expect(legend?.textContent).toContain("0–10 m");
  expect(legend?.textContent).toContain("30–35 m");
  expect(legend?.textContent).toContain("≥35 m");
  expect(legend?.textContent).toContain("Isobate");
});

it("updates floor and clearance from the dragged waypoint without stale values", () => {
  const workspace = new DemoWorkspace(DEMO_EXPEDITION);
  const map = document.createElement("vs-operational-map") as HTMLElement & {
    workspace: DemoWorkspace;
  };
  map.workspace = workspace;
  document.body.append(map);

  expect(map.querySelector("[data-station-floor]")?.textContent).toContain("27.5 m");
  expect(map.querySelector("[data-station-clearance]")?.textContent).toContain("−2.5 m");

  workspace.applyGuiPatch((expedition) => {
    const station = expedition.schedule.waypoints[1];
    if (!station) return;
    station.location = { longitude: 4.3333, latitude: 53.6667 };
    station.sea_depth_meter = -36.1;
  });

  expect(map.querySelector("[data-station-floor]")?.textContent).toContain("36.1 m");
  expect(map.querySelector("[data-station-clearance]")?.textContent).toContain("6.1 m");

  workspace.applyGuiPatch((expedition) => {
    const station = expedition.schedule.waypoints[1];
    if (!station) return;
    station.location = { longitude: 6.5, latitude: 55.5 };
    station.sea_depth_meter = null;
  });

  expect(map.querySelector("[data-station-floor]")?.textContent).toContain("– m");
  expect(map.querySelector("[data-station-clearance]")?.textContent).toContain("– m");
  expect(map.textContent).toContain("Fuori dalla copertura Copernicus");
});

it("fits the real Copernicus footprint while retaining useful zoom-out range", () => {
  const camera = operationalMapCameraOptions();

  expect(camera.bounds).toEqual([[3.7916, 52.7917], [4.9583, 53.7917]]);
  expect(camera.minZoom).toBeLessThan(camera.fitBoundsOptions.maxZoom);
  expect(camera).not.toHaveProperty("maxBounds");
});
