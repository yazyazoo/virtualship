"""Build the tiny browser mission from authenticated Copernicus Marine data."""

from __future__ import annotations

import hashlib
import json
import math
import os
from datetime import UTC, datetime
from importlib.metadata import version
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = ROOT / "config" / "copernicus.env"
OUTPUT_PATH = ROOT / "web" / "src" / "demo" / "mission-dataset.json"
RAW_DIRECTORY = ROOT / "ZZZ" / "copernicus-raw"

BOUNDS = {"west": 3.9, "south": 52.9, "east": 4.9, "north": 53.7}
DATE = "2024-06-01"
BATHYMETRY_DATASET = "cmems_mod_glo_phy_my_0.083deg_static"
WATER_DATASET = "cmems_mod_glo_phy_my_0.083deg_P1D-m"
TARGET_DEPTH_M = 30
SAFETY_CLEARANCE_M = 5


def load_local_environment(path: Path = CONFIG_PATH) -> None:
    """Load the explicitly requested local env file without logging its values."""
    if not path.exists():
        raise RuntimeError(f"Missing local credential file: {path}")
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ[key.strip()] = value.strip()
    required = (
        "COPERNICUSMARINE_SERVICE_USERNAME",
        "COPERNICUSMARINE_SERVICE_PASSWORD",
    )
    if any(not os.environ.get(key) for key in required):
        raise RuntimeError("Copernicus username or password is empty in config/copernicus.env")


def _coordinate_name(dataset, candidates: tuple[str, ...]) -> str:
    for name in candidates:
        if name in dataset.coords:
            return name
    raise RuntimeError(f"Expected one of the coordinates {candidates}")


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _download_subsets():
    # Import only after load_local_environment(): Toolbox settings read auth
    # environment variables during module initialisation.
    import copernicusmarine

    common = {
        "minimum_longitude": BOUNDS["west"],
        "maximum_longitude": BOUNDS["east"],
        "minimum_latitude": BOUNDS["south"],
        "maximum_latitude": BOUNDS["north"],
        "coordinates_selection_method": "outside",
    }
    bathymetry = copernicusmarine.open_dataset(
        dataset_id=BATHYMETRY_DATASET,
        variables=["deptho"],
        **common,
    ).load()
    water = copernicusmarine.open_dataset(
        dataset_id=WATER_DATASET,
        variables=["thetao", "so"],
        minimum_depth=0,
        maximum_depth=TARGET_DEPTH_M,
        start_datetime=f"{DATE}T00:00:00Z",
        end_datetime=f"{DATE}T23:59:59Z",
        **common,
    ).load()
    return bathymetry, water


def _bathymetry_cells(dataset) -> list[dict[str, float]]:
    lon_name = _coordinate_name(dataset, ("longitude", "lon"))
    lat_name = _coordinate_name(dataset, ("latitude", "lat"))
    field = dataset["deptho"].squeeze(drop=True)
    cells: list[dict[str, float]] = []
    for latitude in dataset[lat_name].values:
        for longitude in dataset[lon_name].values:
            value = float(field.sel({lon_name: longitude, lat_name: latitude}).values)
            if math.isfinite(value) and value > 0:
                cells.append({
                    "longitude": round(float(longitude), 4),
                    "latitude": round(float(latitude), 4),
                    "depthM": round(value, 1),
                })
    if not cells:
        raise RuntimeError("Copernicus returned no wet bathymetry cells for the mission area")
    return cells


def _profile(dataset, station: dict[str, float]) -> list[dict[str, float]]:
    lon_name = _coordinate_name(dataset, ("longitude", "lon"))
    lat_name = _coordinate_name(dataset, ("latitude", "lat"))
    depth_name = _coordinate_name(dataset, ("depth", "elevation"))
    point = dataset.sel(
        {lon_name: station["longitude"], lat_name: station["latitude"]},
        method="nearest",
    )
    if "time" in point.dims:
        point = point.isel(time=0)
    rows: list[dict[str, float]] = []
    for index, raw_depth in enumerate(point[depth_name].values):
        depth = abs(float(raw_depth))
        temperature = float(point["thetao"].isel({depth_name: index}).values)
        salinity = float(point["so"].isel({depth_name: index}).values)
        if depth <= TARGET_DEPTH_M + 0.6 and math.isfinite(temperature) and math.isfinite(salinity):
            rows.append({
                "depthM": round(depth, 2),
                "temperatureC": round(temperature, 3),
                "salinityPsu": round(salinity, 3),
            })
    if len(rows) < 3:
        raise RuntimeError("Copernicus returned an incomplete CTD profile at the selected station")
    return rows


def build_payload(bathymetry, water, raw_checksums: dict[str, str]) -> dict[str, object]:
    """Convert small xarray subsets into the static browser mission contract."""
    cells = _bathymetry_cells(bathymetry)
    suitable = [
        cell
        for cell in cells
        if cell["depthM"] >= TARGET_DEPTH_M + SAFETY_CLEARANCE_M
        and BOUNDS["west"] <= cell["longitude"] <= BOUNDS["east"]
        and BOUNDS["south"] <= cell["latitude"] <= BOUNDS["north"]
    ]
    if not suitable:
        raise RuntimeError("No station in the area satisfies the CTD safety clearance")
    initial = min(cells, key=lambda cell: (cell["longitude"] - 4.35) ** 2 + (cell["latitude"] - 53.32) ** 2)
    recommended = min(
        suitable,
        key=lambda cell: (cell["longitude"] - initial["longitude"]) ** 2
        + (cell["latitude"] - initial["latitude"]) ** 2,
    )
    profile = _profile(water, recommended)
    return {
        "id": "north-sea-mission-01",
        "title": "Southern North Sea CTD",
        "observationDate": DATE,
        "targetDepthM": TARGET_DEPTH_M,
        "safetyClearanceM": SAFETY_CLEARANCE_M,
        "bounds": BOUNDS,
        "source": {
            "provider": "Copernicus Marine Service",
            "bathymetryDataset": BATHYMETRY_DATASET,
            "waterDataset": WATER_DATASET,
            "variables": ["deptho", "thetao", "so"],
            "processing": "Authenticated geographic and temporal subset; browser performs no ocean-model computation.",
            "status": "verified-copernicus-subset",
            "retrievedAt": datetime.now(UTC).isoformat(),
            "toolboxVersion": version("copernicusmarine"),
            "rawChecksumsSha256": raw_checksums,
        },
        "port": {"longitude": 4.74, "latitude": 52.98, "name": "Den Helder"},
        "initialStation": {"longitude": initial["longitude"], "latitude": initial["latitude"]},
        "recommendedStation": {"longitude": recommended["longitude"], "latitude": recommended["latitude"]},
        "bathymetry": cells,
        "ctdProfile": profile,
    }


def main() -> None:
    load_local_environment()
    RAW_DIRECTORY.mkdir(parents=True, exist_ok=True)
    bathymetry, water = _download_subsets()
    bathymetry_path = RAW_DIRECTORY / "north-sea-bathymetry.nc"
    water_path = RAW_DIRECTORY / "north-sea-water-column.nc"
    bathymetry.to_netcdf(bathymetry_path)
    water.to_netcdf(water_path)
    payload = build_payload(
        bathymetry,
        water,
        {bathymetry_path.name: _sha256(bathymetry_path), water_path.name: _sha256(water_path)},
    )
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Mission dataset written to {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
