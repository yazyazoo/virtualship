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
});
