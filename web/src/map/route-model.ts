import type { DemoExpedition, Location } from "../workspace/types";

export const NORTH_SEA_BOUNDS = {
  west: 3,
  south: 51,
  east: 7,
  north: 55.5,
} as const;

export function isInsideNorthSea(location: Location): boolean {
  return (
    location.longitude >= NORTH_SEA_BOUNDS.west &&
    location.longitude <= NORTH_SEA_BOUNDS.east &&
    location.latitude >= NORTH_SEA_BOUNDS.south &&
    location.latitude <= NORTH_SEA_BOUNDS.north
  );
}

export function toMapCoordinates(location: Location): [number, number] {
  return [location.longitude, location.latitude];
}

export function updateStation(
  expedition: DemoExpedition,
  index: number,
  location: Location,
): DemoExpedition {
  if (!isInsideNorthSea(location)) {
    throw new Error("Station is outside North Sea mission bounds");
  }
  const next = structuredClone(expedition);
  const waypoint = next.schedule.waypoints[index];
  if (!waypoint) throw new Error(`Unknown waypoint ${index}`);
  waypoint.location = { ...location };
  return next;
}
