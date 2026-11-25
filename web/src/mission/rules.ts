export interface BathymetryCell {
  longitude: number;
  latitude: number;
  depthM: number;
}

export interface StationEvaluation {
  safe: boolean;
  seafloorDepthM: number;
  clearanceM: number;
  targetDepthM: number;
  cell: BathymetryCell;
}

export function nearestBathymetry(
  longitude: number,
  latitude: number,
  cells: readonly BathymetryCell[],
): BathymetryCell | undefined {
  return cells.reduce<BathymetryCell | undefined>((nearest, cell) => {
    if (!nearest) return cell;
    const distance = (cell.longitude - longitude) ** 2 + (cell.latitude - latitude) ** 2;
    const nearestDistance = (nearest.longitude - longitude) ** 2 + (nearest.latitude - latitude) ** 2;
    return distance < nearestDistance ? cell : nearest;
  }, undefined);
}

function withinAxisCoverage(value: number, coordinates: readonly number[]): boolean {
  const unique = [...new Set(coordinates)].sort((left, right) => left - right);
  const first = unique[0];
  const last = unique.at(-1);
  if (first === undefined || last === undefined) return false;
  const spacings = unique.slice(1).map((coordinate, index) => coordinate - (unique[index] ?? coordinate)).filter((spacing) => spacing > 0);
  const margin = spacings.length ? Math.min(...spacings) / 2 : 0.05;
  return value >= first - margin && value <= last + margin;
}

export function evaluateStation(
  longitude: number,
  latitude: number,
  cells: readonly BathymetryCell[],
  targetDepthM = 30,
  safetyClearanceM = 5,
): StationEvaluation | null {
  if (
    !withinAxisCoverage(longitude, cells.map((cell) => cell.longitude)) ||
    !withinAxisCoverage(latitude, cells.map((cell) => cell.latitude))
  ) return null;
  const cell = nearestBathymetry(longitude, latitude, cells);
  if (!cell) return null;
  const clearanceM = cell.depthM - targetDepthM;
  return {
    safe: clearanceM >= safetyClearanceM,
    seafloorDepthM: cell.depthM,
    clearanceM,
    targetDepthM,
    cell,
  };
}
