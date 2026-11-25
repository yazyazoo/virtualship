import { type Locale, t } from "./i18n";
import "./components/briefing";
import type { MissionBriefing } from "./components/briefing";
import "./components/debrief";
import type { MissionDebrief } from "./components/debrief";
import { DEMO_EXPEDITION } from "./demo/expedition";
import { MISSION_DATASET } from "./demo/mission-dataset";
import "./lab/lab-preview";
import type { LabPreview } from "./lab/lab-preview";
import "./map/operational-map";
import type { OperationalMap } from "./map/operational-map";
import { initialInteractiveMission, transitionMission, type InteractiveMissionState, type MissionAction, type ShipSection } from "./mission/mission-machine";
import { missionMetrics } from "./mission/route-metrics";
import { evaluateStation, type StationEvaluation } from "./mission/rules";
import "./sidebar/developer-sidebar";
import type { DeveloperSidebar } from "./sidebar/developer-sidebar";
import "./ship/ship-cutaway";
import type { ShipCutaway } from "./ship/ship-cutaway";
import { DemoWorkspace } from "./workspace/demo-workspace";

type AppMode = "academy" | "lab";
type DemoStage = "briefing" | "planning" | "debrief";

class VirtualShipDemo extends HTMLElement {
  private locale: Locale = "it";
  private mode: AppMode = "academy";
  private stage: DemoStage = "briefing";
  private readonly workspace = new DemoWorkspace(DEMO_EXPEDITION);
  private missionState: InteractiveMissionState = initialInteractiveMission();

  connectedCallback(): void {
    this.render();
  }

  private render(): void {
    this.setAttribute("data-stage", this.stage);
    const modeName = this.mode === "academy" ? t(this.locale, "mode.academy") : t(this.locale, "mode.lab");
    const stationEvaluation = this.currentStationEvaluation();
    this.innerHTML = `
      <div class="app-frame">
        <header class="topbar">
          <div class="brand-lockup" aria-label="VirtualShip Academy">
            <div class="brand-mark" aria-hidden="true">
              <span class="brand-wave brand-wave-a"></span>
              <span class="brand-wave brand-wave-b"></span>
              <span class="brand-vessel"></span>
            </div>
            <div>
              <p class="eyebrow">OceanParcels · Utrecht University</p>
              <h1>${t(this.locale, "app.title")}</h1>
              <p class="brand-subtitle">${t(this.locale, "app.subtitle")}</p>
            </div>
          </div>

          <nav class="mode-switch" aria-label="${t(this.locale, "app.modeLabel")}">
            ${this.modeButton("academy")}
            ${this.modeButton("lab")}
          </nav>

          <div class="language-switch" aria-label="${t(this.locale, "language.label")}">
            ${this.localeButton("it")}
            ${this.localeButton("en")}
          </div>
        </header>

        <main class="app-main" data-screen="${this.mode}">
          ${this.mode === "academy" ? this.academyView() : this.labView()}
        </main>

        <footer class="statusbar">
          <span><span class="status-dot status-dot-amber"></span>${t(this.locale, "status.prototype")}</span>
          <span>${t(this.locale, "status.mode")}: ${modeName}</span>
          <span>v0.1 · DEMO</span>
        </footer>
      </div>
    `;
    const sidebar = this.querySelector<DeveloperSidebar>("vs-developer-sidebar");
    if (sidebar) { sidebar.locale = this.locale; sidebar.mission = this.missionState; sidebar.workspace = this.workspace; }
    const map = this.querySelector<OperationalMap>("vs-operational-map");
    if (map) { map.locale = this.locale; map.phase = this.missionState.phase; map.workspace = this.workspace; }
    const ship = this.querySelector<ShipCutaway>("vs-ship-cutaway");
    if (ship) {
      ship.locale = this.locale;
      ship.phase = this.missionState.phase;
      ship.selectedSections = this.missionState.inspectedSections;
      ship.stationEvaluation = stationEvaluation;
    }
    const lab = this.querySelector<LabPreview>("vs-lab-preview");
    if (lab) lab.locale = this.locale;
    const briefing = this.querySelector<MissionBriefing>("vs-mission-briefing");
    if (briefing) briefing.locale = this.locale;
    const debrief = this.querySelector<MissionDebrief>("vs-mission-debrief");
    if (debrief) debrief.locale = this.locale;
    this.bindControls();
  }

  private modeButton(mode: AppMode): string {
    const key = mode === "academy" ? "mode.academy" : "mode.lab";
    return `<button class="segmented-button" data-mode="${mode}" aria-pressed="${this.mode === mode}">${t(this.locale, key)}</button>`;
  }

  private localeButton(locale: Locale): string {
    return `<button class="locale-button" data-locale="${locale}" aria-pressed="${this.locale === locale}">${locale.toUpperCase()}</button>`;
  }

  private bindControls(): void {
    this.querySelectorAll<HTMLButtonElement>("button[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        this.mode = button.dataset.mode as AppMode;
        this.render();
      });
    });
    this.querySelectorAll<HTMLButtonElement>("button[data-locale]").forEach((button) => {
      button.addEventListener("click", () => {
        this.locale = button.dataset.locale as Locale;
        document.documentElement.lang = this.locale;
        this.render();
      });
    });
    this.querySelector("vs-developer-sidebar")?.addEventListener("run-mission", () => this.applyMissionAction({ type: "depart" }));
    this.querySelector("vs-developer-sidebar")?.addEventListener("mission-action", (event) => {
      const action = (event as CustomEvent<{ action: "depart" | "operate" | "undo" | "reset" | "toggle-tutor" }>).detail.action;
      this.applyMissionAction({ type: action });
    });
    this.querySelector("vs-developer-sidebar")?.addEventListener("workspace-updated", () => {
      this.syncStationSafety();
      this.render();
    });
    this.querySelector("vs-operational-map")?.addEventListener("station-evaluated", () => {
      this.syncStationSafety();
      this.render();
    });
    this.querySelector("vs-ship-cutaway")?.addEventListener("ship-section-selected", (event) => {
      const section = (event as CustomEvent<{ section: ShipSection }>).detail.section;
      this.applyMissionAction({ type: "inspect", section });
    });
    this.querySelector("vs-mission-briefing")?.addEventListener("start-planning", () => {
      this.stage = "planning";
      this.render();
      this.focusPlanningControl();
    });
    this.querySelector("vs-mission-debrief")?.addEventListener("replay-mission", () => {
      this.stage = "planning";
      this.missionState = initialInteractiveMission();
      this.workspace.reset(DEMO_EXPEDITION);
      this.render();
      this.focusPlanningControl();
    });
  }

  private focusPlanningControl(): void {
    queueMicrotask(() => this.querySelector<HTMLButtonElement>("[data-recommend-station]")?.focus());
  }

  private applyMissionAction(action: MissionAction): void {
    if (action.type === "depart") this.syncStationSafety();
    this.missionState = transitionMission(this.missionState, action);
    if (this.missionState.phase === "completed") this.stage = "debrief";
    if (action.type === "reset") {
      this.stage = "planning";
      this.workspace.reset(DEMO_EXPEDITION);
    }
    this.render();
  }

  private syncStationSafety(): void {
    const evaluation = this.currentStationEvaluation();
    this.missionState = transitionMission(this.missionState, {
      type: "set-station-safety",
      safe: !this.workspace.guiLocked && Boolean(evaluation?.safe),
    });
  }

  private currentStationEvaluation(): StationEvaluation | null {
    const station = this.workspace.expedition.schedule.waypoints[1]?.location;
    return station
      ? evaluateStation(
          station.longitude,
          station.latitude,
          MISSION_DATASET.bathymetry,
          MISSION_DATASET.targetDepthM,
          MISSION_DATASET.safetyClearanceM,
        )
      : null;
  }

  private academyView(): string {
    const metrics = missionMetrics(this.workspace.expedition);
    return `
      <section class="mission-ribbon" aria-label="${t(this.locale, "mission.statusLabel")}">
        <div>
          <p class="eyebrow">${t(this.locale, "mission.kicker")}</p>
          <h2>${t(this.locale, "mission.title")}</h2>
        </div>
        <div class="mission-meta"><span>${t(this.locale, "mission.level")}</span><strong>CTD · T/S</strong></div>
        <div class="mission-metrics" aria-label="${t(this.locale, "mission.metricsLabel")}">
          <span><small>${t(this.locale, "metric.route")}</small><strong>${metrics.distanceNm} nm</strong></span>
          <span><small>${t(this.locale, "metric.eta")}</small><strong>${metrics.durationLabel}</strong></span>
          <span><small>${t(this.locale, "metric.stations")}</small><strong>01 / 01</strong></span>
          <span><small>${t(this.locale, "metric.sea")}</small><strong>${t(this.locale, "metric.calm")}</strong></span>
        </div>
      </section>

      <section class="operations-grid">
        <vs-operational-map></vs-operational-map>

        <vs-developer-sidebar class="developer-drawer" aria-label="${t(this.locale, "sidebar.label")}"></vs-developer-sidebar>

        <vs-ship-cutaway></vs-ship-cutaway>
      </section>
      ${this.stage === "briefing" ? "<vs-mission-briefing></vs-mission-briefing>" : ""}
      ${this.stage === "debrief" ? "<vs-mission-debrief></vs-mission-debrief>" : ""}
    `;
  }

  private labView(): string {
    return `<vs-lab-preview></vs-lab-preview>`;
  }
}

if (!customElements.get("virtualship-demo")) {
  customElements.define("virtualship-demo", VirtualShipDemo);
}
