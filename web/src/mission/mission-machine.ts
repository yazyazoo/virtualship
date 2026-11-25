import type { MissionPhase } from "../ship/mission-timeline";

export type ShipSection = "bridge" | "wetlab" | "winch" | "engine";

export interface InteractiveMissionState {
  phase: MissionPhase;
  stationSafe: boolean;
  inspectedSections: ShipSection[];
  tutorVisible: boolean;
  history: Array<Omit<InteractiveMissionState, "history">>;
}

export type MissionAction =
  | { type: "set-station-safety"; safe: boolean }
  | { type: "inspect"; section: ShipSection }
  | { type: "depart" }
  | { type: "operate" }
  | { type: "undo" }
  | { type: "toggle-tutor" }
  | { type: "reset" };

const phases: MissionPhase[] = [
  "underway",
  "stationkeeping",
  "lowering",
  "sampling",
  "recovering",
  "completed",
];

export function initialInteractiveMission(): InteractiveMissionState {
  return {
    phase: "planning",
    stationSafe: false,
    inspectedSections: [],
    tutorVisible: true,
    history: [],
  };
}

function snapshot(state: InteractiveMissionState): Omit<InteractiveMissionState, "history"> {
  return {
    phase: state.phase,
    stationSafe: state.stationSafe,
    inspectedSections: [...state.inspectedSections],
    tutorVisible: state.tutorVisible,
  };
}

function remember(state: InteractiveMissionState): InteractiveMissionState {
  return { ...state, history: [...state.history, snapshot(state)] };
}

export function canDepart(state: InteractiveMissionState): boolean {
  return state.stationSafe && state.inspectedSections.includes("wetlab") && state.inspectedSections.includes("winch");
}

export function transitionMission(
  state: InteractiveMissionState,
  action: MissionAction,
): InteractiveMissionState {
  if (action.type === "reset") return initialInteractiveMission();
  if (action.type === "undo") {
    const previous = state.history.at(-1);
    return previous ? { ...previous, history: state.history.slice(0, -1) } : state;
  }
  if (action.type === "toggle-tutor") return { ...state, tutorVisible: !state.tutorVisible };
  if (action.type === "set-station-safety") {
    if (state.stationSafe === action.safe) return state;
    return { ...remember(state), stationSafe: action.safe };
  }
  if (action.type === "inspect") {
    if (state.inspectedSections.includes(action.section)) return state;
    const remembered = remember(state);
    return { ...remembered, inspectedSections: [...remembered.inspectedSections, action.section] };
  }
  if (action.type === "depart") {
    return state.phase === "planning" && canDepart(state)
      ? { ...remember(state), phase: "underway" }
      : state;
  }
  if (action.type === "operate") {
    const index = phases.indexOf(state.phase);
    if (index < 0 || index === phases.length - 1) return state;
    return { ...remember(state), phase: phases[index + 1] ?? "completed" };
  }
  return state;
}
