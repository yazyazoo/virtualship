import { describe, expect, it } from "vitest";

import type { BathymetryCell } from "../mission/rules";
import { BATHYMETRY_CONTOUR_LEVELS, bathymetryBounds, bathymetryContours } from "./bathymetry-visuals";

const GRID: BathymetryCell[] = [
  { longitude: 4, latitude: 53, depthM: 5 },
  { longitude: 5, latitude: 53, depthM: 15 },
  { longitude: 4, latitude: 54, depthM: 25 },
  { longitude: 5, latitude: 54, depthM: 40 },
];

describe("bathymetry presentation data", () => {
  it("expands regular-grid cell centres to the true coverage edges", () => {
    expect(bathymetryBounds(GRID)).toEqual([[3.5, 52.5], [5.5, 54.5]]);
  });

  it("builds labelled isobaths for the operational depth thresholds", () => {
    expect(BATHYMETRY_CONTOUR_LEVELS).toEqual([10, 20, 30, 35]);

    const contours = bathymetryContours(GRID, BATHYMETRY_CONTOUR_LEVELS);

    expect(contours.features.map((feature) => feature.properties)).toEqual([
      { depthM: 10, label: "10 m" },
      { depthM: 20, label: "20 m" },
      { depthM: 30, label: "30 m" },
      { depthM: 35, label: "35 m" },
    ]);
    expect(contours.features.every((feature) => feature.geometry.coordinates.length === 2)).toBe(true);
  });

  it("returns no geographic presentation for an empty dataset", () => {
    expect(bathymetryBounds([])).toBeNull();
    expect(bathymetryContours([], BATHYMETRY_CONTOUR_LEVELS)).toEqual({
      type: "FeatureCollection",
      features: [],
    });
  });
});
