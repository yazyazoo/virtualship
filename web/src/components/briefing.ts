import type { Locale } from "../i18n";

const copy = {
  it: {
    kicker: "BRIEFING DIDATTICO · MISSIONE 01",
    title: "Pianifica una stazione CTD nel Mare del Nord",
    body: "Scegli la stazione, controlla fondale e rotta, poi osserva come ogni decisione diventa una configurazione scientifica riproducibile.",
    bridge: "GUI → YAML → CLI",
    bridgeBody: "Tre viste dello stesso progetto: l’interfaccia guida, lo YAML documenta, la console rende trasparente ciò che avviene.",
    action: "Entra nella sala operativa",
    area: "AREA", instrument: "STRUMENTO", level: "LIVELLO", sea: "Mare del Nord meridionale", degree: "Triennale · facile",
  },
  en: {
    kicker: "LEARNING BRIEF · MISSION 01",
    title: "Plan a North Sea CTD station",
    body: "Choose the station, check bathymetry and route, then see every decision become a reproducible scientific configuration.",
    bridge: "GUI → YAML → CLI",
    bridgeBody: "Three views of one project: the interface guides, YAML documents, and the console makes each action visible.",
    action: "Enter operations room",
    area: "AREA", instrument: "INSTRUMENT", level: "LEVEL", sea: "Southern North Sea", degree: "Bachelor · easy",
  },
} as const;

export class MissionBriefing extends HTMLElement {
  private localeValue: Locale = "it";

  set locale(value: Locale) {
    this.localeValue = value;
    this.render();
  }

  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {
    this.setBackgroundInert(false);
  }

  private render(): void {
    const text = copy[this.localeValue];
    this.innerHTML = `<div class="flow-backdrop"><section class="flow-card briefing-card" role="dialog" aria-modal="true" aria-labelledby="briefing-title"><p class="panel-kicker">${text.kicker}</p><h2 id="briefing-title">${text.title}</h2><p>${text.body}</p><div class="learning-bridge"><strong>${text.bridge}</strong><span>${text.bridgeBody}</span></div><div class="briefing-facts"><span><small>${text.area}</small>${text.sea}</span><span><small>${text.instrument}</small>CTD rosette</span><span><small>${text.level}</small>${text.degree}</span></div><button class="primary-button" data-start-planning>${text.action}</button></section></div>`;
    const action = this.querySelector<HTMLButtonElement>("[data-start-planning]");
    action?.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("start-planning", { bubbles: true })),
    );
    this.querySelector(".flow-backdrop")?.addEventListener("keydown", (event) => {
      if ((event as KeyboardEvent).key === "Tab") {
        event.preventDefault();
        action?.focus();
      }
    });
    this.setBackgroundInert(true);
    queueMicrotask(() => action?.focus());
  }

  private setBackgroundInert(value: boolean): void {
    const root = this.closest("virtualship-demo");
    root?.querySelectorAll<HTMLElement>(".topbar, .statusbar, .mission-ribbon, .operations-grid").forEach((element) => {
      if (value) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
    });
  }
}

if (!customElements.get("vs-mission-briefing")) customElements.define("vs-mission-briefing", MissionBriefing);
