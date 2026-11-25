import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../app";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("Erik presentation flow", () => {
  it("moves from briefing through mission run to debrief", () => {
    const app = document.createElement("virtualship-demo");
    document.body.append(app);

    expect(app.getAttribute("data-stage")).toBe("briefing");
    expect(app.textContent).toContain("GUI → YAML → CLI");

    app.querySelector<HTMLButtonElement>("[data-start-planning]")?.click();
    expect(app.getAttribute("data-stage")).toBe("planning");

    app.querySelector("vs-developer-sidebar")?.dispatchEvent(
      new CustomEvent("run-mission", { bubbles: true }),
    );
    vi.runAllTimers();

    expect(app.getAttribute("data-stage")).toBe("debrief");
    expect(app.textContent).toContain("Decisione · evidenza · conseguenza");
  });

  it("marks Parcels Lab as a bilingual non-operational simulation", () => {
    const app = document.createElement("virtualship-demo");
    document.body.append(app);
    app.querySelector<HTMLButtonElement>("button[data-mode='lab']")?.click();

    expect(app.querySelector("vs-lab-preview")).not.toBeNull();
    expect(app.textContent).toContain("DEMO / SIMULATED");
    expect(app.textContent).toContain("Nessun job viene inviato");
    app.querySelector<HTMLButtonElement>("button[data-locale='en']")?.click();
    expect(app.textContent).toContain("No job is submitted");
  });

  it("makes the modal background inert and moves focus to its action", async () => {
    const app = document.createElement("virtualship-demo");
    document.body.append(app);
    await Promise.resolve();

    const action = app.querySelector<HTMLButtonElement>("[data-start-planning]");
    expect(app.querySelector(".topbar")?.hasAttribute("inert")).toBe(true);
    expect(document.activeElement).toBe(action);

    action?.click();
    await Promise.resolve();
    expect(document.activeElement?.getAttribute("data-move-station")).toBe("1");
  });
});
