export interface Location {
  latitude: number;
  longitude: number;
}

export interface ExpeditionWaypoint {
  location: Location;
  time: string;
  instrument?: string[];
  sea_depth_meter?: number | null;
}

export interface DemoExpedition {
  instruments_config: {
    ctd_config: {
      max_depth_meter: number;
      min_depth_meter: number;
      winch_speed_meter_per_second: number;
      sensors: string[];
    };
  };
  schedule: { waypoints: ExpeditionWaypoint[] };
  ship_config: {
    ship_speed_knots: number;
    waypoint_slowdown_time_minutes: number;
    waypoint_speedup_time_minutes: number;
  };
}

export interface WorkspaceResult {
  ok: boolean;
  error?: string;
}

export interface WorkspaceSnapshot {
  format: "virtualship-demo/v1";
  revision: number;
  yaml: string;
  audit: string[];
}
