# Readable chart and compact vessel design

## Intent

Make bathymetry readable at a glance and use the vessel strip as a compact operational dashboard.

## Design

- The map contains only geographic content, waypoint, route, contours, coverage and sparse depth soundings. No floating legend or station card obscures it.
- Soundings are fewer, larger, dark and unshadowed on opaque pale depth bands.
- The bridge moves from the hull to a clickable cockpit in the superstructure. The hull retains engines, sample lab and CTD winch.
- The shortened vessel shares the strip with exactly three compact cards: vertical sea-depth legend, station/seafloor status, CTD operation.
- Every vessel section reveals a concise academic description after selection.
- The safe-station action moves with the station card and remains connected to the map/workspace.

## Constraints

- Preserve real preprocessed Copernicus values and mission behavior.
- Preserve Italian and English copy, keyboard focus, YAML locking and reversible mission state.
- Work only in the existing `demo` branch and repository.

## Approach

Use existing web components and custom events. The ship emits a recommendation request; the app delegates it to the operational map, keeping geographic mutation in the map component while moving presentation into the vessel strip.
