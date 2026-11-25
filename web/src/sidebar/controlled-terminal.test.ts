import { describe, expect, it } from "vitest";

import { DEMO_EXPEDITION } from "../demo/expedition";
import { executeControlledCommand } from "./controlled-terminal";
import { DemoWorkspace } from "../workspace/demo-workspace";

const run = (command: string) =>
  executeControlledCommand(command, new DemoWorkspace(DEMO_EXPEDITION));

describe("controlled Academy terminal", () => {
  it.each([
    ["help", 0, "virtualship init"],
    ["pwd", 0, "/academy/north-sea"],
    ["ls", 0, "expedition.yaml"],
    ["cat expedition.yaml", 0, "ship_config:"],
    ["virtualship init .", 0, "initialised"],
    ["virtualship plan .", 0, "graphical planner"],
    ["virtualship run .", 0, "precompiled mission"],
  ])("executes %s", (command, exitCode, output) => {
    const result = run(command as string);
    expect(result.exitCode).toBe(exitCode);
    expect(result.output).toContain(output);
  });

  it("returns 127 for an unknown safe command", () => {
    expect(run("python analysis.py")).toEqual(
      expect.objectContaining({ exitCode: 127 }),
    );
  });

  it.each(["ls; whoami", "cat expedition.yaml | more", "rm -rf ."])(
    "rejects shell input %s",
    (command) => {
      expect(run(command)).toEqual(
        expect.objectContaining({ exitCode: 126, action: "rejected" }),
      );
    },
  );

  it("does not let init discard a locked invalid YAML draft", () => {
    const workspace = new DemoWorkspace(DEMO_EXPEDITION);
    workspace.applyYamlDraft("schedule: [broken");

    const result = executeControlledCommand("virtualship init .", workspace);

    expect(result.exitCode).toBe(2);
    expect(workspace.guiLocked).toBe(true);
    expect(workspace.invalidDraft).toBe("schedule: [broken");
  });
});
