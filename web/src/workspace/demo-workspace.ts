import { parse, stringify } from "yaml";

import type {
  DemoExpedition,
  WorkspaceResult,
  WorkspaceSnapshot,
} from "./types";

type Listener = () => void;

function cloneExpedition(value: DemoExpedition): DemoExpedition {
  return structuredClone(value);
}

function validateExpedition(value: unknown): value is DemoExpedition {
  if (!value || typeof value !== "object") return false;
  const expedition = value as Partial<DemoExpedition>;
  const ship = expedition.ship_config;
  const ctd = expedition.instruments_config?.ctd_config;
  const waypoints = expedition.schedule?.waypoints;
  const finite = (item: unknown): item is number =>
    typeof item === "number" && Number.isFinite(item);
  if (
    !ship ||
    !finite(ship.ship_speed_knots) || ship.ship_speed_knots <= 0 ||
    !finite(ship.waypoint_slowdown_time_minutes) || ship.waypoint_slowdown_time_minutes < 0 ||
    !finite(ship.waypoint_speedup_time_minutes) || ship.waypoint_speedup_time_minutes < 0 ||
    !ctd ||
    !finite(ctd.max_depth_meter) ||
    !finite(ctd.min_depth_meter) ||
    ctd.max_depth_meter >= ctd.min_depth_meter ||
    !finite(ctd.winch_speed_meter_per_second) || ctd.winch_speed_meter_per_second <= 0 ||
    !Array.isArray(ctd.sensors) || !ctd.sensors.every((sensor) => typeof sensor === "string") ||
    !Array.isArray(waypoints) || waypoints.length < 2
  ) return false;
  return waypoints.every((waypoint) => {
    if (!waypoint || typeof waypoint !== "object") return false;
    const { location, time, instrument, sea_depth_meter: seaDepth } = waypoint;
    return Boolean(
      location &&
      finite(location.latitude) && location.latitude >= 51 && location.latitude <= 55.5 &&
      finite(location.longitude) && location.longitude >= 3 && location.longitude <= 7 &&
      typeof time === "string" && Number.isFinite(Date.parse(time)) &&
      (instrument === undefined || (Array.isArray(instrument) && instrument.every((item) => typeof item === "string"))) &&
      (seaDepth === undefined || seaDepth === null || finite(seaDepth)),
    );
  });
}

export class DemoWorkspace {
  private expeditionValue: DemoExpedition;
  private revisionValue = 1;
  private invalidDraftValue: string | null = null;
  private listeners = new Set<Listener>();
  readonly audit: string[] = ["# workspace initialised · revision 1"];

  constructor(initial: DemoExpedition) {
    this.expeditionValue = cloneExpedition(initial);
  }

  get expedition(): DemoExpedition {
    return cloneExpedition(this.expeditionValue);
  }

  get revisionId(): number {
    return this.revisionValue;
  }

  get invalidDraft(): string | null {
    return this.invalidDraftValue;
  }

  get guiLocked(): boolean {
    return this.invalidDraftValue !== null;
  }

  get yaml(): string {
    return stringify(this.expeditionValue, { lineWidth: 0 });
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  applyGuiPatch(change: (expedition: DemoExpedition) => void): WorkspaceResult {
    if (this.guiLocked) {
      throw new Error("Cannot edit GUI while an invalid YAML draft exists");
    }
    const next = cloneExpedition(this.expeditionValue);
    change(next);
    if (!validateExpedition(next)) return { ok: false, error: "invalid expedition" };
    const speedChanged =
      next.ship_config.ship_speed_knots !==
      this.expeditionValue.ship_config.ship_speed_knots;
    this.expeditionValue = next;
    this.revisionValue += 1;
    this.audit.push(
      speedChanged
        ? `# GUI updated ship_config.ship_speed_knots · revision ${this.revisionValue}`
        : `# GUI updated expedition.yaml · revision ${this.revisionValue}`,
    );
    this.notify();
    return { ok: true };
  }

  applyYamlDraft(source: string): WorkspaceResult {
    try {
      const parsed: unknown = parse(source);
      if (!validateExpedition(parsed)) {
        this.invalidDraftValue = source;
        this.notify();
        return { ok: false, error: "YAML does not match the expedition schema" };
      }
      this.expeditionValue = cloneExpedition(parsed);
      this.invalidDraftValue = null;
      this.revisionValue += 1;
      this.audit.push(`# YAML applied · revision ${this.revisionValue}`);
      this.notify();
      return { ok: true };
    } catch (error) {
      this.invalidDraftValue = source;
      this.notify();
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid YAML",
      };
    }
  }

  restoreValidRevision(): void {
    this.invalidDraftValue = null;
    this.audit.push(`# invalid draft discarded · revision ${this.revisionValue}`);
    this.notify();
  }

  stashInvalidDraft(): string | null {
    const draft = this.invalidDraftValue;
    this.invalidDraftValue = null;
    if (draft) this.audit.push(`# invalid draft stashed · revision ${this.revisionValue}`);
    this.notify();
    return draft;
  }

  reset(initial: DemoExpedition): void {
    this.expeditionValue = cloneExpedition(initial);
    this.invalidDraftValue = null;
    this.revisionValue += 1;
    this.audit.push(`# workspace reinitialised · revision ${this.revisionValue}`);
    this.notify();
  }

  recordActivity(message: string): void {
    this.audit.push(`# ${message}`);
    this.notify();
  }

  exportProject(): string {
    const snapshot: WorkspaceSnapshot = {
      format: "virtualship-demo/v1",
      revision: this.revisionValue,
      yaml: this.yaml,
      audit: [...this.audit],
    };
    return JSON.stringify(snapshot, null, 2);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}
