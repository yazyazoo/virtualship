import type { DemoWorkspace } from "../workspace/demo-workspace";
import { type Locale, t } from "../i18n";
import { executeControlledCommand } from "./controlled-terminal";
import { renderFileExplorer } from "./file-explorer";
import { renderYamlEditor } from "./yaml-editor";

type SidebarTab = "terminal" | "yaml" | "files";

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
  private tab: SidebarTab = "terminal";
  private localeValue: Locale = "it";
  private terminalLines: string[] = [];
  private unsubscribe?: () => void;

  set locale(value: Locale) { this.localeValue = value; this.render(); }

  set workspace(value: DemoWorkspace) {
    this.unsubscribe?.();
    this.workspaceValue = value;
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
    this.innerHTML = `<div class="drawer-tabs" role="tablist">${this.tabButton("terminal", t(this.localeValue, "sidebar.terminal"))}${this.tabButton("yaml", t(this.localeValue, "sidebar.yaml"))}${this.tabButton("files", t(this.localeValue, "sidebar.files"))}</div><div class="drawer-live-content">${this.content()}</div>`;
    this.bind();
  }

  private tabButton(tab: SidebarTab, label: string): string {
    return `<button role="tab" data-sidebar-tab="${tab}" aria-selected="${this.tab === tab}">${label}</button>`;
  }

  private content(): string {
    if (!this.workspaceValue) return "";
    if (this.tab === "yaml") return renderYamlEditor(this.workspaceValue, this.localeValue);
    if (this.tab === "files") return renderFileExplorer();
    const intro = this.localeValue === "it"
      ? ["Console controllata VirtualShip Academy", "Digita help per elencare i comandi sicuri."]
      : ["VirtualShip Academy controlled console", "Type help to list safe commands."];
    const transcript = [...intro, ...this.terminalLines, ...this.workspaceValue.audit];
    return `<div class="terminal-preview">${transcript.map((line) => `<div class="terminal-line">${escapeHtml(line)}</div>`).join("")}<form class="terminal-form"><label class="prompt" for="terminal-input">student@academy:~/north-sea$</label><input id="terminal-input" autocomplete="off" spellcheck="false" /></form></div>`;
  }

  private bind(): void {
    this.querySelectorAll<HTMLButtonElement>("[data-sidebar-tab]").forEach((button) =>
      button.addEventListener("click", () => {
        this.tab = button.dataset.sidebarTab as SidebarTab;
        this.render();
      }),
    );
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
      if (source !== undefined) this.workspaceValue?.applyYamlDraft(source);
    });
    this.querySelector<HTMLButtonElement>("[data-yaml-stash]")?.addEventListener("click", () => this.workspaceValue?.stashInvalidDraft());
  }
}

if (!customElements.get("vs-developer-sidebar")) {
  customElements.define("vs-developer-sidebar", DeveloperSidebar);
}
