# Mission 01 — North Sea CTD Station

**Language:** English · [Italiano](../it/mission-01.md)

## Status

**Implemented and playable** in the browser vertical slice.

## Brief

The RV Virtual Explorer departs from Den Helder. The learner must choose a station in the southern North Sea, verify that the CTD can reach 30 m while retaining 5 m of seafloor clearance, inspect the required systems and complete the full operational sequence.

## Learning objectives

- read an operational bathymetric chart;
- distinguish data coverage from the safety boundary;
- connect waypoint, route, seafloor and YAML;
- recognise the roles of the sample lab and CTD winch;
- understand the phases of an oceanographic station;
- interpret a vertical temperature and salinity profile;
- explain the relationship between decision, evidence and consequence.

## Mission parameters

| Parameter | Value |
| --- | --- |
| ID | `north-sea-mission-01` |
| Observation date | 1 June 2024 |
| Port | Den Helder · 4.74° E, 52.98° N |
| Instrument | CTD rosette · temperature and salinity |
| Target depth | 30 m |
| Minimum clearance | 5 m |
| Minimum acceptable water depth | 35 m |
| Configured vessel speed | 10 kn |
| Slowdown / speedup | 15 min / 15 min |
| Bathymetric coverage | 158 valid cells |
| Bathymetric range | 7.1–39.0 m |
| Safe cells | 17 cells with depth ≥35 m |
| CTD samples | 15 levels between 0.49 and 29.44 m |

## Initial state and suggested solution

| State | Coordinates | Seafloor | Clearance from 30 m | Result |
| --- | --- | --- | --- | --- |
| Initial NS-01 | 4.3333° E, 53.3333° N | 27.5 m | −2.5 m | Unsafe |
| Suggested station | 4.3333° E, 53.6667° N | 36.1 m | +6.1 m | Safe |

The suggested station is a teaching solution, not the only safe cell. The chart exposes the operating zone and available values so that learners can make an independent choice.

## Rules

A position can be evaluated only when it lies inside a bathymetric cell that is actually present. Being inside the dataset's overall rectangular extent is not sufficient.

The safety rule is:

```text
seafloor − target_depth ≥ minimum_clearance
```

For this mission:

```text
seafloor − 30 m ≥ 5 m
```

Departure is authorised when:

1. the station is covered and safe;
2. the sample lab has been inspected;
3. the CTD winch has been inspected;
4. no invalid YAML draft is locking the workspace.

## Operational sequence

| Phase | Action | Concept |
| --- | --- | --- |
| Planning | Station selection and inspections | Design and safety |
| Underway | Transit to NS-01 | Route and ship time |
| Stationkeeping | Hold position | Measurement stability |
| Lowering | Lower the rosette | Depth and cable |
| Sampling | Acquire the profile | Water column |
| Recovering | Recover and transfer | Sample integrity |
| Completed | Debrief | Decision, evidence, consequence |

## Interface elements

### Chart

- OpenStreetMap geographic base;
- preprocessed Copernicus bathymetric cells;
- 10, 20, 30 and 35 m contours;
- soundings selected for readability;
- boundary of available cells;
- operating zone ≥35 m;
- Den Helder → NS-01 → Den Helder route;
- draggable and keyboard-accessible waypoint.

### Vessel

- **Engines** — propulsion and electrical generation;
- **Bridge** — navigation, route and stationkeeping;
- **Sample lab / wet lab** — washable space for processing recovered water and samples;
- **CTD winch** — control of rosette cable and depth.

### Workspace

Map, YAML, terminal and file panel observe the same expedition. A valid edit increments the revision; an invalid YAML draft is retained but not applied.

## Data

The mission uses authenticated, preprocessed Copernicus subsets. The browser performs no live download or ocean-model computation. Details are available in [Scientific integrity and provenance](scientific-integrity.md).

## Vertical-slice limitations

- one scientific station and one instrument;
- route and operational phases represented with a simplified teaching model;
- no real drift during stationkeeping;
- no OceanParcels or HPC job;
- controlled terminal rather than a real shell;
- profile and bathymetry are a versioned snapshot, not a current forecast;
- the chart is not intended for real navigation.

## Learning acceptance criterion

The mission succeeds when the learner can explain not only **where** NS-01 was moved, but **why** the new water depth supports 30 m sampling with 5 m clearance, and where that decision appears in YAML.
