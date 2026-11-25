import { afterEach, expect, it } from "vitest";

import type { StationEvaluation } from "../mission/rules";
import "./ship-cutaway";

afterEach(() => document.body.replaceChildren());

it("shows CTD cable depth during lowering", () => {
  const ship = document.createElement("vs-ship-cutaway") as HTMLElement & {
    phase: string;
  };
  document.body.append(ship);
  ship.phase = "lowering";

  expect(ship.getAttribute("data-phase")).toBe("lowering");
  expect(ship.textContent).toContain("30 m");
});

it("reveals the CTD profile progressively instead of during planning", () => {
  const ship = document.createElement("vs-ship-cutaway") as HTMLElement & {
    phase: string;
  };
  document.body.append(ship);

  expect(ship.getAttribute("data-samples")).toBe("0");
  ship.phase = "sampling";
  expect(Number(ship.getAttribute("data-samples"))).toBeGreaterThan(1);
  expect(ship.getAttribute("data-crew-active")).toBe("true");
});

it("replaces vessel depth and clearance when the waypoint evaluation changes", () => {
  const ship = document.createElement("vs-ship-cutaway") as HTMLElement & {
    stationEvaluation: StationEvaluation | null;
  };
  document.body.append(ship);

  ship.stationEvaluation = {
    safe: false,
    seafloorDepthM: 27.5,
    clearanceM: -2.5,
    targetDepthM: 30,
    cell: { longitude: 4.3333, latitude: 53.3333, depthM: 27.5 },
  };
  expect(ship.getAttribute("data-station-safe")).toBe("false");
  expect(ship.querySelector("[data-vessel-floor]")?.textContent).toContain("27.5 m");
  expect(ship.querySelector("[data-vessel-clearance]")?.textContent).toContain("−2.5 m");

  ship.stationEvaluation = {
    safe: true,
    seafloorDepthM: 36.1,
    clearanceM: 6.1,
    targetDepthM: 30,
    cell: { longitude: 4.3333, latitude: 53.6667, depthM: 36.1 },
  };
  expect(ship.getAttribute("data-station-safe")).toBe("true");
  expect(ship.querySelector("[data-vessel-floor]")?.textContent).toContain("36.1 m");
  expect(ship.querySelector("[data-vessel-clearance]")?.textContent).toContain("6.1 m");

  ship.stationEvaluation = null;
  expect(ship.getAttribute("data-station-safe")).toBe("outside");
  expect(ship.querySelector("[data-vessel-floor]")?.textContent).toContain("– m");
  expect(ship.querySelector("[data-vessel-clearance]")?.textContent).toContain("– m");
});

it("moves the bridge into a clickable cockpit and leaves three hull compartments", () => {
  const ship = document.createElement("vs-ship-cutaway") as HTMLElement & { selectedSections: string[] };
  document.body.append(ship);

  expect(ship.querySelector(".ship-cockpit[data-ship-section='bridge']")).not.toBeNull();
  expect([...ship.querySelectorAll(".ship-hull [data-ship-section]")].map((section) => section.getAttribute("data-ship-section"))).toEqual([
    "engine", "wetlab", "winch",
  ]);
});

it("shows one operational row with exactly three information cards", () => {
  const ship = document.createElement("vs-ship-cutaway") as HTMLElement & { stationEvaluation: StationEvaluation | null };
  document.body.append(ship);
  ship.stationEvaluation = {
    safe: false,
    seafloorDepthM: 27.5,
    clearanceM: -2.5,
    targetDepthM: 30,
    cell: { longitude: 4.3333, latitude: 53.3333, depthM: 27.5 },
  };

  expect(ship.querySelectorAll(".ship-info-grid > section")).toHaveLength(3);
  expect(ship.querySelector(".depth-key-card")?.textContent).toContain("≥35 m");
  expect(ship.querySelector(".station-status-card")?.textContent).toContain("Fondale troppo vicino");
  expect(ship.querySelector(".science-readout")?.textContent).toContain("OPERAZIONE CTD");
});

it("reveals an academic description for every selected vessel section", () => {
  const ship = document.createElement("vs-ship-cutaway") as HTMLElement & { selectedSections: string[] };
  document.body.append(ship);
  ship.selectedSections = ["engine", "bridge", "wetlab", "winch"];

  const descriptions = [...ship.querySelectorAll("[data-section-description]")];
  expect(descriptions).toHaveLength(4);
  expect(descriptions.every((description) => description.textContent?.trim())).toBe(true);
});

it("disables the moved safe-station action when GUI editing is locked", () => {
  const ship = document.createElement("vs-ship-cutaway") as HTMLElement & { controlsLocked: boolean };
  document.body.append(ship);
  ship.controlsLocked = true;

  expect(ship.querySelector<HTMLButtonElement>("[data-recommend-station]")?.disabled).toBe(true);
});
