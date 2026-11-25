# Game design

**Language:** English · [Italiano](../it/game-design.md)

## Premise

The player is part of the scientific team aboard the **RV Virtual Explorer**. They receive a research objective, prepare the vessel and configuration, choose where and how to sample, conduct operations and defend their decisions in the debrief.

The Academy is a mission-based serious game. The current vertical slice is linear during execution but leaves one central decision to the player: choosing a CTD station compatible with the scientific target and seafloor.

## Core loop

1. **Briefing** — read the question, area, instrument, level and success criteria.
2. **Exploration** — inspect the bathymetric chart, data coverage, route, vessel and configuration.
3. **Planning** — choose the station, check depth and clearance, inspect onboard systems.
4. **Validation** — verify that GUI and YAML represent one coherent configuration.
5. **Transit** — reach the station and prepare stationkeeping.
6. **Operation** — lower the CTD, acquire the profile and recover the rosette.
7. **Debrief** — connect the initial decision to the evidence and operational consequences.
8. **Iteration** — replay, compare or progress to a more autonomous mission.

## Four views, one project

The Academy's defining feature is **controlled bidirectional synchronisation**. Web UI, YAML, terminal and files are not separate demonstrations: they observe and, where authorised, modify the same `DemoWorkspace`, with a shared revision and audit trail.

### GUI

Makes decisions spatial and visible through the chart, waypoint, vessel, compartments, progress and results.

### YAML

Provides the reproducible representation of the expedition. Every valid edit updates the same workspace used by the GUI. An invalid draft locks graphical editing until corrected or stashed, preventing two competing versions of truth.

### Controlled terminal

Exposes a learning-oriented subset of VirtualShip commands (`init`, `plan`, `run`) and simple read operations. It is not an operating-system shell: metacharacters and dangerous commands are rejected.

The **Web UI → terminal** direction is visible because graphical changes immediately update `expedition.yaml`, `cat expedition.yaml` reads the current state and the audit trail records revisions. The **terminal → Web UI** direction is controlled: `virtualship init` reinitialises the project, `virtualship plan` opens the YAML planner and `virtualship run` starts the same mission under the same safety gates. There are no independent “graphical” and “terminal” configurations.

### Files

The Files panel opens `expedition.yaml`, `checkpoint.yaml`, `results/ctd_profiles.json` and `README.md`. The `expedition.yaml` view always reads the current workspace; the other files expose the checkpoint, scientific result and project guidance in a readable form.

## Current mechanics

| Mechanic | Behaviour | Learning purpose |
| --- | --- | --- |
| Draggable waypoint | Updates position, seafloor, route and YAML. | A geographic decision changes the whole project. |
| Bathymetry | Soundings, contours, safe zone and data boundary. | The seafloor is a measurable constraint, not a background. |
| CTD clearance | 30 m target plus 5 m safety margin. | Operating depth is not the same as water depth. |
| Vessel inspection | Clickable sections with descriptions. | Scientific operations depend on systems and people. |
| Reversible tutor | Can be hidden, restored and combined with undo. | Assistance is scaffolding, not a separate mode. |
| Revisioned YAML | Applies, blocks or stashes drafts. | Configuration, validation and error recovery. |
| Web UI–terminal synchronisation | Graphical changes, YAML, commands and files converge on the same versioned workspace. | Equivalence between visual and reproducible representations. |
| Openable files | Shows the current configuration, checkpoint, CTD profile and README. | Reading the artefacts that make a mission verifiable. |
| Mission state | Planning → underway → stationkeeping → lowering → sampling → recovering → completed. | A measurement is an operational sequence, not one click. |
| Debrief | Decision → evidence → consequence. | Reasoning is assessed alongside completion. |

## Success, error and recovery

In Mission 01, departure is available only when:

- the station is inside a valid Copernicus cell;
- the seafloor supports a 30 m cast with 5 m clearance;
- the sample lab and CTD winch have been inspected;
- the YAML workspace is not locked by an invalid draft.

Errors do not create arbitrary game over states. They produce an explained gate, unavailable values or a correction prompt. Undo, the safe-station suggestion and draft stashing provide traceable recovery.

## Assessment

The vertical slice uses **competency gates** and a debrief rather than a numerical score. Future levels may add rubrics for:

- safety and configuration validity;
- suitability of the sampling design;
- resource use and ship time;
- quality of justification;
- uncertainty management;
- reproducibility of project and analysis.

If scoring is introduced, it must remain decomposable into these dimensions and must not reward scientifically unsound shortcuts.

## Accessibility and internationalisation

- Italian and English interface;
- interactive regions implemented as buttons and keyboard controls;
- focus contained within briefing and debrief dialogs;
- tutor can be hidden and restored;
- reduced animation under `prefers-reduced-motion`;
- colours are accompanied by text, values and shapes rather than used as the only signal.
