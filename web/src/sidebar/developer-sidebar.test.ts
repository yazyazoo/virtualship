import { afterEach, describe, expect, it } from "vitest";

import { DEMO_EXPEDITION } from "../demo/expedition";
import { DemoWorkspace } from "../workspace/demo-workspace";
import "./developer-sidebar";

afterEach(() => document.body.replaceChildren());

function setup(): { sidebar: HTMLElement; workspace: DemoWorkspace } {
  const workspace = new DemoWorkspace(DEMO_EXPEDITION);
  const sidebar = document.createElement("vs-developer-sidebar") as HTMLElement & {
    workspace: DemoWorkspace;
  };
  sidebar.workspace = workspace;
  document.body.append(sidebar);
  return { sidebar, workspace };
}

function submit(sidebar: HTMLElement, command: string): void {
  const input = sidebar.querySelector<HTMLInputElement>("#terminal-input");
  if (!input) throw new Error("terminal input missing");
  input.value = command;
  sidebar.querySelector<HTMLFormElement>(".terminal-form")?.dispatchEvent(
    new Event("submit", { bubbles: true, cancelable: true }),
  );
}

describe("developer sidebar", () => {
  it("renders hostile terminal input as text, not markup", () => {
    const { sidebar } = setup();
    submit(sidebar, '<img src=x onerror="globalThis.pwned=true">');

    expect(sidebar.querySelector("img")).toBeNull();
    expect(sidebar.textContent).toContain("<img src=x");
  });

  it("opens the YAML planner for virtualship plan", () => {
    const { sidebar } = setup();
    submit(sidebar, "virtualship plan .");

    expect(sidebar.querySelector(".yaml-source")).not.toBeNull();
  });

  it("shows GUI workspace changes in the visible transcript", () => {
    const { sidebar, workspace } = setup();
    workspace.applyGuiPatch((expedition) => {
      expedition.ship_config.ship_speed_knots = 8;
    });

    expect(sidebar.textContent).toContain("GUI updated ship_config.ship_speed_knots");
  });

  it("opens every file in the file explorer and returns to the list", () => {
    const { sidebar } = setup();
    sidebar.querySelector<HTMLButtonElement>("[data-sidebar-tab='files']")?.click();

    const expectedFiles = [
      ["expedition.yaml", "ship_config:"],
      ["checkpoint.yaml", "mission:"],
      ["results/ctd_profiles.json", '"depth_meter"'],
      ["README.md", "VirtualShip Academy"],
    ] as const;

    for (const [name, expectedContent] of expectedFiles) {
      const button = sidebar.querySelector<HTMLButtonElement>(`[data-file-name="${name}"]`);
      expect(button, `${name} should be listed`).not.toBeNull();
      button?.click();

      const viewer = sidebar.querySelector<HTMLElement>(".file-viewer");
      expect(viewer?.textContent).toContain(name);
      expect(viewer?.textContent).toContain(expectedContent);

      sidebar.querySelector<HTMLButtonElement>("[data-file-back]")?.click();
    }
  });

  it("shows the current workspace YAML when expedition.yaml is opened", () => {
    const { sidebar, workspace } = setup();
    workspace.applyGuiPatch((expedition) => {
      expedition.ship_config.ship_speed_knots = 8;
    });
    sidebar.querySelector<HTMLButtonElement>("[data-sidebar-tab='files']")?.click();
    sidebar.querySelector<HTMLButtonElement>('[data-file-name="expedition.yaml"]')?.click();

    expect(sidebar.querySelector(".file-viewer")?.textContent).toContain("ship_speed_knots: 8");
  });
});
