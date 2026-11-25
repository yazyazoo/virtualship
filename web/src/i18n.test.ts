import { describe, expect, it } from "vitest";

import { catalogs, t } from "./i18n";

describe("bilingual interface catalog", () => {
  it("keeps Italian and English keys identical", () => {
    expect(Object.keys(catalogs.it).sort()).toEqual(
      Object.keys(catalogs.en).sort(),
    );
  });

  it("uses the approved mode and difficulty names", () => {
    expect(t("it", "mode.academy")).toBe("Academy");
    expect(t("it", "mode.lab")).toBe("Parcels Lab");
    expect(t("it", "difficulty.master")).toBe("Flying Dutchman — Master");
    expect(t("en", "difficulty.master")).toBe("Flying Dutchman — Master");
  });
});
