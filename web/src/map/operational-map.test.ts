import { afterEach, expect, it } from "vitest";

import { DEMO_EXPEDITION } from "../demo/expedition";
import { DemoWorkspace } from "../workspace/demo-workspace";
import { operationalMapCameraOptions } from "./operational-map";

afterEach(() => document.body.replaceChildren());

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

it("keeps the chart surface free of floating information cards", () => {
  const workspace = new DemoWorkspace(DEMO_EXPEDITION);
  const map = document.createElement("vs-operational-map") as HTMLElement & {
    workspace: DemoWorkspace;
  };
  map.workspace = workspace;
  document.body.append(map);

  expect(map.querySelector(".bathymetry-legend")).toBeNull();
  expect(map.querySelector(".station-card")).toBeNull();
  expect(map.querySelector("[data-recommend-station]")).toBeNull();
});

it("updates floor and clearance from the dragged waypoint without stale values", () => {
  const workspace = new DemoWorkspace(DEMO_EXPEDITION);
  const map = document.createElement("vs-operational-map") as HTMLElement & {
    workspace: DemoWorkspace;
  };
  map.workspace = workspace;
  document.body.append(map);

  expect(map.getAttribute("data-station-safe")).toBe("false");

  workspace.applyGuiPatch((expedition) => {
    const station = expedition.schedule.waypoints[1];
    if (!station) return;
    station.location = { longitude: 4.3333, latitude: 53.6667 };
    station.sea_depth_meter = -36.1;
  });

  expect(map.getAttribute("data-station-safe")).toBe("true");

  workspace.applyGuiPatch((expedition) => {
    const station = expedition.schedule.waypoints[1];
    if (!station) return;
    station.location = { longitude: 6.5, latitude: 55.5 };
    station.sea_depth_meter = null;
  });

  expect(map.getAttribute("data-station-safe")).toBe("false");
});

it("fits the real Copernicus footprint while retaining useful zoom-out range", () => {
  const camera = operationalMapCameraOptions();

  expect(camera.bounds).toEqual([[3.7916, 52.7917], [4.9583, 53.7917]]);
  expect(camera.minZoom).toBeLessThan(camera.fitBoundsOptions.maxZoom);
  expect(camera).not.toHaveProperty("maxBounds");
});
