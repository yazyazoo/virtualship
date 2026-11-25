import { describe, expect, it } from "vitest";

import { isInsideNorthSea, toMapCoordinates, updateStation } from "./route-model";
import { DEMO_EXPEDITION } from "../demo/expedition";

describe("North Sea route model", () => {
  it.each([
    [3, 51, true],
    [7, 55.5, true],
    [2.99, 53, false],
    [5, 55.51, false],
  ])("checks bbox for %s,%s", (longitude, latitude, expected) => {
    expect(isInsideNorthSea({ longitude, latitude })).toBe(expected);
  });

  it("uses GeoJSON longitude-latitude order", () => {
    expect(toMapCoordinates({ latitude: 53.2, longitude: 4.1 })).toEqual([
      4.1, 53.2,
    ]);
  });

  it("moves a station inside the supported area without mutating input", () => {
    const moved = updateStation(DEMO_EXPEDITION, 1, {
      latitude: 53.5,
      longitude: 4.5,
    });
    expect(moved.schedule.waypoints[1]?.location).toEqual({
      latitude: 53.5,
      longitude: 4.5,
    });
    expect(DEMO_EXPEDITION.schedule.waypoints[1]?.location).not.toEqual(
      moved.schedule.waypoints[1]?.location,
    );
  });

  it("rejects a station outside the supported area", () => {
    expect(() =>
      updateStation(DEMO_EXPEDITION, 1, { latitude: 56, longitude: 4.5 }),
    ).toThrow("outside North Sea mission bounds");
  });
});
