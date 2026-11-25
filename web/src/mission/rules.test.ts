import { describe, expect, it } from "vitest";

import { evaluateStation, nearestBathymetry } from "./rules";

const cells = [
  { longitude: 4.35, latitude: 53.32, depthM: 32 },
  { longitude: 4.18, latitude: 53.48, depthM: 42 },
];

describe("mission geographic rules", () => {
  it("finds the nearest precomputed bathymetry cell", () => {
    expect(nearestBathymetry(4.19, 53.47, cells)?.depthM).toBe(42);
  });

  it("rejects a 30 m cast without five metres of clearance", () => {
    expect(evaluateStation(4.35, 53.32, cells, 30, 5)).toMatchObject({
      safe: false,
      seafloorDepthM: 32,
      clearanceM: 2,
    });
  });

  it("accepts a station deep enough for the learning objective", () => {
    expect(evaluateStation(4.18, 53.48, cells, 30, 5)).toMatchObject({
      safe: true,
      seafloorDepthM: 42,
      clearanceM: 12,
    });
  });

  it("rejects a waypoint outside the precomputed grid coverage", () => {
    expect(evaluateStation(6.2, 55.0, cells, 30, 5)).toBeNull();
  });
});
