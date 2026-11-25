# VirtualShip Academy

**Language:** English · [Italiano](../it/index.md)

VirtualShip Academy is the interactive learning environment for VirtualShip. It turns oceanographic expedition design into an **academic serious game**: learners make operational decisions, see those decisions represented in a reproducible configuration, and connect each choice to data, instruments and scientific consequences.

This section documents the Academy and its browser vertical slice. Documentation for the upstream VirtualShip Python simulator remains in the [User Guide](../../user-guide/index.md).

## Product status

| Area | Status | Summary |
| --- | --- | --- |
| Mission 01 · North Sea CTD Station | **Implemented** | Complete briefing-to-debrief cycle using preprocessed Copernicus data. |
| Bachelor level | **Playable vertical slice** | Reversible tutor, map, vessel, YAML, controlled terminal and files. |
| Master's level | **Planned** | Multi-station expeditions, instrument choices and scenario comparison. |
| Parcels Thesis level | **Planned** | Research workflow, OceanParcels, analysis and extended provenance. |
| Flying Dutchman — Master | **Planned** | Capstone missions with incomplete information, incidents and high autonomy. |
| Remote Parcels Lab | **Explicit mock** | The interface exists, but no jobs are submitted to Spider/Slurm. |
| Live Copernicus/Parcels backend in the browser | **Not connected** | The demo uses versioned, preprocessed scientific subsets. |

## Documents

```{toctree}
:maxdepth: 2

vision
game-design
levels
mission-01
architecture
scientific-integrity
operations
roadmap
glossary
```

## Guiding principle

The Academy does not hide the scientific model behind a game metaphor. The graphical interface, `expedition.yaml` and VirtualShip commands are three views of the same project:

> **GUI → YAML → CLI → scientific evidence**

The GUI lowers the entry barrier, YAML makes decisions inspectable and versionable, and the terminal makes operations explicit. As learners progress through the levels, assistance is gradually reduced while scientific responsibility increases.
