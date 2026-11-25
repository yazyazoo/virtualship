import { describe, expect, it } from "vitest";

import { advanceMission, ctdTargetDepth, initialMissionState } from "./mission-timeline";

describe("CTD mission timeline", () => {
  it("advances through the approved operational phases", () => {
    const phases = [initialMissionState()];
    for (let index = 0; index < 6; index += 1) {
      phases.push(advanceMission(phases.at(-1)!));
    }
    expect(phases.map((state) => state.phase)).toEqual([
      "planning",
      "underway",
      "stationkeeping",
      "lowering",
      "sampling",
      "recovering",
      "completed",
    ]);
  });

  it("keeps the CTD above the seafloor safety clearance", () => {
    expect(ctdTargetDepth(42, 60, 6)).toBe(42);
    expect(ctdTargetDepth(80, 60, 6)).toBe(54);
  });
});
