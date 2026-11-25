import { describe, expect, it } from "vitest";

import { MISSION_DATASET } from "./mission-dataset";

describe("preprocessed Copernicus mission data", () => {
  it("records verified provenance and the exact source variables", () => {
    expect(MISSION_DATASET.source.status).toBe("verified-copernicus-subset");
    expect(MISSION_DATASET.source.variables).toEqual(["deptho", "thetao", "so"]);
    expect(MISSION_DATASET.source.rawChecksumsSha256).toBeDefined();
  });

  it("contains enough real cells and samples for the playable station", () => {
    expect(MISSION_DATASET.bathymetry.length).toBeGreaterThan(100);
    expect(MISSION_DATASET.ctdProfile.length).toBeGreaterThan(10);
    expect(Math.max(...MISSION_DATASET.bathymetry.map((cell) => cell.depthM))).toBeGreaterThanOrEqual(
      MISSION_DATASET.targetDepthM + MISSION_DATASET.safetyClearanceM,
    );
  });
});
