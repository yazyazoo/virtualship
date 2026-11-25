import { afterEach, describe, expect, it } from "vitest";

import "./app";

afterEach(() => {
  document.body.replaceChildren();
});

describe("VirtualShip demo shell", () => {
  it("switches between Academy and Parcels Lab", () => {
    const app = document.createElement("virtualship-demo");
    document.body.append(app);

    expect(app.querySelector("[data-screen='academy']")).not.toBeNull();
    expect(app.querySelector("vs-developer-sidebar")).not.toBeNull();
    expect(app.querySelector("vs-operational-map")).not.toBeNull();
    expect(app.querySelector("vs-ship-cutaway")).not.toBeNull();

    const labButton = app.querySelector<HTMLButtonElement>(
      "button[data-mode='lab']",
    );
    labButton?.click();

    expect(app.querySelector("[data-screen='lab']")).not.toBeNull();
    expect(
      app
        .querySelector<HTMLButtonElement>("button[data-mode='lab']")
        ?.getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("changes language without changing mode", () => {
    const app = document.createElement("virtualship-demo");
    document.body.append(app);

    const englishButton = app.querySelector<HTMLButtonElement>(
      "button[data-locale='en']",
    );
    englishButton?.click();

    expect(app.textContent).toContain("North Sea CTD Station");
    expect(app.querySelector("[data-screen='academy']")).not.toBeNull();
  });

  it("localises visible mode text and accessible section names", () => {
    const app = document.createElement("virtualship-demo");
    document.body.append(app);

    expect(app.querySelector(".mode-switch")?.getAttribute("aria-label")).toBe("Modalità applicazione");
    expect(app.querySelector(".mission-ribbon")?.getAttribute("aria-label")).toBe("Stato missione");
    expect(app.textContent).toContain("Modalità: Academy");
    expect(app.textContent).not.toContain("Mode: Academy");

    app.querySelector<HTMLButtonElement>("button[data-mode='lab']")?.click();
    expect(app.textContent).toContain("30 giorni");
  });

  it("lets the student hide and restore the tutor", () => {
    const app = document.createElement("virtualship-demo");
    document.body.append(app);

    app.querySelector<HTMLButtonElement>("[data-mission-action='toggle-tutor']")?.click();
    expect(app.textContent).toContain("Esplora in autonomia");

    app.querySelector<HTMLButtonElement>("[data-mission-action='toggle-tutor']")?.click();
    expect(app.textContent).toContain("Prepara la spedizione");
  });

  it("keeps the vessel readout synchronized with the map waypoint", () => {
    const app = document.createElement("virtualship-demo");
    document.body.append(app);

    expect(app.querySelector("[data-vessel-floor]")?.textContent).toContain("27.5 m");
    expect(app.querySelector("vs-ship-cutaway")?.getAttribute("data-station-safe")).toBe("false");

    app.querySelector<HTMLButtonElement>("[data-recommend-station]")?.click();

    expect(app.querySelector("[data-vessel-floor]")?.textContent).toContain("36.1 m");
    expect(app.querySelector("[data-vessel-clearance]")?.textContent).toContain("6.1 m");
    expect(app.querySelector("vs-ship-cutaway")?.getAttribute("data-station-safe")).toBe("true");
  });

  it("keeps the terminal open and logs accepted GUI actions across redraws", () => {
    const app = document.createElement("virtualship-demo");
    document.body.append(app);

    app.querySelector<HTMLButtonElement>("[data-sidebar-tab='terminal']")?.click();
    const input = app.querySelector<HTMLInputElement>("#terminal-input");
    if (!input) throw new Error("terminal input missing");
    input.value = "pwd";
    app.querySelector<HTMLFormElement>(".terminal-form")?.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );

    app.querySelector<HTMLButtonElement>("[data-ship-section='wetlab']")?.click();

    expect(
      app.querySelector("[data-sidebar-tab='terminal']")?.getAttribute("aria-selected"),
    ).toBe("true");
    expect(app.querySelector(".terminal-preview")?.textContent).toContain("$ pwd");
    expect(app.querySelector(".terminal-preview")?.textContent).toContain(
      "GUI inspected vessel.wetlab",
    );
  });
});
