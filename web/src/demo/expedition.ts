import type { DemoExpedition } from "../workspace/types";

export const DEMO_EXPEDITION: DemoExpedition = {
  instruments_config: {
    ctd_config: {
      max_depth_meter: -42,
      min_depth_meter: -2,
      winch_speed_meter_per_second: 1,
      sensors: ["TEMPERATURE", "SALINITY"],
    },
  },
  schedule: {
    waypoints: [
      {
        location: { latitude: 52.98, longitude: 4.74 },
        time: "2024-06-01T06:00:00Z",
      },
      {
        location: { latitude: 53.32, longitude: 4.35 },
        time: "2024-06-01T10:00:00Z",
        instrument: ["CTD"],
        sea_depth_meter: -32,
      },
      {
        location: { latitude: 52.98, longitude: 4.74 },
        time: "2024-06-01T16:00:00Z",
      },
    ],
  },
  ship_config: {
    ship_speed_knots: 10,
    waypoint_slowdown_time_minutes: 15,
    waypoint_speedup_time_minutes: 15,
  },
};
