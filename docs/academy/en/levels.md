# Levels and progression

**Language:** English · [Italiano](../it/levels.md)

## Progression model

The four levels do not merely mean easy, medium and hard. They change the kind of responsibility assigned to the learner:

| Dimension | Bachelor | Master's | Parcels Thesis | Flying Dutchman — Master |
| --- | --- | --- | --- | --- |
| Role | Guided operator | Expedition lead | Independent researcher | Mission commander under adverse conditions |
| Tutor | Explicit and reversible | On-demand and diagnostic | Minimal, method-centred | No direct solution |
| Dominant interface | GUI bridged to YAML | GUI + YAML | YAML + notebook + CLI | All interfaces with incomplete information |
| Scale | One station, one instrument | Multiple stations and instruments | Reproducible experiment | Complex campaign and linked incidents |
| Data | Curated and preprocessed | Multiple products with variable quality | Research data and simulations | Incomplete data, delays and changing constraints |
| Assessment | Safety and understanding | Design and trade-offs | Method, analysis and provenance | Priorities, resilience and defence of decisions |
| Current status | **Implemented in Mission 01** | Planned | Planned | Planned |

## Level 1 — Bachelor

### Identity

This is the entry level. It introduces expedition language and makes the chain between geographic decision, configuration and onboard operation visible. Learners are not expected to know YAML, terminals or ocean modelling in advance.

### Learning objectives

- recognise port, route, waypoint, station and data coverage;
- read soundings and depth contours;
- distinguish seafloor depth, CTD target and safety clearance;
- identify bridge, engines, sample lab and winch;
- understand why a YAML configuration documents GUI decisions;
- follow the lowering, sampling and recovery sequence correctly;
- interpret a simple vertical temperature and salinity profile.

### Mission structure

Missions introduce one scientific question and one main constraint at a time. Data are curated, coverage is visible, and the tutor provides:

- operational checklists;
- explanations of why each step matters;
- undo;
- a safe-solution suggestion;
- error messages tied directly to the concept being learned.

### Representative mission

**Mission 01 — North Sea CTD Station**: move NS-01 to water at least 35 m deep, inspect the sample lab and winch, conduct a 30 m cast and observe the Copernicus profile.

### Completion criteria

- covered and safe station;
- required systems inspected;
- valid configuration;
- mission completed without seafloor contact;
- debrief read or discussed.

### Evidence for educators

Chosen position, YAML revision, action audit, inspected compartments, phases reached and the learner's ability to explain the difference between 30 m and 35 m.

## Level 2 — Master's

### Identity

The learner becomes responsible for sampling design. They no longer search for one valid answer: they compare scientifically defensible alternatives under constraints of ship time, coverage, weather and computational cost.

### Learning objectives

- translate a hypothesis into a multi-station strategy;
- choose between CTD, XBT, ADCP, drifter, Argo and underway sensors;
- evaluate spatial and temporal resolution;
- balance sampling quality, route duration and resources;
- compare Copernicus products and observation periods;
- recognise bias, gaps, resolution and uncertainty;
- edit YAML intentionally and recover from schema errors.

### Mission structure

- coastal-to-offshore or frontal transects;
- several stations with different priorities;
- instrument and sensor selection;
- time or weather windows;
- ship-hour and compute budgets;
- data with non-uniform quality or coverage;
- final comparison of at least two plans.

The tutor does not identify the correct station. It highlights inconsistencies, asks for justification and offers diagnostic tools. Hints carry visible weight in the learning rubric rather than an arcade penalty.

### Meaningful failures

- sampling insufficient to test the hypothesis;
- a valid route that exceeds available time;
- an instrument unsuitable for the variable or scale;
- safe stations outside useful scientific coverage;
- YAML that is formally valid but methodologically inconsistent.

### Completion criteria

A plan is complete when it is safe, executable, consistent with the hypothesis and accompanied by a short comparative justification. It need not match one predetermined answer.

### Evidence for educators

Scenario comparison, choice rationale, ship time, station distribution, instrument selection, data quality and the final plan revision.

## Level 3 — Parcels Thesis

### Identity

This level bridges the serious game and a research workflow. The mission becomes a reproducible experiment connected to VirtualShip and OceanParcels. The product guides method rather than scientific outcome.

### Learning objectives

- formulate question, hypothesis and analysis plan;
- choose product, domain, period and variables;
- build or adapt versioned VirtualShip configurations;
- understand FieldSet, particles, kernels and Parcels output;
- estimate memory and computational cost;
- submit, monitor and document jobs when a backend becomes available;
- analyse results with reproducible notebooks;
- record software, parameters, checksums, sources and limitations;
- distinguish technical verification, scientific validation and interpretation.

### Mission structure

Missions are open research briefs and may include:

- comparing a virtual experiment with observations;
- drifter or Argo trajectories;
- sensitivity to period, resolution or parameterisation;
- replicates with different seeds or conditions;
- large-output management;
- peer review of configurations and notebooks.

### Interface

YAML, terminal and notebooks become central. The GUI remains an inspection and control tool rather than the only design surface. Remote jobs must expose status, resources, filtered logs and artefacts without exposing credentials.

### Completion criteria

- reproducible repository or project package;
- validated configuration;
- complete provenance;
- analysis executable by another person;
- discussion of uncertainty and limitations;
- conclusions proportionate to the evidence.

### Evidence for educators or supervisors

Commits, configurations, logs, selected output, notebooks, figures, software environment, reproduction README and methodological reflection.

## Level 4 — Flying Dutchman — Master

### Identity

This is the capstone level. “Master” denotes operational and scientific mastery, not an additional academic degree. The player leads a campaign in which information, resources and systems may degrade. Difficulty comes from authentic conflicts between priorities, not hidden commands or punitive randomness.

### Learning objectives

- preserve safety, scientific integrity and traceability under pressure;
- distinguish essential, desirable and expendable objectives;
- revise the plan when weather, instruments, data or time change;
- diagnose linked failures without compromising evidence already collected;
- coordinate scientific, technical and bridge roles;
- document deviations from protocol;
- defend decisions in a structured debrief.

### Mission structure

A campaign may combine:

- partial coverage loss or delayed data products;
- sensor, winch or propulsion failure;
- drift during stationkeeping;
- a closing weather window;
- a failed remote job or incomplete output;
- conflict between two scientific objectives;
- a late request for an additional station;
- an anomaly that may be a real signal or an artefact.

Events must be generated by declared, auditable rules. Randomness must not make a mission impossible without alternatives.

### Tutor and feedback

The tutor does not propose the solution. It exposes documentation, system state, logs and verification tools. Immediate feedback covers safety and formal validity; strategic quality emerges during the debrief.

### Completion criteria

Success does not require preserving every objective. It requires the player to:

- protect people, vessel, instruments and data integrity;
- maintain a plan coherent with remaining resources;
- make trade-offs and protocol deviations explicit;
- preserve a usable provenance chain;
- present a final evidence-based defence.

### Assessment evidence

Event timeline, decision log, configuration revisions, resource use, retained or discarded data, incident report, final justification and reproduction plan.

## Unlocking and adaptation

The recommended progression requires completion of at least one representative mission and demonstration of the previous level's competencies. An educator may assign a level directly, but the Academy should make assumed prerequisites visible.

Adaptation must not lower scientific standards. It may change the amount of support, available time, interface complexity, number of stations and form of submission.
