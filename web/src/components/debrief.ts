import type { Locale } from "../i18n";

const copy = {
  it: {
    kicker: "MISSIONE COMPLETATA · DEBRIEF",
    title: "Decisione · evidenza · conseguenza",
    body: "La stazione scelta ha aggiornato rotta e YAML; la CTD si è fermata a 30 m con margine dal fondale e ha prodotto un profilo Copernicus.",
    action: "Ripeti la missione",
    decision: "DECISIONE", evidence: "EVIDENZA", consequence: "CONSEGUENZA", moved: "NS-01 su fondale idoneo", revision: "Rotta e YAML aggiornati", safe: "Calata CTD sicura · 30 m",
  },
  en: {
    kicker: "MISSION COMPLETE · DEBRIEF",
    title: "Decision · evidence · consequence",
    body: "The selected station updated route and YAML; the CTD stopped at 30 m with seafloor clearance and produced a Copernicus profile.",
    action: "Replay mission",
    decision: "DECISION", evidence: "EVIDENCE", consequence: "CONSEQUENCE", moved: "NS-01 over suitable depth", revision: "Route and YAML updated", safe: "Safe CTD cast · 30 m",
  },
} as const;

export class MissionDebrief extends HTMLElement {
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
    this.innerHTML = `<div class="flow-backdrop"><section class="flow-card debrief-card" role="dialog" aria-modal="true" aria-labelledby="debrief-title"><p class="panel-kicker">${text.kicker}</p><h2 id="debrief-title">${text.title}</h2><p>${text.body}</p><div class="debrief-grid"><span><small>${text.decision}</small>${text.moved}</span><span><small>${text.evidence}</small>${text.revision}</span><span><small>${text.consequence}</small>${text.safe}</span></div><button class="primary-button" data-replay-mission>${text.action}</button></section></div>`;
    const action = this.querySelector<HTMLButtonElement>("[data-replay-mission]");
    action?.addEventListener("click", () =>
      this.dispatchEvent(new CustomEvent("replay-mission", { bubbles: true })),
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

if (!customElements.get("vs-mission-debrief")) customElements.define("vs-mission-debrief", MissionDebrief);
