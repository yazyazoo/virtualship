import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "playwright-core";

const edgeCandidates = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const executablePath = process.env.VIRTUALSHIP_BROWSER ?? edgeCandidates.find(existsSync);
if (!executablePath) throw new Error("Set VIRTUALSHIP_BROWSER to a Chromium-compatible browser executable");

const baseUrl = process.env.VIRTUALSHIP_URL ?? "http://127.0.0.1:5173/";
const outputDirectory = resolve("../ZZZ/browser-smoke");
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 2048, height: 987 }, deviceScaleFactor: 1 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.screenshot({ path: resolve(outputDirectory, "01-briefing.png"), fullPage: true });

  await page.locator("[data-start-planning]").click();
  const layoutDiagnostics = await page.evaluate(() => {
    const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect().toJSON();
    const sections = [...document.querySelectorAll("[data-ship-section]")].map((section) => {
      const sectionRect = section.getBoundingClientRect();
      return { name: section.getAttribute("data-ship-section"), width: sectionRect.width, height: sectionRect.height };
    });
    return {
      topbar: rect(".topbar"),
      missionRibbon: rect(".mission-ribbon"),
      panelHeadings: [...document.querySelectorAll(".panel-heading")].map((heading) => heading.getBoundingClientRect().height),
      map: rect("vs-operational-map"),
      ship: rect("vs-ship-cutaway"),
      legend: rect(".bathymetry-legend"),
      sections,
    };
  });
  if (!layoutDiagnostics.topbar || layoutDiagnostics.topbar.height > 68) throw new Error(`Top header is not compact: ${JSON.stringify(layoutDiagnostics.topbar)}`);
  if (!layoutDiagnostics.missionRibbon || layoutDiagnostics.missionRibbon.height > 62) throw new Error(`Mission header is not compact: ${JSON.stringify(layoutDiagnostics.missionRibbon)}`);
  if (layoutDiagnostics.panelHeadings.some((height) => height > 52)) throw new Error(`Panel headers are not compact: ${JSON.stringify(layoutDiagnostics.panelHeadings)}`);
  if (!layoutDiagnostics.map || !layoutDiagnostics.ship || layoutDiagnostics.map.height < layoutDiagnostics.ship.height * 1.7) throw new Error(`Map is not vertically dominant: ${JSON.stringify({ map: layoutDiagnostics.map, ship: layoutDiagnostics.ship })}`);
  if (!layoutDiagnostics.legend || layoutDiagnostics.legend.width < 300 || layoutDiagnostics.legend.height < 30) throw new Error(`Bathymetry legend is not visible: ${JSON.stringify(layoutDiagnostics.legend)}`);
  if (layoutDiagnostics.sections.length !== 4 || layoutDiagnostics.sections.some((section) => section.width < 80 || section.height < 45)) throw new Error(`Vessel sections are not all usable: ${JSON.stringify(layoutDiagnostics.sections)}`);

  const initialMarker = page.locator(".station-marker");
  await initialMarker.waitFor();
  const initialMarkerBox = await initialMarker.boundingBox();
  if (!initialMarkerBox) throw new Error("Draggable station marker has no screen position");
  await page.mouse.move(initialMarkerBox.x + initialMarkerBox.width / 2, initialMarkerBox.y + initialMarkerBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(initialMarkerBox.x + initialMarkerBox.width / 2 - 35, initialMarkerBox.y + initialMarkerBox.height / 2 - 20, { steps: 5 });
  await page.mouse.up();
  await page.locator("[data-recommend-station]").click();
  await page.locator("[data-ship-section='wetlab']").click();
  await page.locator("[data-ship-section='winch']").click();
  await page.locator(".station-marker").waitFor();
  await page.waitForTimeout(1000);
  const zoomBefore = await page.evaluate(() => document.querySelector("vs-operational-map")?.map?.getZoom());
  await page.locator(".maplibregl-ctrl-zoom-out").click();
  await page.waitForTimeout(350);
  const zoomAfter = await page.evaluate(() => document.querySelector("vs-operational-map")?.map?.getZoom());
  if (typeof zoomBefore !== "number" || typeof zoomAfter !== "number" || zoomAfter >= zoomBefore) throw new Error(`Zoom out did not reduce map zoom: ${zoomBefore} → ${zoomAfter}`);
  const mapDiagnostics = await page.evaluate(() => {
    const component = document.querySelector("vs-operational-map");
    const marker = document.querySelector(".station-marker");
    const map = component?.map;
    return {
      markerRect: marker?.getBoundingClientRect().toJSON(),
      mapCenter: map?.getCenter().toArray(),
      mapZoom: map?.getZoom(),
      layers: map?.getStyle().layers.map((layer) => layer.id),
      routeDots: document.querySelectorAll(".route-dot").length,
    };
  });
  console.log(`Map diagnostics: ${JSON.stringify(mapDiagnostics)}`);

  const depart = page.locator("[data-mission-action='depart']");
  if (await depart.isDisabled()) throw new Error("Depart remains disabled after completing planning checks");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: resolve(outputDirectory, "02-ready.png"), fullPage: true });
  await depart.click();

  for (let step = 0; step < 5; step += 1) {
    await page.locator("[data-mission-action='operate']").click();
  }
  await page.locator(".debrief-card").waitFor();
  await page.screenshot({ path: resolve(outputDirectory, "03-debrief.png"), fullPage: true });
  console.log("Browser smoke passed: briefing → planning → CTD → debrief");
} finally {
  await browser.close();
}
