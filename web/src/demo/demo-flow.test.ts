import { afterEach, describe, expect, it } from "vitest";

import "../app";

afterEach(() => {
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

    app.querySelector<HTMLButtonElement>("[data-recommend-station]")?.click();
    app.querySelector<HTMLButtonElement>("[data-ship-section='wetlab']")?.click();
    app.querySelector<HTMLButtonElement>("[data-ship-section='winch']")?.click();
    app.querySelector("vs-developer-sidebar")?.dispatchEvent(
      new CustomEvent("run-mission", { bubbles: true }),
    );
    for (let step = 0; step < 5; step += 1) {
      app.querySelector("vs-developer-sidebar")?.dispatchEvent(
        new CustomEvent("mission-action", { bubbles: true, detail: { action: "operate" } }),
      );
    }

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
    expect(document.activeElement?.hasAttribute("data-recommend-station")).toBe(true);
  });

  it("revokes departure when YAML moves a safe station to shallow water", () => {
    const app = document.createElement("virtualship-demo");
    document.body.append(app);
    app.querySelector<HTMLButtonElement>("[data-start-planning]")?.click();
    app.querySelector<HTMLButtonElement>("[data-recommend-station]")?.click();
    app.querySelector<HTMLButtonElement>("[data-ship-section='wetlab']")?.click();
    app.querySelector<HTMLButtonElement>("[data-ship-section='winch']")?.click();
    expect(app.querySelector<HTMLButtonElement>("[data-mission-action='depart']")?.disabled).toBe(false);

    app.querySelector<HTMLButtonElement>("[data-sidebar-tab='yaml']")?.click();
    const source = app.querySelector<HTMLTextAreaElement>(".yaml-source");
    if (!source) throw new Error("YAML editor missing");
    source.value = source.value
      .replace("latitude: 53.667", "latitude: 53.32")
      .replace("longitude: 4.333", "longitude: 4.35");
    app.querySelector<HTMLButtonElement>("[data-yaml-apply]")?.click();

    app.querySelector<HTMLButtonElement>("[data-sidebar-tab='tutor']")?.click();
    expect(app.querySelector<HTMLButtonElement>("[data-mission-action='depart']")?.disabled).toBe(true);
  });
});
