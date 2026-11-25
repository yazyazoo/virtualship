import { MISSION_DATASET } from "../demo/mission-dataset";
import type { Locale } from "../i18n";
import type { DemoWorkspace } from "../workspace/demo-workspace";

export const DEMO_FILES = [
  ["expedition.yaml", "4.2 KB"],
  ["checkpoint.yaml", "1.1 KB"],
  ["results/ctd_profiles.json", "86 KB"],
  ["README.md", "2.4 KB"],
] as const;

export type DemoFileName = (typeof DEMO_FILES)[number][0];

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function readDemoFile(name: DemoFileName, workspace: DemoWorkspace, locale: Locale): string {
  if (name === "expedition.yaml") return workspace.yaml;
  if (name === "checkpoint.yaml") {
    return `mission:\n  id: ${MISSION_DATASET.id}\n  phase: planning\nworkspace:\n  revision: ${workspace.revisionId}\n  expedition: expedition.yaml\n`;
  }
  if (name === "results/ctd_profiles.json") {
    return JSON.stringify({
      mission_id: MISSION_DATASET.id,
      observation_date: MISSION_DATASET.observationDate,
      source: MISSION_DATASET.source.provider,
      profile: MISSION_DATASET.ctdProfile.map((sample) => ({
        depth_meter: sample.depthM,
        temperature_celsius: sample.temperatureC,
        salinity_psu: sample.salinityPsu,
      })),
    }, null, 2);
  }
  return locale === "it"
    ? "# VirtualShip Academy\n\nProgetto didattico condiviso tra Web UI, YAML, terminale e file.\n\nApri expedition.yaml per leggere la configurazione corrente della spedizione."
    : "# VirtualShip Academy\n\nTeaching project shared by the Web UI, YAML, terminal and files.\n\nOpen expedition.yaml to inspect the current expedition configuration.";
}

export function renderFileExplorer(
  workspace: DemoWorkspace,
  locale: Locale,
  openFile: DemoFileName | null = null,
): string {
  if (openFile) {
    const back = locale === "it" ? "Torna ai file" : "Back to files";
    return `<section class="file-viewer"><header><button data-file-back aria-label="${back}">← ${back}</button><strong>${escapeHtml(openFile)}</strong></header><pre>${escapeHtml(readDemoFile(openFile, workspace, locale))}</pre></section>`;
  }
  return `<div class="file-tree">${DEMO_FILES.map(([name, size]) => `<button class="file-row" data-file-name="${escapeHtml(name)}"><span>${escapeHtml(name)}</span><small>${size}</small></button>`).join("")}</div>`;
}
