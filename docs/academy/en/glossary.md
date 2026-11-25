# Glossary

**Language:** English · [Italiano](../it/glossary.md)

## Academy

Web-based teaching environment that uses missions, constraints and feedback to teach VirtualShip expedition design.

## Bathymetry

Representation of seafloor depth and shape. In Mission 01 it derives from the Copernicus `deptho` variable.

## Valid cell

Grid area for which a usable bathymetric value exists. A point inside the dataset's rectangular extent may still be outside coverage if it does not fall within a valid cell.

## Coverage

The set of cells for which the mission has data. It is not the same as the area visible on the basemap.

## CTD

Instrument that measures **Conductivity, Temperature and Depth**. Conductivity is used to derive salinity. A rosette may include additional sensors and water-sampling bottles.

## Seafloor

Depth of the seabed in the cell that covers the station. The UI shows it as a positive value in metres.

## Contour / isobath

Line connecting points of equal depth. Academy contours are derived from the grid and serve a teaching purpose.

## Sample lab / wet lab

Washable shipboard space where freshly recovered water and samples are handled. Its surfaces, drains and instruments are designed for moisture and splashes.

## Seafloor clearance

Difference between seafloor depth and the instrument's target depth. In Mission 01 it must be at least 5 m.

## Mission

Playable unit with a brief, data, objectives, constraints, completion criteria and debrief.

## OceanParcels

Framework for Lagrangian ocean simulations used by upstream VirtualShip for moving instruments and particles.

## Parcels Lab

Planned area for research and compute workflows. In the vertical slice it is a declared mock and submits no real jobs.

## Bridge

The vessel's navigation and control centre. It coordinates route, speed and stationkeeping.

## Provenance

Information needed to reconstruct the origin and transformations of data: provider, product, variables, time, domain, software, parameters and checksums.

## Rosette

Frame lowered by the winch that holds the CTD, sensors and often water-sampling bottles.

## Sounding

Numerical depth value shown on a chart. The Academy selects a subset to preserve readability.

## Serious game

Experience with a role, objectives, rules and feedback, built primarily for learning or training rather than entertainment alone.

## Stationkeeping

Keeping the vessel at the required position during an operation while compensating for wind, waves and current.

## Station

Place and time at which the vessel performs one or more scientific operations.

## CTD winch

System that controls the rosette cable, speed and depth during lowering and recovery.

## Waypoint

Geographic point on a route. A station is a waypoint with associated scientific operations.

## Workspace

Shared project containing the expedition configuration, current revision and audit trail. GUI, YAML and terminal are views of the same workspace.
