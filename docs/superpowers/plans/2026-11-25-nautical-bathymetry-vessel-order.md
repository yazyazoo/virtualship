# Nautical bathymetry and vessel order

## Objective

Make the real Copernicus coverage, safe CTD water and vessel layout immediately legible without fabricating data.

## Tasks

1. Add tests for the real cell-union coverage boundary and rejection of gaps outside valid Copernicus cells.
2. Add tests for nautical depth soundings, a visible >=35 m operating zone and the coverage limit.
3. Reorder the vessel from stern to bow: engines, bridge, sample laboratory, CTD winch; explain the wet lab in the tutor.
4. Run focused tests, full tests, type-check, production build and a browser smoke check.

## Design notes

- Preserve the preprocessed Copernicus values. The dataset contains 17 cells meeting the safe operational threshold (depth >=35 m).
- Use chart conventions: selected soundings plus contours, pale depth areas, a stronger safety contour and a distinct data-limit line.
- Treat a waypoint as covered only when it lies inside a real bathymetry cell, not merely inside the dataset bounding rectangle.
