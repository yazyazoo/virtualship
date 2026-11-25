import type { BathymetryCell } from "../mission/rules";

export const BATHYMETRY_CONTOUR_LEVELS = [10, 20, 30, 35] as const;

export const BATHYMETRY_DEPTH_BANDS = [
  { minimumM: 0, maximumM: 10, color: "#b7e3de" },
  { minimumM: 10, maximumM: 20, color: "#72c7c7" },
  { minimumM: 20, maximumM: 30, color: "#318da5" },
  { minimumM: 30, maximumM: 35, color: "#176486" },
  { minimumM: 35, maximumM: Number.POSITIVE_INFINITY, color: "#083d67" },
] as const;

export type BathymetryBounds = [[number, number], [number, number]];

interface ContourFeature {
  type: "Feature";
  properties: { depthM: number; label: string };
  geometry: { type: "LineString"; coordinates: [[number, number], [number, number]] };
}

export interface ContourFeatureCollection {
  type: "FeatureCollection";
  features: ContourFeature[];
}

function uniqueSorted(values: readonly number[]): number[] {
  return [...new Set(values)].sort((left, right) => left - right);
}

function halfCellSize(coordinates: readonly number[]): number {
  const spacings = coordinates
    .slice(1)
    .map((coordinate, index) => coordinate - (coordinates[index] ?? coordinate))
    .filter((spacing) => spacing > 0);
  return spacings.length ? Math.min(...spacings) / 2 : 0.05;
}

export function bathymetryBounds(cells: readonly BathymetryCell[]): BathymetryBounds | null {
  if (!cells.length) return null;
  const longitudes = uniqueSorted(cells.map((cell) => cell.longitude));
  const latitudes = uniqueSorted(cells.map((cell) => cell.latitude));
  const minimumLongitude = longitudes[0];
  const maximumLongitude = longitudes.at(-1);
  const minimumLatitude = latitudes[0];
  const maximumLatitude = latitudes.at(-1);
  if (
    minimumLongitude === undefined || maximumLongitude === undefined ||
    minimumLatitude === undefined || maximumLatitude === undefined
  ) return null;
  const longitudeMargin = halfCellSize(longitudes);
  const latitudeMargin = halfCellSize(latitudes);
  return [
    [minimumLongitude - longitudeMargin, minimumLatitude - latitudeMargin],
    [maximumLongitude + longitudeMargin, maximumLatitude + latitudeMargin],
  ];
}

function interpolate(
  first: BathymetryCell,
  second: BathymetryCell,
  level: number,
): [number, number] | null {
  const crosses = (first.depthM < level && second.depthM >= level) ||
    (first.depthM >= level && second.depthM < level);
  if (!crosses || first.depthM === second.depthM) return null;
  const fraction = (level - first.depthM) / (second.depthM - first.depthM);
  return [
    first.longitude + (second.longitude - first.longitude) * fraction,
    first.latitude + (second.latitude - first.latitude) * fraction,
  ];
}

export function bathymetryContours(
  cells: readonly BathymetryCell[],
  levels: readonly number[],
): ContourFeatureCollection {
  const longitudes = uniqueSorted(cells.map((cell) => cell.longitude));
  const latitudes = uniqueSorted(cells.map((cell) => cell.latitude));
  const grid = new Map(cells.map((cell) => [`${cell.longitude}:${cell.latitude}`, cell]));
  const features: ContourFeature[] = [];

  for (const level of levels) {
    for (let latitudeIndex = 0; latitudeIndex < latitudes.length - 1; latitudeIndex += 1) {
      for (let longitudeIndex = 0; longitudeIndex < longitudes.length - 1; longitudeIndex += 1) {
        const west = longitudes[longitudeIndex];
        const east = longitudes[longitudeIndex + 1];
        const south = latitudes[latitudeIndex];
        const north = latitudes[latitudeIndex + 1];
        if (west === undefined || east === undefined || south === undefined || north === undefined) continue;
        const southwest = grid.get(`${west}:${south}`);
        const southeast = grid.get(`${east}:${south}`);
        const northeast = grid.get(`${east}:${north}`);
        const northwest = grid.get(`${west}:${north}`);
        if (!southwest || !southeast || !northeast || !northwest) continue;

        const intersections = [
          interpolate(southwest, southeast, level),
          interpolate(southeast, northeast, level),
          interpolate(northeast, northwest, level),
          interpolate(northwest, southwest, level),
        ].filter((point): point is [number, number] => point !== null);

        for (let index = 0; index + 1 < intersections.length; index += 2) {
          const first = intersections[index];
          const second = intersections[index + 1];
          if (!first || !second) continue;
          features.push({
            type: "Feature",
            properties: { depthM: level, label: `${level} m` },
            geometry: { type: "LineString", coordinates: [first, second] },
          });
        }
      }
    }
  }

  return { type: "FeatureCollection", features };
}
