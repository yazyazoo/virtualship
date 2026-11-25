import { DEMO_EXPEDITION } from "../demo/expedition";
import type { Locale } from "../i18n";
import type { DemoWorkspace } from "../workspace/demo-workspace";

export interface TerminalResult {
  exitCode: number;
  output: string;
  action?: "open-planner" | "run-mission" | "clear" | "rejected";
}

const unsafe = /[;&|`><]|\brm\b|\bdel\b|\bpowershell\b|\bcmd\b/i;

export function executeControlledCommand(
  input: string,
  workspace: DemoWorkspace,
  locale: Locale = "en",
): TerminalResult {
  const it = locale === "it";
  const command = input.trim().replace(/\s+/g, " ");
  if (unsafe.test(command)) {
    return {
      exitCode: 126,
      action: "rejected",
      output: it ? "Comando rifiutato: Academy espone comandi VirtualShip, non una shell del sistema operativo." : "Command rejected: Academy exposes VirtualShip commands, not an operating-system shell.",
    };
  }
  if (command === "help") {
    return {
      exitCode: 0,
      output: "virtualship init .\nvirtualship plan .\nvirtualship run .\npwd · ls · cat expedition.yaml · clear",
    };
  }
  if (command === "pwd") return { exitCode: 0, output: "/academy/north-sea" };
  if (command === "ls")
    return { exitCode: 0, output: "expedition.yaml  checkpoint.yaml  results/  README.md" };
  if (command === "cat expedition.yaml")
    return { exitCode: 0, output: workspace.yaml };
  if (command === "clear") return { exitCode: 0, output: "", action: "clear" };
  if (/^virtualship init(?: \.)?$/.test(command)) {
    if (workspace.guiLocked)
      return { exitCode: 2, output: it ? "Impossibile inizializzare: correggi o archivia la bozza YAML invalida." : "Cannot initialise: resolve or stash the invalid YAML draft." };
    workspace.reset(DEMO_EXPEDITION);
    return { exitCode: 0, output: it ? "Progetto VirtualShip inizializzato in /academy/north-sea" : "VirtualShip project initialised in /academy/north-sea" };
  }
  if (/^virtualship plan(?: \.)?$/.test(command)) {
    return {
      exitCode: 0,
      action: "open-planner",
      output: it ? "Apro il pianificatore grafico Academy. Il pianificatore Textual originale è disponibile nel CLI Lab." : "Opening the Academy graphical planner. The original Textual planner is available in CLI Lab.",
    };
  }
  if (/^virtualship run(?: \.)?$/.test(command)) {
    if (workspace.guiLocked)
      return { exitCode: 2, output: it ? "Impossibile eseguire: correggi o archivia la bozza YAML invalida." : "Cannot run: resolve or stash the invalid YAML draft." };
    return {
      exitCode: 0,
      action: "run-mission",
      output: it ? "Avvio della missione precompilata (dati demo; nessun calcolo Copernicus/Parcels)." : "Starting precompiled mission (demo data; no Copernicus/Parcels compute).",
    };
  }
  return { exitCode: 127, output: `${command}: ${it ? "comando non disponibile in Academy" : "command not available in Academy"}` };
}
