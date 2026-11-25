import { CTD_PROFILE } from "../demo/ctd-profile";
import type { Locale } from "../i18n";
import { BATHYMETRY_DEPTH_BANDS } from "../map/bathymetry-visuals";
import type { StationEvaluation } from "../mission/rules";
import type { ShipSection } from "../mission/mission-machine";
import type { MissionPhase } from "./mission-timeline";

export class ShipCutaway extends HTMLElement {
  private phaseValue: MissionPhase = "planning";
  private localeValue: Locale = "it";
  private selectedSectionsValue: ShipSection[] = [];
  private stationEvaluationValue: StationEvaluation | null = null;
  private controlsLockedValue = false;

  set locale(value: Locale) { this.localeValue = value; this.render(); }
  set selectedSections(value: ShipSection[]) { this.selectedSectionsValue = [...value]; this.render(); }
  set controlsLocked(value: boolean) { this.controlsLockedValue = value; this.render(); }
  set stationEvaluation(value: StationEvaluation | null) {
    this.stationEvaluationValue = value;
    this.render();
  }

  set phase(value: MissionPhase) {
    this.phaseValue = value;
    this.setAttribute("data-phase", value);
    this.render();
  }

  connectedCallback(): void {
    this.setAttribute("data-phase", this.phaseValue);
    this.render();
  }

  private render(): void {
    const activeCtd = ["lowering", "sampling", "recovering"].includes(this.phaseValue);
    const targetDepthM = this.stationEvaluationValue?.targetDepthM ?? 30;
    const depth = ["lowering", "sampling"].includes(this.phaseValue) ? targetDepthM : 0;
    const sampleCount = this.phaseValue === "planning" || this.phaseValue === "underway" || this.phaseValue === "stationkeeping"
      ? 0
      : this.phaseValue === "lowering" ? 2 : CTD_PROFILE.length;
    const chart = CTD_PROFILE.slice(0, sampleCount).map((sample, index) => `${12 + index * 19},${12 + sample.depthM * 1.45}`).join(" ");
    this.setAttribute("data-samples", String(sampleCount));
    this.setAttribute("data-station-safe", this.stationEvaluationValue ? String(this.stationEvaluationValue.safe) : "outside");
    const copy = this.localeValue === "it"
      ? { operations: "OPERAZIONI NAVE · CLICCA LE SEZIONI", bridge: "PLANCIA", wet: "LAB CAMPIONI", winch: "VERRICELLO CTD", engine: "MOTORI", operation: "OPERAZIONE CTD", ready: "Ispeziona nave e pianifica NS-01", profile: "Temperatura · profilo di profondità", target: "Obiettivo", floor: "Fondale", clearance: "Margine", depth: "PROFONDITÀ", safe: "Stazione idonea", unsafe: "Fondale troppo vicino", outside: "Fuori copertura", recommend: "Mostrami una stazione idonea", hint: "Zona operativa ≥35 m", descriptions: { engine: "Propulsione e generazione elettrica di bordo.", bridge: "Navigazione, rotta e mantenimento della posizione.", wetlab: "Tratta acqua e campioni appena recuperati.", winch: "Controlla cavo e profondità della rosetta CTD." } }
      : { operations: "VESSEL OPERATIONS · CLICK SECTIONS", bridge: "BRIDGE", wet: "SAMPLE LAB", winch: "CTD WINCH", engine: "ENGINES", operation: "CTD OPERATION", ready: "Inspect vessel and plan NS-01", profile: "Temperature · depth profile", target: "Target", floor: "Seafloor", clearance: "Clearance", depth: "DEPTH", safe: "Suitable station", unsafe: "Seafloor too close", outside: "Outside coverage", recommend: "Show me a suitable station", hint: "Operating zone ≥35 m", descriptions: { engine: "Propulsion and onboard electrical generation.", bridge: "Navigation, route control and station keeping.", wetlab: "Processes freshly recovered water and samples.", winch: "Controls CTD cable and rosette depth." } };
    const phaseLabels: Record<MissionPhase, string> = this.localeValue === "it"
      ? { planning: "pianificazione", underway: "in navigazione", stationkeeping: "in stazione", lowering: "calata", sampling: "campionamento", recovering: "recupero", completed: "completata" }
      : { planning: "planning", underway: "underway", stationkeeping: "stationkeeping", lowering: "lowering", sampling: "sampling", recovering: "recovering", completed: "completed" };
    const crewActive = this.phaseValue !== "planning" && this.phaseValue !== "completed";
    const floorLabel = this.stationEvaluationValue ? this.stationEvaluationValue.seafloorDepthM.toFixed(1) : "–";
    const clearanceLabel = this.stationEvaluationValue ? this.stationEvaluationValue.clearanceM.toFixed(1).replace("-", "−") : "–";
    const stationTitle = this.stationEvaluationValue?.safe ? copy.safe : this.stationEvaluationValue ? copy.unsafe : copy.outside;
    const floorPosition = this.stationEvaluationValue
      ? Math.min(92, 62 + (this.stationEvaluationValue.seafloorDepthM / 40) * 26)
      : 92;
    this.setAttribute("data-crew-active", String(crewActive));
    const selected = (section: ShipSection) => this.selectedSectionsValue.includes(section);
    const description = (section: ShipSection) => selected(section) ? `<small data-section-description>${copy.descriptions[section]}</small>` : "";
    const room = (section: ShipSection, label: string, crew: string) => `<button type="button" class="ship-room ${section} ${selected(section) ? "ship-room-selected" : ""}" data-ship-section="${section}"><span>${label}</span>${description(section)}<i class="crew ${crew} ${crewActive ? "crew-working" : ""}"></i></button>`;
    const bandLabels = BATHYMETRY_DEPTH_BANDS.map((band) => `<li><i style="--depth-color:${band.color}"></i><span>${Number.isFinite(band.maximumM) ? `${band.minimumM}–${band.maximumM}` : `≥${band.minimumM}`} m</span></li>`).join("");
    this.innerHTML = `
      <article class="instrument-panel ship-placeholder">
        <div class="panel-heading">
          <div><p class="panel-kicker">${copy.operations}</p><h3>RV Virtual Explorer</h3></div>
          <span class="operation-pill">${phaseLabels[this.phaseValue].toUpperCase()}${depth ? ` · ${depth} m` : ""}</span>
        </div>
        <div class="ship-scene">
          <div class="waterline"></div>
          <div class="seafloor-line" style="--floor-position:${floorPosition}%" aria-hidden="true"><span>${floorLabel} m</span></div>
          <div class="ship-assembly">
            <div class="ship-superstructure">
              <i class="ship-mast" aria-hidden="true"></i>
              <button type="button" class="ship-cockpit ${selected("bridge") ? "ship-room-selected" : ""}" data-ship-section="bridge"><span>${copy.bridge}</span><i class="cockpit-windows" aria-hidden="true"></i>${description("bridge")}</button>
              <div class="working-deck" aria-hidden="true"><i class="deck-crane"></i><i class="deck-winch"></i></div>
            </div>
            <div class="ship-hull">
              ${room("engine", copy.engine, "crew-d")}
              ${room("wetlab", copy.wet, "crew-b")}
              ${room("winch", copy.winch, "crew-c")}
            </div>
            <i class="ship-rudder" aria-hidden="true"></i>
            <i class="ship-propeller" aria-hidden="true"></i>
          </div>
          <div class="ctd-column ${activeCtd ? "ctd-active" : ""}"><div class="ctd-cable"></div><div class="ctd-rosette"></div><span>${depth} m</span></div>
          <div class="ship-info-grid">
            <section class="depth-key-card"><small>${copy.depth} · m</small><ul>${bandLabels}</ul></section>
            <section class="station-status-card ${this.stationEvaluationValue?.safe ? "station-safe" : "station-unsafe"}">
              <small>${copy.hint}</small><strong>${stationTitle}</strong>
              <dl class="vessel-station-readout">
                <div><dt>${copy.target}</dt><dd data-vessel-target>${targetDepthM} m</dd></div>
                <div><dt>${copy.floor}</dt><dd data-vessel-floor>${floorLabel} m</dd></div>
                <div><dt>${copy.clearance}</dt><dd data-vessel-clearance>${clearanceLabel} m</dd></div>
              </dl>
              <button data-recommend-station ${this.controlsLockedValue || this.phaseValue !== "planning" ? "disabled" : ""}>${copy.recommend}</button>
            </section>
            <section class="science-readout">
              <small>${copy.operation}</small>
              <strong>${this.phaseValue === "planning" ? copy.ready : phaseLabels[this.phaseValue]}</strong>
              <svg viewBox="0 0 130 86"><polyline points="${chart}" fill="none" stroke="#ffb66e" stroke-width="2"/><line x1="10" y1="74" x2="125" y2="74" stroke="#537a80"/><line x1="10" y1="8" x2="10" y2="74" stroke="#537a80"/></svg>
              <span>${copy.profile}</span>
            </section>
          </div>
        </div>
      </article>`;
    this.querySelectorAll<HTMLButtonElement>("[data-ship-section]").forEach((button) => button.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("ship-section-selected", { bubbles: true, detail: { section: button.dataset.shipSection as ShipSection } }));
    }));
    this.querySelector<HTMLButtonElement>("[data-recommend-station]")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("recommend-station", { bubbles: true }));
    });
  }
}

if (!customElements.get("vs-ship-cutaway")) customElements.define("vs-ship-cutaway", ShipCutaway);
