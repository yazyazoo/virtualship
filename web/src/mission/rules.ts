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

function axisCoverageMargin(coordinates: readonly number[]): number {
  const unique = [...new Set(coordinates)].sort((left, right) => left - right);
  const spacings = unique.slice(1).map((coordinate, index) => coordinate - (unique[index] ?? coordinate)).filter((spacing) => spacing > 0);
  return spacings.length ? Math.min(...spacings) / 2 : 0.05;
}

export function evaluateStation(
  longitude: number,
  latitude: number,
  cells: readonly BathymetryCell[],
  targetDepthM = 30,
  safetyClearanceM = 5,
): StationEvaluation | null {
  const cell = nearestBathymetry(longitude, latitude, cells);
  if (!cell) return null;
  const longitudeMargin = axisCoverageMargin(cells.map((candidate) => candidate.longitude));
  const latitudeMargin = axisCoverageMargin(cells.map((candidate) => candidate.latitude));
  if (
    Math.abs(longitude - cell.longitude) > longitudeMargin + Number.EPSILON ||
    Math.abs(latitude - cell.latitude) > latitudeMargin + Number.EPSILON
  ) return null;
  const clearanceM = cell.depthM - targetDepthM;
  return {
    safe: clearanceM >= safetyClearanceM,
    seafloorDepthM: cell.depthM,
    clearanceM,
    targetDepthM,
    cell,
  };
}
