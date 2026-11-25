import type { DemoWorkspace } from "../workspace/demo-workspace";
import { type Locale, t } from "../i18n";
import { canDepart, type InteractiveMissionState } from "../mission/mission-machine";
import { executeControlledCommand } from "./controlled-terminal";
import { type DemoFileName, renderFileExplorer } from "./file-explorer";
import { renderYamlEditor } from "./yaml-editor";

type SidebarTab = "tutor" | "terminal" | "yaml" | "files";

export interface DeveloperSidebarSession {
  tab: SidebarTab;
  terminalLines: string[];
  openFile: DemoFileName | null;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export class DeveloperSidebar extends HTMLElement {
  private workspaceValue: DemoWorkspace | null = null;
  private tab: SidebarTab = "tutor";
  private localeValue: Locale = "it";
  private missionValue: InteractiveMissionState | null = null;
  private terminalLines: string[] = [];
  private openFile: DemoFileName | null = null;
  private unsubscribe?: () => void;

  set locale(value: Locale) { this.localeValue = value; this.render(); }
  set mission(value: InteractiveMissionState) { this.missionValue = value; this.render(); }

  get sessionState(): DeveloperSidebarSession {
    return {
      tab: this.tab,
      terminalLines: [...this.terminalLines],
      openFile: this.openFile,
    };
  }

  set sessionState(value: DeveloperSidebarSession) {
    this.tab = value.tab;
    this.terminalLines = [...value.terminalLines];
    this.openFile = value.openFile;
    this.render();
  }

  set workspace(value: DemoWorkspace) {
    this.unsubscribe?.();
    this.workspaceValue = value;
    if (!this.missionValue && this.tab === "tutor") this.tab = "terminal";
    this.unsubscribe = value.subscribe(() => this.render());
    this.render();
  }

  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
  }

  private render(): void {
    if (!this.workspaceValue) return;
    const tutor = this.localeValue === "it" ? "Tutor" : "Tutor";
    this.innerHTML = `<div class="drawer-tabs" role="tablist">${this.tabButton("tutor", tutor)}${this.tabButton("terminal", t(this.localeValue, "sidebar.terminal"))}${this.tabButton("yaml", t(this.localeValue, "sidebar.yaml"))}${this.tabButton("files", t(this.localeValue, "sidebar.files"))}</div><div class="drawer-live-content">${this.content()}</div>`;
    this.bind();
  }

  private tabButton(tab: SidebarTab, label: string): string {
    return `<button role="tab" data-sidebar-tab="${tab}" aria-selected="${this.tab === tab}">${label}</button>`;
  }

  private content(): string {
    if (!this.workspaceValue) return "";
    if (this.tab === "tutor") return this.tutorContent();
    if (this.tab === "yaml") {
      const editor = renderYamlEditor(this.workspaceValue, this.localeValue);
      return this.missionValue && this.missionValue.phase !== "planning"
        ? editor.replace("<textarea", "<textarea readonly").replace("data-yaml-apply", "data-yaml-apply disabled")
        : editor;
    }
    if (this.tab === "files") return renderFileExplorer(this.workspaceValue, this.localeValue, this.openFile);
    const intro = this.localeValue === "it"
      ? ["Console controllata VirtualShip Academy", "Digita help per elencare i comandi sicuri."]
      : ["VirtualShip Academy controlled console", "Type help to list safe commands."];
    const transcript = [...intro, ...this.terminalLines, ...this.workspaceValue.audit];
    return `<div class="terminal-preview">${transcript.map((line) => `<div class="terminal-line">${escapeHtml(line)}</div>`).join("")}<form class="terminal-form"><label class="prompt" for="terminal-input">student@academy:~/north-sea$</label><input id="terminal-input" autocomplete="off" spellcheck="false" /></form></div>`;
  }

  private tutorContent(): string {
    const mission = this.missionValue;
    if (!mission) return "";
    const it = this.localeValue === "it";
    if (!mission.tutorVisible) {
      return `<section class="tutor-panel tutor-paused"><p class="panel-kicker">${it ? "TUTOR IN PAUSA" : "TUTOR PAUSED"}</p><h3>${it ? "Esplora in autonomia" : "Explore independently"}</h3><p>${it ? "Mappa, nave, YAML e terminale restano disponibili. Puoi riattivare l’assistenza in qualsiasi momento." : "Map, vessel, YAML and terminal remain available. You can restore guidance at any time."}</p><button class="tutor-primary" data-mission-action="toggle-tutor">${it ? "Riattiva tutor" : "Restore tutor"}</button></section>`;
    }
    const phaseCopy = {
      planning: it ? ["Prepara la spedizione", "Porta NS-01 nella zona operativa ≥35 m. Poi ispeziona LABORATORIO CAMPIONI e VERRICELLO sulla nave.", "Salpa verso NS-01"] : ["Prepare the expedition", "Move NS-01 into the ≥35 m operating zone. Then inspect SAMPLE LAB and WINCH aboard.", "Depart for NS-01"],
      underway: it ? ["Navigazione", "La rotta è valida. Ora porta la nave alla stazione oceanografica.", "Arriva a NS-01"] : ["Underway", "The route is valid. Now bring the vessel to the oceanographic station.", "Arrive at NS-01"],
      stationkeeping: it ? ["Mantieni la posizione", "Il ponte stabilizza la nave contro vento e corrente prima della calata.", "Autorizza la calata"] : ["Hold station", "The bridge stabilises the vessel against wind and current before deployment.", "Authorise deployment"],
      lowering: it ? ["Calata CTD", "Il cavo porta la rosetta a 30 m mantenendo il margine di sicurezza dal fondale.", "Raggiungi 30 m"] : ["CTD deployment", "The cable lowers the rosette to 30 m while preserving seafloor clearance.", "Reach 30 m"],
      sampling: it ? ["Campionamento", "Temperatura e salinità costruiscono un profilo verticale della colonna d’acqua.", "Acquisisci il profilo"] : ["Sampling", "Temperature and salinity build a vertical profile of the water column.", "Acquire profile"],
      recovering: it ? ["Recupero", "La squadra recupera la rosetta e trasferisce i dati al laboratorio umido.", "Completa la missione"] : ["Recovery", "The team recovers the rosette and transfers data to the wet lab.", "Complete mission"],
      completed: it ? ["Missione completata", "Hai collegato cartografia, sicurezza operativa, nave, sensori e dati.", "Ricomincia"] : ["Mission complete", "You connected charting, operational safety, vessel, sensors and data.", "Restart"],
    } as const;
    const [title, body, action] = phaseCopy[mission.phase];
    const inspected = mission.inspectedSections;
    const ready = canDepart(mission);
    return `<section class="tutor-panel">
      <div class="tutor-heading"><p class="panel-kicker">${it ? "TUTOR REVERSIBILE" : "REVERSIBLE TUTOR"}</p><h3>${title}</h3></div>
      <p>${body}</p>
      <div class="learning-checks">
        <span class="${mission.stationSafe ? "check-done" : ""}">${mission.stationSafe ? "✓" : "○"} ${it ? "Stazione sicura" : "Safe station"}</span>
        <span class="${inspected.includes("wetlab") ? "check-done" : ""}">${inspected.includes("wetlab") ? "✓" : "○"} ${it ? "Laboratorio campioni ispezionato" : "Sample lab inspected"}</span>
        <span class="${inspected.includes("winch") ? "check-done" : ""}">${inspected.includes("winch") ? "✓" : "○"} ${it ? "Verricello ispezionato" : "Winch inspected"}</span>
      </div>
      <button class="tutor-primary" data-mission-action="${mission.phase === "planning" ? "depart" : mission.phase === "completed" ? "reset" : "operate"}" ${mission.phase === "planning" && !ready ? "disabled" : ""}>${action}</button>
      <button class="tutor-secondary" data-mission-action="undo" ${mission.history.length ? "" : "disabled"}>↶ ${it ? "Annulla ultimo passo" : "Undo last step"}</button>
      <button class="tutor-secondary" data-mission-action="toggle-tutor">${it ? "Nascondi tutor" : "Hide tutor"}</button>
      <details><summary>${it ? "Perché lo facciamo? Cos’è il laboratorio campioni?" : "Why do we do this? What is the sample lab?"}</summary><p>${it ? "Una CTD non deve urtare il fondale: servono 30 m operativi più 5 m di margine. Il laboratorio campioni (wet lab) è l’ambiente lavabile di bordo dove si trattano acqua e campioni appena recuperati, con lavelli, scarichi e strumenti resistenti all’umidità." : "A CTD must not strike the seafloor: the 30 m target needs a 5 m clearance. The sample lab (wet lab) is the washable onboard space where recovered water and samples are processed, with sinks, drains and moisture-resistant instruments."}</p></details>
    </section>`;
  }

  private bind(): void {
    this.querySelectorAll<HTMLButtonElement>("[data-sidebar-tab]").forEach((button) =>
      button.addEventListener("click", () => {
        this.tab = button.dataset.sidebarTab as SidebarTab;
        if (this.tab === "files") this.openFile = null;
        this.render();
      }),
    );
    this.querySelectorAll<HTMLButtonElement>("[data-file-name]").forEach((button) =>
      button.addEventListener("click", () => {
        this.openFile = button.dataset.fileName as DemoFileName;
        this.render();
      }),
    );
    this.querySelector<HTMLButtonElement>("[data-file-back]")?.addEventListener("click", () => {
      this.openFile = null;
      this.render();
    });
    this.querySelector<HTMLFormElement>(".terminal-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = this.querySelector<HTMLInputElement>("#terminal-input");
      if (!input || !this.workspaceValue || !input.value.trim()) return;
      const command = input.value.trim();
      const result = executeControlledCommand(command, this.workspaceValue, this.localeValue);
      this.terminalLines.push(`$ ${command}`, result.output);
      if (result.action === "clear") this.terminalLines = [];
      if (result.action === "run-mission") this.dispatchEvent(new CustomEvent("run-mission", { bubbles: true }));
      if (result.action === "open-planner") this.tab = "yaml";
      input.value = "";
      this.render();
    });
    this.querySelector<HTMLButtonElement>("[data-yaml-apply]")?.addEventListener("click", () => {
      const source = this.querySelector<HTMLTextAreaElement>(".yaml-source")?.value;
      if (source !== undefined) {
        this.workspaceValue?.applyYamlDraft(source);
        this.dispatchEvent(new CustomEvent("workspace-updated", { bubbles: true }));
      }
    });
    this.querySelector<HTMLButtonElement>("[data-yaml-stash]")?.addEventListener("click", () => {
      this.workspaceValue?.stashInvalidDraft();
      this.dispatchEvent(new CustomEvent("workspace-updated", { bubbles: true }));
    });
    this.querySelectorAll<HTMLButtonElement>("[data-mission-action]").forEach((button) => button.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("mission-action", { bubbles: true, detail: { action: button.dataset.missionAction } }));
    }));
  }
}

if (!customElements.get("vs-developer-sidebar")) {
  customElements.define("vs-developer-sidebar", DeveloperSidebar);
}
