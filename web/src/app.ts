import { type Locale, t } from "./i18n";
import "./components/briefing";
import type { MissionBriefing } from "./components/briefing";
import "./components/debrief";
import type { MissionDebrief } from "./components/debrief";
import { DEMO_EXPEDITION } from "./demo/expedition";
import "./lab/lab-preview";
import type { LabPreview } from "./lab/lab-preview";
import "./map/operational-map";
import type { OperationalMap } from "./map/operational-map";
import "./sidebar/developer-sidebar";
import type { DeveloperSidebar } from "./sidebar/developer-sidebar";
import "./ship/ship-cutaway";
import type { ShipCutaway } from "./ship/ship-cutaway";
import { advanceMission, initialMissionState, type MissionState } from "./ship/mission-timeline";
import { DemoWorkspace } from "./workspace/demo-workspace";

type AppMode = "academy" | "lab";
type DemoStage = "briefing" | "planning" | "debrief";

class VirtualShipDemo extends HTMLElement {
  private locale: Locale = "it";
  private mode: AppMode = "academy";
  private stage: DemoStage = "briefing";
  private readonly workspace = new DemoWorkspace(DEMO_EXPEDITION);
  private missionState: MissionState = initialMissionState();
  private missionTimer?: number;

  connectedCallback(): void {
    this.render();
  }

  private render(): void {
    this.setAttribute("data-stage", this.stage);
    const modeName = this.mode === "academy" ? t(this.locale, "mode.academy") : t(this.locale, "mode.lab");
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
    if (sidebar) { sidebar.locale = this.locale; sidebar.workspace = this.workspace; }
    const map = this.querySelector<OperationalMap>("vs-operational-map");
    if (map) { map.locale = this.locale; map.phase = this.missionState.phase; map.workspace = this.workspace; }
    const ship = this.querySelector<ShipCutaway>("vs-ship-cutaway");
    if (ship) { ship.locale = this.locale; ship.phase = this.missionState.phase; }
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
    this.querySelector("vs-developer-sidebar")?.addEventListener("run-mission", () => this.startMission());
    this.querySelector("vs-mission-briefing")?.addEventListener("start-planning", () => {
      this.stage = "planning";
      this.render();
      this.focusPlanningControl();
    });
    this.querySelector("vs-mission-debrief")?.addEventListener("replay-mission", () => {
      this.stage = "planning";
      this.missionState = initialMissionState();
      this.render();
      this.focusPlanningControl();
    });
  }

  private focusPlanningControl(): void {
    queueMicrotask(() => this.querySelector<HTMLButtonElement>("[data-move-station]")?.focus());
  }

  private startMission(): void {
    if (this.missionTimer) window.clearTimeout(this.missionTimer);
    this.missionState = initialMissionState();
    const tick = (): void => {
      this.missionState = advanceMission(this.missionState);
      const ship = this.querySelector<ShipCutaway>("vs-ship-cutaway");
      if (ship) ship.phase = this.missionState.phase;
      const map = this.querySelector<OperationalMap>("vs-operational-map");
      if (map) map.phase = this.missionState.phase;
      if (this.missionState.phase !== "completed") {
        this.missionTimer = window.setTimeout(tick, 850);
      } else {
        this.stage = "debrief";
        this.render();
      }
    };
    tick();
  }

  private academyView(): string {
    return `
      <section class="mission-ribbon" aria-label="${t(this.locale, "mission.statusLabel")}">
        <div>
          <p class="eyebrow">${t(this.locale, "mission.kicker")}</p>
          <h2>${t(this.locale, "mission.title")}</h2>
        </div>
        <div class="mission-meta"><span>${t(this.locale, "mission.level")}</span><strong>CTD · T/S</strong></div>
        <div class="mission-metrics" aria-label="${t(this.locale, "mission.metricsLabel")}">
          <span><small>${t(this.locale, "metric.route")}</small><strong>184 nm</strong></span>
          <span><small>${t(this.locale, "metric.eta")}</small><strong>18 h 42</strong></span>
          <span><small>${t(this.locale, "metric.stations")}</small><strong>03 / 05</strong></span>
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
