import { describe, expect, it } from "vitest";

import { initialInteractiveMission, transitionMission } from "./mission-machine";

describe("interactive mission", () => {
  it("requires a safe station and the key ship sections before departure", () => {
    let state = initialInteractiveMission();
    state = transitionMission(state, { type: "set-station-safety", safe: true });
    state = transitionMission(state, { type: "depart" });
    expect(state.phase).toBe("planning");

    state = transitionMission(state, { type: "inspect", section: "wetlab" });
    state = transitionMission(state, { type: "inspect", section: "winch" });
    state = transitionMission(state, { type: "depart" });
    expect(state.phase).toBe("underway");
  });

  it("does not skip operational phases", () => {
    let state = initialInteractiveMission();
    state = transitionMission(state, { type: "set-station-safety", safe: true });
    state = transitionMission(state, { type: "inspect", section: "wetlab" });
    state = transitionMission(state, { type: "inspect", section: "winch" });
    state = transitionMission(state, { type: "depart" });
    state = transitionMission(state, { type: "operate" });
    expect(state.phase).toBe("stationkeeping");
    state = transitionMission(state, { type: "operate" });
    expect(state.phase).toBe("lowering");
  });

  it("undoes the last learning action", () => {
    let state = initialInteractiveMission();
    state = transitionMission(state, { type: "inspect", section: "wetlab" });
    state = transitionMission(state, { type: "undo" });
    expect(state.inspectedSections).toEqual([]);
  });
});
