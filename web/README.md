# VirtualShip Academy — browser vertical slice

Interactive serious-game prototype for learning how to design an oceanographic expedition. The current mission combines a guided GUI, a shared `expedition.yaml`, a controlled terminal, a vessel cutaway and a Copernicus-derived CTD exercise.

Full product, game, level, science and operations documentation is available in [`docs/academy/`](../docs/academy/index.md).

## Run locally

Requirements: Node.js 24 or newer and npm.

Install dependencies once. Then start the demo from the repository root:

```powershell
npm --prefix web install
npm --prefix web run dev
```

Open `http://127.0.0.1:5173/`.

```powershell
npm --prefix web run typecheck
npm --prefix web run test -- --run
npm --prefix web run build
```

## Five-minute presentation

1. Start from the learning briefing and explain the single-workspace idea: GUI → YAML → CLI.
2. Enter the operations room. Use the bathymetric chart to move NS-01 into the ≥35 m operating zone, then open YAML to show the same change in `expedition.yaml`.
3. Open Terminal and run `virtualship plan .`, followed by `virtualship run .`. The controlled console never invokes the operating-system shell.
4. Inspect the sample lab and CTD winch, then watch vessel, cable and profile advance through the mission phases. Use the debrief to connect decision, evidence and consequence.
5. Switch to Parcels Lab. Explain the future Browser → Gateway → Spider/Slurm contract and point out that this screen is explicitly simulated.

Use the IT/EN selector at any time. The documented progression is **Bachelor**, **Master's**, **Parcels Thesis** and **Flying Dutchman — Master**. Only the introductory Bachelor/Triennale vertical slice is currently implemented; see [Levels and progression](../docs/academy/en/levels.md).

## What is real and what is simulated

- **Real preprocessed scientific data:** the mission dataset contains a verified Copernicus Marine bathymetry subset and temperature/salinity profile with versioned provenance and input checksums.
- **Derived in the browser:** depth bands, isobaths, coverage boundary, safe-water threshold, station evaluation, route metrics and synchronized YAML depth.
- **Pedagogical simulation:** vessel animation, mission timing, controlled terminal execution and debrief flow.
- **Not connected:** live Copernicus downloads, OceanParcels compute, Spider/Slurm, SSH and remote job submission. Parcels Lab is explicitly simulated.
- **Authentication:** the deployed preview uses server-side HTTP Basic authentication; no password or Copernicus credential is bundled in the browser.
- The current upstream VirtualShip Python CLI remains unchanged. This demo is a product conversation, not a replacement implementation.

## Verification

See [Development, verification and deployment](../docs/academy/en/operations.md) for release and VPS procedures.
