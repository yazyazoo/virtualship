import { afterEach, expect, it } from "vitest";

import "./ship-cutaway";

afterEach(() => document.body.replaceChildren());

it("shows CTD cable depth during lowering", () => {
  const ship = document.createElement("vs-ship-cutaway") as HTMLElement & {
    phase: string;
  };
  document.body.append(ship);
  ship.phase = "lowering";

  expect(ship.getAttribute("data-phase")).toBe("lowering");
  expect(ship.textContent).toContain("42 m");
});

it("reveals the CTD profile progressively instead of during planning", () => {
  const ship = document.createElement("vs-ship-cutaway") as HTMLElement & {
    phase: string;
  };
  document.body.append(ship);

  expect(ship.getAttribute("data-samples")).toBe("0");
  ship.phase = "sampling";
  expect(Number(ship.getAttribute("data-samples"))).toBeGreaterThan(1);
  expect(ship.getAttribute("data-crew-active")).toBe("true");
});
