export type MissionPhase =
  | "planning"
  | "underway"
  | "stationkeeping"
  | "lowering"
  | "sampling"
  | "recovering"
  | "completed";

export interface MissionState {
  phase: MissionPhase;
  progress: number;
  depthM: number;
}

const phases: MissionPhase[] = [
  "planning",
  "underway",
  "stationkeeping",
  "lowering",
  "sampling",
  "recovering",
  "completed",
];

export function initialMissionState(): MissionState {
  return { phase: "planning", progress: 0, depthM: 0 };
}

export function advanceMission(state: MissionState): MissionState {
  const index = phases.indexOf(state.phase);
  const phase = phases[Math.min(index + 1, phases.length - 1)] ?? "completed";
  const depthM = phase === "lowering" || phase === "sampling" ? 42 : 0;
  return {
    phase,
    progress: Math.round((phases.indexOf(phase) / (phases.length - 1)) * 100),
    depthM,
  };
}

export function ctdTargetDepth(
  requestedDepthM: number,
  seafloorDepthM: number,
  safetyClearanceM: number,
): number {
  return Math.min(requestedDepthM, seafloorDepthM - safetyClearanceM);
}
