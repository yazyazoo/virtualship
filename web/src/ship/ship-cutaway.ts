import { CTD_PROFILE } from "../demo/ctd-profile";
import type { Locale } from "../i18n";
import type { MissionPhase } from "./mission-timeline";

export class ShipCutaway extends HTMLElement {
  private phaseValue: MissionPhase = "planning";
  private localeValue: Locale = "it";

  set locale(value: Locale) { this.localeValue = value; this.render(); }

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
    const depth = ["lowering", "sampling"].includes(this.phaseValue) ? 42 : 0;
    const sampleCount = this.phaseValue === "planning" || this.phaseValue === "underway" || this.phaseValue === "stationkeeping"
      ? 0
      : this.phaseValue === "lowering" ? 2 : CTD_PROFILE.length;
    const chart = CTD_PROFILE.slice(0, sampleCount).map((sample, index) => `${12 + index * 19},${12 + sample.depthM * 1.45}`).join(" ");
    this.setAttribute("data-samples", String(sampleCount));
    const copy = this.localeValue === "it"
      ? { operations: "OPERAZIONI NAVE", bridge: "PONTE", wet: "LAB UMIDO", winch: "VERRICELLO CTD", engine: "MOTORI", operation: "OPERAZIONE CTD", ready: "Pronta alla stazione NS-03", profile: "Temperatura · profilo di profondità" }
      : { operations: "VESSEL OPERATIONS", bridge: "BRIDGE", wet: "WET LAB", winch: "CTD WINCH", engine: "ENGINE", operation: "CTD OPERATION", ready: "Ready at station NS-03", profile: "Temperature · depth profile" };
    const phaseLabels: Record<MissionPhase, string> = this.localeValue === "it"
      ? { planning: "pianificazione", underway: "in navigazione", stationkeeping: "in stazione", lowering: "calata", sampling: "campionamento", recovering: "recupero", completed: "completata" }
      : { planning: "planning", underway: "underway", stationkeeping: "stationkeeping", lowering: "lowering", sampling: "sampling", recovering: "recovering", completed: "completed" };
    const crewActive = this.phaseValue !== "planning" && this.phaseValue !== "completed";
    this.setAttribute("data-crew-active", String(crewActive));
    this.innerHTML = `<article class="instrument-panel ship-placeholder"><div class="panel-heading"><div><p class="panel-kicker">${copy.operations}</p><h3>RV Virtual Explorer</h3></div><span class="operation-pill">${phaseLabels[this.phaseValue].toUpperCase()}${depth ? ` · ${depth} m` : ""}</span></div><div class="ship-scene"><div class="waterline"></div><div class="ship-hull"><div class="ship-room bridge"><span>${copy.bridge}</span><i class="crew crew-a ${crewActive ? "crew-working" : ""}"></i></div><div class="ship-room wetlab"><span>${copy.wet}</span><i class="crew crew-b ${crewActive ? "crew-working" : ""}"></i></div><div class="ship-room winch"><span>${copy.winch}</span><i class="crew crew-c ${crewActive ? "crew-working" : ""}"></i></div><div class="ship-room engine"><span>${copy.engine}</span><i class="crew crew-d ${crewActive ? "crew-working" : ""}"></i></div></div><div class="ctd-column ${activeCtd ? "ctd-active" : ""}"><div class="ctd-cable"></div><div class="ctd-rosette"></div><span>${depth} m</span></div><div class="science-readout"><small>${copy.operation}</small><strong>${this.phaseValue === "planning" ? copy.ready : phaseLabels[this.phaseValue]}</strong><svg viewBox="0 0 130 86"><polyline points="${chart}" fill="none" stroke="#ffb66e" stroke-width="2"/><line x1="10" y1="74" x2="125" y2="74" stroke="#537a80"/><line x1="10" y1="8" x2="10" y2="74" stroke="#537a80"/></svg><span>${copy.profile}</span></div></div></article>`;
  }
}

if (!customElements.get("vs-ship-cutaway")) customElements.define("vs-ship-cutaway", ShipCutaway);
