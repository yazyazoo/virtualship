import type { DemoWorkspace } from "../workspace/demo-workspace";
import type { Locale } from "../i18n";

export function renderYamlEditor(workspace: DemoWorkspace, locale: Locale = "en"): string {
  const it = locale === "it";
  const source = workspace.invalidDraft ?? workspace.yaml;
  const warning = workspace.guiLocked
    ? `<div class="yaml-warning">${it ? "Bozza non applicata · GUI bloccata finché non viene corretta o archiviata" : "Draft not applied · GUI locked until corrected or stashed"}</div>`
    : `<div class="yaml-valid">${it ? "Revisione" : "Revision"} ${workspace.revisionId} · ${it ? "valida" : "valid"}</div>`;
  return `${warning}<textarea class="yaml-source" spellcheck="false" aria-label="expedition.yaml">${source.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</textarea><div class="yaml-actions"><button data-yaml-apply>${it ? "Applica YAML" : "Apply YAML"}</button><button data-yaml-stash>${it ? "Archivia bozza" : "Stash draft"}</button></div>`;
}
