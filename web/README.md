# VirtualShip Academy — Erik demo

Interactive browser prototype for discussing the VirtualShip Academy direction with the OceanParcels team. It runs entirely on the local computer: it does not contact Copernicus, Spider, Slurm, or any university service.

## Run locally

Requirements: Node.js 24 or newer and npm.

Install dependencies once with `npm --prefix web install`. Then, from the repository root, the demo starts with one command:

```powershell
npm --prefix web run dev
```

Open `http://127.0.0.1:5173/`. Create the production build with `npm run build`; preview it with `npm run preview`.

## Five-minute presentation

1. Start from the learning briefing and explain the single-workspace idea: GUI → YAML → CLI.
2. Enter the operations room. Move one CTD station east on the chart, then open the YAML tab to show the same change in `expedition.yaml`.
3. Open Terminal and run `virtualship plan .`, followed by `virtualship run .`. The controlled console never invokes the operating-system shell.
4. Watch the vessel cutaway, crew, cable and CTD profile advance through the mission phases; use the debrief to connect decision, evidence and consequence.
5. Switch to Parcels Lab. Explain the future Browser → Gateway → Spider/Slurm contract and point out that this screen is explicitly simulated.

Use the IT/EN selector at any time. The difficulty ladder planned for the product is Triennale, Magistrale, Tesi Parcels and **Flying Dutchman — Master**.

## What is real and what is simulated

- Real in this prototype: shared browser workspace, YAML parsing and recovery, controlled Academy commands, file view, route editing and synchronized revision state.
- Demonstration fixtures: bathymetry drawing, CTD samples, vessel timings and research job details. They are not scientifically validated.
- Not connected: Copernicus, OceanParcels compute, Spider/Slurm, authentication, SSH, credentials or remote job submission.
- The current upstream VirtualShip Python CLI remains unchanged. This demo is a product conversation, not a replacement implementation.

## Verification

```powershell
npm run typecheck
npm test -- --run
npm run build
```
