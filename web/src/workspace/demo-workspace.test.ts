import { describe, expect, it } from "vitest";

import { DEMO_EXPEDITION } from "../demo/expedition";
import { DemoWorkspace } from "./demo-workspace";

describe("DemoWorkspace", () => {
  it("creates a new valid revision after a GUI patch", () => {
    const workspace = new DemoWorkspace(DEMO_EXPEDITION);
    const result = workspace.applyGuiPatch((expedition) => {
      expedition.ship_config.ship_speed_knots = 8.5;
    });

    expect(result.ok).toBe(true);
    expect(workspace.revisionId).toBe(2);
    expect(workspace.yaml).toContain("ship_speed_knots: 8.5");
    expect(workspace.audit.at(-1)).toContain("ship_speed_knots");
  });

  it("keeps an invalid YAML draft and locks GUI mutation", () => {
    const workspace = new DemoWorkspace(DEMO_EXPEDITION);
    const invalid = workspace.applyYamlDraft("schedule: [broken");

    expect(invalid.ok).toBe(false);
    expect(workspace.guiLocked).toBe(true);
    expect(workspace.invalidDraft).toBe("schedule: [broken");
    expect(() => workspace.applyGuiPatch(() => undefined)).toThrow(
      "invalid YAML draft",
    );
    expect(workspace.revisionId).toBe(1);
  });

  it("rejects structurally incomplete YAML without replacing the last valid model", () => {
    const workspace = new DemoWorkspace(DEMO_EXPEDITION);
    const previous = workspace.expedition;

    const result = workspace.applyYamlDraft(`
ship_config:
  ship_speed_knots: 10
schedule:
  waypoints:
    - time: 2024-06-01T06:00:00Z
    - time: 2024-06-01T07:00:00Z
instruments_config:
  ctd_config:
    max_depth_meter: -42
`);

    expect(result.ok).toBe(false);
    expect(workspace.guiLocked).toBe(true);
    expect(workspace.expedition).toEqual(previous);
    expect(workspace.revisionId).toBe(1);
  });

  it("can stash an invalid draft and restore editing", () => {
    const workspace = new DemoWorkspace(DEMO_EXPEDITION);
    workspace.applyYamlDraft("schedule: [broken");

    const stashed = workspace.stashInvalidDraft();

    expect(stashed).toBe("schedule: [broken");
    expect(workspace.invalidDraft).toBeNull();
    expect(workspace.guiLocked).toBe(false);
  });

  it("exports a versioned portable project", () => {
    const workspace = new DemoWorkspace(DEMO_EXPEDITION);
    const exported = JSON.parse(workspace.exportProject()) as {
      format: string;
      revision: number;
    };

    expect(exported).toEqual(
      expect.objectContaining({ format: "virtualship-demo/v1", revision: 1 }),
    );
  });
});
