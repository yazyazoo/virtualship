import type { Locale } from "../i18n";

export class LabPreview extends HTMLElement {
  private localeValue: Locale = "it";

  set locale(value: Locale) { this.localeValue = value; this.connectedCallback(); }

  connectedCallback(): void {
    const text = this.localeValue === "it"
      ? { mode: "MODALITÀ RICERCA · RISERVATA", intro: "Dalla missione didattica agli esperimenti OceanParcels completi su infrastrutture autorizzate.", pipeline: "PIPELINE DI CALCOLO", browser: "Workspace nel browser", team: "Progettato per il team Parcels", body: "Job tipizzati, dataset controllati e prodotti scientifici ridotti restituiti al browser.", note: "Nessun job viene inviato · nessuna credenziale viene usata · lo stato della coda è illustrativo.", global: "DOMINIO GLOBALE", domain: "DOMINIO", duration: "DURATA", particles: "PARTICELLE", atlantic: "Nord Atlantico", days: "30 giorni" }
      : { mode: "RESEARCH MODE · RESTRICTED", intro: "From an educational mission to full OceanParcels experiments on authorised infrastructure.", pipeline: "COMPUTE PIPELINE", browser: "Browser workspace", team: "Designed for the Parcels team", body: "Typed jobs, controlled datasets and reduced scientific products returned to the browser.", note: "No job is submitted · no credentials are used · queue status is illustrative.", global: "GLOBAL DOMAIN", domain: "DOMAIN", duration: "DURATION", particles: "PARTICLES", atlantic: "North Atlantic", days: "30 days" };
    this.innerHTML = `
      <section class="lab-intro">
        <div><p class="eyebrow">${text.mode}</p><h2>Parcels Lab</h2><p>${text.intro}</p></div>
        <span class="demo-badge">DEMO / SIMULATED</span>
      </section>
      <section class="lab-grid">
        <article class="instrument-panel lab-world"><div class="world-orbit"></div><div class="world-disc"><span>${text.global}</span></div><div class="world-job"><small>${text.domain}</small><strong>${text.atlantic}</strong><small>${text.duration}</small><strong>${text.days}</strong><small>${text.particles}</small><strong>25,000</strong></div></article>
        <article class="instrument-panel lab-pipeline"><p class="panel-kicker">${text.pipeline}</p><div class="pipeline-step"><b>01</b><span>${text.browser}</span></div><div class="pipeline-line"></div><div class="pipeline-step"><b>02</b><span>VirtualShip Gateway</span></div><div class="pipeline-line"></div><div class="pipeline-step"><b>03</b><span>Spider · Slurm · Parcels</span></div></article>
        <article class="instrument-panel lab-note"><h3>${text.team}</h3><p>${text.body}</p><p class="simulation-note">${text.note}</p></article>
      </section>`;
  }
}

if (!customElements.get("vs-lab-preview")) customElements.define("vs-lab-preview", LabPreview);
