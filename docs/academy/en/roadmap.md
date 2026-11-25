# Roadmap

**Language:** English · [Italiano](../it/roadmap.md)

## Principle

Every milestone must produce a teaching increment that can be assessed. Adding screens without a competency, evidence and a completion criterion does not constitute Academy progress.

## Status on 25 November 2026

### Completed — Mission 01 vertical slice

- bilingual briefing and debrief;
- MapLibre chart with a real, preprocessed Copernicus subset;
- actual coverage, contours, soundings and safe-water band;
- synchronised waypoint, route and metrics;
- vessel cutaway with cockpit and descriptions;
- reversible tutor and undo;
- single GUI/YAML/terminal/files workspace;
- validation and recovery of YAML drafts;
- controlled terminal;
- complete mission cycle;
- hardened container build and versioned deployment.

## Milestone A — Consolidate the Bachelor level

### Objective

Turn the vertical slice into a reusable foundation for several introductory missions.

### Work

- mission registry and interface selection;
- documented and validated mission-data schema;
- reproducible pipeline for generating scientific subsets;
- browser smoke test aligned with the current layout;
- WCAG audit for keyboard, contrast and screen readers;
- teacher rubrics and evidence export;
- save and resume sessions;
- at least three missions: CTD, transect and underway instrument;
- explicit handling of online basemap availability.

### Exit criterion

A teacher can assign a mission, a student can complete it without technical assistance, and the result contains interpretable evidence.

## Milestone B — Master's level

### Objective

Support multi-station designs and comparisons between strategies.

### Work

- multiple waypoints and scientific stations;
- instrument and sensor configuration;
- ship-time and compute-cost budgets;
- side-by-side scenario comparison;
- multiple Copernicus products with quality metadata;
- simplified weather and operating windows;
- diagnostic rather than prescriptive tutor;
- rubric for hypotheses, sampling, trade-offs and uncertainty.

### Exit criterion

Two different plans can both be valid, compared and assessed through a traceable scientific justification.

## Milestone C — Gateway and real jobs

### Objective

Connect the interface to authorised executions without transferring secrets to the browser.

### Work

- authenticated API;
- user and role management;
- server-side configuration validation;
- job queue and quotas;
- Spider/Slurm adapter;
- state, filtered logs, cancellation and retry;
- input, output and metadata storage;
- audit and retention policies;
- threat model and security review.

### Exit criterion

A job can be submitted, monitored, reproduced and attributed without exposing Copernicus or HPC credentials.

## Milestone D — Parcels Thesis level

### Objective

Provide a reproducible research workflow from question to result.

### Work

- integration with real VirtualShip and OceanParcels;
- versioned software environments;
- notebooks and analysis templates;
- experiment and replicate management;
- comparison with observations;
- automatic provenance report;
- peer review and teacher supervision;
- export of a complete research package.

### Exit criterion

Another researcher can reconstruct the configuration, environment, job, selected data, analysis and figures.

## Milestone E — Flying Dutchman — Master

### Objective

Assess mastery, resilience and decision quality in complex campaigns.

### Work

- declarative, reproducible event engine;
- failures, delays, weather and priority conflicts;
- team-role and handover management;
- incident and decision logs;
- essential and optional objectives;
- comparative debrief with timeline replay;
- safety, science, resource and provenance rubrics;
- author mode for building verifiable scenarios.

### Exit criterion

The assessment can explain why a strategy was responsible even when some objectives were abandoned.

## Continuing debt and maintenance

- keep documentation, bilingual UI and datasets consistent;
- avoid `latest` dependencies in reproducible releases;
- monitor bundle size and code splitting;
- update smoke tests when the visual architecture changes;
- perform periodic provenance and licence reviews;
- define ownership of missions, data pipelines and infrastructure;
- retain a verified rollback strategy.

## Out of scope until validated

- synchronous multiplayer;
- global leaderboard;
- immersive 3D simulation;
- real navigation;
- unsupervised automatic generation of scientific conclusions.

These features may be explored only if they improve measurable learning outcomes without compromising accessibility, security or scientific integrity.
