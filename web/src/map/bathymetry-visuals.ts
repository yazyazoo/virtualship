import type { BathymetryCell } from "../mission/rules";

export const BATHYMETRY_CONTOUR_LEVELS = [10, 20, 30, 35] as const;

export const BATHYMETRY_DEPTH_BANDS = [
  { minimumM: 0, maximumM: 10, color: "#8fcbd2" },
  { minimumM: 10, maximumM: 20, color: "#b8dce0" },
  { minimumM: 20, maximumM: 30, color: "#d6e9e7" },
  { minimumM: 30, maximumM: 35, color: "#edf1e5" },
  { minimumM: 35, maximumM: Number.POSITIVE_INFINITY, color: "#fff8e8" },
] as const;

export type BathymetryBounds = [[number, number], [number, number]];

interface ContourFeature {
  type: "Feature";
  properties: { depthM: number; label: string };
  geometry: { type: "LineString"; coordinates: [[number, number], [number, number]] };
}

interface LineFeature {
  type: "Feature";
  properties: Record<string, never>;
  geometry: { type: "LineString"; coordinates: [[number, number], [number, number]] };
}

interface SoundingFeature {
  type: "Feature";
  properties: { depthM: number; label: string; safe: boolean };
  geometry: { type: "Point"; coordinates: [number, number] };
}

export interface ContourFeatureCollection {
  type: "FeatureCollection";
  features: ContourFeature[];
}

export interface LineFeatureCollection {
  type: "FeatureCollection";
  features: LineFeature[];
}

export interface SoundingFeatureCollection {
  type: "FeatureCollection";
  features: SoundingFeature[];
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

function pointKey([longitude, latitude]: [number, number]): string {
  return `${longitude.toFixed(6)}:${latitude.toFixed(6)}`;
}

function edgeKey(edge: [[number, number], [number, number]]): string {
  return edge.map(pointKey).sort().join("|");
}

export function bathymetryCoverageBoundary(cells: readonly BathymetryCell[]): LineFeatureCollection {
  if (!cells.length) return { type: "FeatureCollection", features: [] };
  const longitudeMargin = halfCellSize(uniqueSorted(cells.map((cell) => cell.longitude)));
  const latitudeMargin = halfCellSize(uniqueSorted(cells.map((cell) => cell.latitude)));
  const edges = new Map<string, { coordinates: [[number, number], [number, number]]; count: number }>();

  for (const cell of cells) {
    const west = cell.longitude - longitudeMargin;
    const east = cell.longitude + longitudeMargin;
    const south = cell.latitude - latitudeMargin;
    const north = cell.latitude + latitudeMargin;
    const cellEdges: Array<[[number, number], [number, number]]> = [
      [[west, south], [east, south]],
      [[east, south], [east, north]],
      [[east, north], [west, north]],
      [[west, north], [west, south]],
    ];
    for (const coordinates of cellEdges) {
      const key = edgeKey(coordinates);
      const previous = edges.get(key);
      edges.set(key, { coordinates, count: (previous?.count ?? 0) + 1 });
    }
  }

  return {
    type: "FeatureCollection",
    features: [...edges.values()]
      .filter(({ count }) => count === 1)
      .map(({ coordinates }) => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } })),
  };
}

export function bathymetrySoundings(
  cells: readonly BathymetryCell[],
  safeDepthM: number,
  stride = 3,
): SoundingFeatureCollection {
  if (!cells.length) return { type: "FeatureCollection", features: [] };
  const longitudes = uniqueSorted(cells.map((cell) => cell.longitude));
  const latitudes = uniqueSorted(cells.map((cell) => cell.latitude));
  const spacing = Math.max(1, stride);
  const deepest = cells.reduce((current, cell) => cell.depthM > current.depthM ? cell : current);
  const selected = cells.filter((cell) => {
    const longitudeIndex = longitudes.indexOf(cell.longitude);
    const latitudeIndex = latitudes.indexOf(cell.latitude);
    return (longitudeIndex % spacing === 0 && latitudeIndex % spacing === 0) || cell === deepest;
  });
  return {
    type: "FeatureCollection",
    features: selected.map((cell) => ({
        type: "Feature",
        properties: { depthM: cell.depthM, label: cell.depthM.toFixed(1), safe: cell.depthM >= safeDepthM },
        geometry: { type: "Point", coordinates: [cell.longitude, cell.latitude] },
      })),
  };
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
