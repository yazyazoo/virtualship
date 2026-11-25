import type { DemoExpedition, Location } from "../workspace/types";

const EARTH_RADIUS_NM = 3440.065;

function radians(degrees: number): number {
  return degrees * Math.PI / 180;
}

function distanceNm(start: Location, end: Location): number {
  const latitudeDelta = radians(end.latitude - start.latitude);
  const longitudeDelta = radians(end.longitude - start.longitude);
  const startLatitude = radians(start.latitude);
  const endLatitude = radians(end.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.sqrt(haversine));
}

export function missionMetrics(expedition: DemoExpedition): { distanceNm: number; durationLabel: string } {
  const waypoints = expedition.schedule.waypoints;
  const totalDistance = waypoints.slice(1).reduce((sum, waypoint, index) => {
    const previous = waypoints[index];
    return previous ? sum + distanceNm(previous.location, waypoint.location) : sum;
  }, 0);
  const start = Date.parse(waypoints[0]?.time ?? "");
  const end = Date.parse(waypoints.at(-1)?.time ?? "");
  const durationMinutes = Number.isFinite(start) && Number.isFinite(end)
    ? Math.max(0, Math.round((end - start) / 60_000))
    : Math.round(totalDistance / expedition.ship_config.ship_speed_knots * 60);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = String(durationMinutes % 60).padStart(2, "0");
  return { distanceNm: Math.round(totalDistance), durationLabel: `${hours} h ${minutes}` };
}
