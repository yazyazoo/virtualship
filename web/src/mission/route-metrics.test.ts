import { describe, expect, it } from "vitest";

import { DEMO_EXPEDITION } from "../demo/expedition";
import { missionMetrics } from "./route-metrics";

describe("route metrics", () => {
  it("derives distance and duration from the expedition YAML", () => {
    const metrics = missionMetrics(DEMO_EXPEDITION);
    expect(metrics.distanceNm).toBeGreaterThan(30);
    expect(metrics.durationLabel).toBe("10 h 00");
  });

  it("changes distance when the station moves", () => {
    const moved = structuredClone(DEMO_EXPEDITION);
    const station = moved.schedule.waypoints[1];
    if (!station) throw new Error("station missing");
    station.location.latitude += 0.3;
    expect(missionMetrics(moved).distanceNm).not.toBe(missionMetrics(DEMO_EXPEDITION).distanceNm);
  });
});
