# Scientific integrity and provenance

**Language:** English · [Italiano](../it/scientific-integrity.md)

## Principle

Every element must state whether it is **observed or modelled by an external source**, **derived locally**, **simulated for teaching purposes** or **planned**. A convincing visualisation must not make simulated content appear real.

## Vertical-slice classification

| Element | Classification | Note |
| --- | --- | --- |
| Mission 01 bathymetry | Real, preprocessed Copernicus data | `deptho` variable from a versioned subset. |
| Temperature/salinity profile | Real, preprocessed Copernicus data | `thetao` and `so` variables for a versioned observation date. |
| Soundings and contours | Derived | Computed in the browser from preprocessed cells. |
| Safe zone ≥35 m | Derived | 30 m target plus 5 m clearance. |
| Waypoint evaluation | Derived | Uses the valid cell that covers the position. |
| Geographic basemap | Mapping service | OpenStreetMap tiles, not scientific bathymetry. |
| Route and metrics | Derived from configuration | Haversine distance; duration from the schedule when available. |
| Vessel phases and animations | Teaching simulation | They are not a dynamic digital twin of the vessel. |
| Academy terminal | Controlled simulation | It does not start real VirtualShip processes. |
| Parcels Lab | Declared mock | No remote job is submitted. |

## Mission 01 provenance

| Field | Value |
| --- | --- |
| Provider | Copernicus Marine Service |
| Bathymetry dataset | `cmems_mod_glo_phy_my_0.083deg_static` |
| Water-column dataset | `cmems_mod_glo_phy_my_0.083deg_P1D-m` |
| Variables | `deptho`, `thetao`, `so` |
| Observation date | `2024-06-01` |
| Processing | Authenticated geographic and temporal subset; no oceanographic computation in the browser |
| Status | `verified-copernicus-subset` |
| Retrieved | `2026-11-25T14:51:51.053587+00:00` |
| Copernicus Marine Toolbox | `2.5.2` |

SHA-256 checksums of the source files used by the pipeline:

```text
north-sea-bathymetry.nc
efe59db6165aad273a0e0c8a4b133ad8232ab744d779d8498c97efb191c8aed8

north-sea-water-column.nc
d6f7df66e5518d4f5a9c5c0cb0f07627c91d0f5976c33d984a3011a6bd2c3123
```

The raw NetCDF files must not be reconstructed from values copied from the UI. The checksums make it possible to verify the inputs used by the authorised pipeline.

## Documented transformations

- selection of the southern North Sea area;
- selection of the observation date;
- removal of invalid or terrestrial cells;
- conversion of depth to positive metres downwards for presentation;
- serialisation of 158 bathymetric cells;
- selection of 15 available CTD levels down to 29.44 m;
- client-side calculation of bands, contours and cell boundaries;
- sparse selection of soundings to avoid overlap.

## Accuracy and proper use

The Academy chart is a teaching representation. It is not an official nautical chart, does not include every hazard and must not be used for navigation, real planning or safety at sea.

The depth assigned to a waypoint represents the dataset cell that covers it. It is not a point measurement of the seafloor and does not imply centimetre accuracy. Resolution, date and product type must accompany every interpretation.

## Editorial rules

Every new mission must document:

1. provider, product, version and variables;
2. date or time interval;
3. geographic domain and resolution;
4. subset and transformation procedure;
5. input checksums or equivalent identifiers;
6. what is computed in the browser;
7. what is simulated for teaching purposes;
8. limitations of use and relevant uncertainty.

Recommended interface labels are:

- **Real, preprocessed data**;
- **Derived from Copernicus data**;
- **Teaching simulation**;
- **Planned / not connected**.

## Credentials and reproducibility

Copernicus credentials are not part of the dataset, metadata or documentation. Reproducibility relies on product identifiers, parameters, timestamps, tool versions and checksums, not on sharing accounts or secrets.
