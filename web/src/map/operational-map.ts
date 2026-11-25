import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";

import { MISSION_DATASET } from "../demo/mission-dataset";
import type { Locale } from "../i18n";
import { evaluateStation } from "../mission/rules";
import type { MissionPhase } from "../ship/mission-timeline";
import type { DemoWorkspace } from "../workspace/demo-workspace";

export class OperationalMap extends HTMLElement {
  private workspaceValue: DemoWorkspace | null = null;
  private localeValue: Locale = "it";
  private phaseValue: MissionPhase = "planning";
  private unsubscribe?: () => void;
  private map?: MapLibreMap;

  set locale(value: Locale) { this.localeValue = value; this.render(); }
  set phase(value: MissionPhase) { this.phaseValue = value; this.setAttribute("data-phase", value); this.render(); }
  set workspace(value: DemoWorkspace) {
    this.unsubscribe?.();
    this.workspaceValue = value;
    this.unsubscribe = value.subscribe(() => this.render());
    this.render();
  }

  connectedCallback(): void { this.render(); }
  disconnectedCallback(): void { this.unsubscribe?.(); this.map?.remove(); }

  private copy() {
    return this.localeValue === "it"
      ? { chart: "CARTA OPERATIVA REALE", area: "Mare del Nord meridionale · Den Helder", hint: "Trascina NS-01 in acque abbastanza profonde", safe: "Stazione idonea", unsafe: "Fondale troppo vicino", outside: "Fuori dalla copertura Copernicus", target: "Obiettivo CTD", floor: "Fondale", clearance: "Margine", recommend: "Mostrami una stazione idonea", offline: "Carta scientifica locale (sfondo online non disponibile)" }
      : { chart: "REAL OPERATIONAL CHART", area: "Southern North Sea · Den Helder", hint: "Drag NS-01 into sufficiently deep water", safe: "Suitable station", unsafe: "Seafloor too close", outside: "Outside Copernicus coverage", target: "CTD target", floor: "Seafloor", clearance: "Clearance", recommend: "Show me a suitable station", offline: "Local scientific chart (online basemap unavailable)" };
  }

  private station() {
    const waypoint = this.workspaceValue?.expedition.schedule.waypoints[1];
    return waypoint?.location ?? MISSION_DATASET.initialStation;
  }

  private render(): void {
    if (!this.workspaceValue) return;
    this.map?.remove();
    this.map = undefined;
    const copy = this.copy();
    const station = this.station();
    const evaluation = evaluateStation(station.longitude, station.latitude, MISSION_DATASET.bathymetry, MISSION_DATASET.targetDepthM, MISSION_DATASET.safetyClearanceM);
    const floorLabel = evaluation ? evaluation.seafloorDepthM.toFixed(1) : "–";
    const clearanceLabel = evaluation ? evaluation.clearanceM.toFixed(1) : "–";
    this.setAttribute("data-station-safe", String(evaluation?.safe ?? false));
    this.innerHTML = `
      <article class="instrument-panel map-panel" aria-label="${copy.chart}">
        <div class="panel-heading"><div><p class="panel-kicker">${copy.chart}</p><h3>${copy.area}</h3></div><span class="map-source">Copernicus Marine · 2024-06-01</span></div>
        <div class="map-shell">
          <div class="maplibre-surface" aria-label="${copy.area}"></div>
          <div class="map-fallback" hidden><span>${copy.offline}</span></div>
          <section class="station-card ${evaluation?.safe ? "station-safe" : "station-unsafe"}">
            <strong>${evaluation?.safe ? copy.safe : evaluation ? copy.unsafe : copy.outside}</strong>
            <span>${copy.target}: ${MISSION_DATASET.targetDepthM} m</span>
            <span>${copy.floor}: ${floorLabel} m</span>
            <span>${copy.clearance}: ${clearanceLabel} m</span>
            <small>${copy.hint}</small>
            <button data-recommend-station ${this.workspaceValue.guiLocked || this.phaseValue !== "planning" ? "disabled" : ""}>${copy.recommend}</button>
          </section>
        </div>
      </article>`;
    this.querySelector<HTMLButtonElement>("[data-recommend-station]")?.addEventListener("click", () => {
      const { longitude, latitude } = MISSION_DATASET.recommendedStation;
      this.updateStation(longitude, latitude);
    });
    if (navigator.userAgent.toLowerCase().includes("jsdom")) return;
    queueMicrotask(() => this.initialiseMap());
  }

  private initialiseMap(): void {
    const container = this.querySelector<HTMLElement>(".maplibre-surface");
    if (!container || !this.isConnected) return;
    try {
      const map = new maplibregl.Map({
        container,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [4.48, 53.42],
        zoom: 7.9,
        attributionControl: false,
        maxBounds: [[2.5, 51.8], [6.2, 55.0]],
      });
      this.map = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      map.on("load", () => this.addScientificLayers());
      map.on("error", () => this.showFallback());
    } catch { this.showFallback(); }
  }

  private addScientificLayers(): void {
    const map = this.map;
    if (!map || !this.workspaceValue) return;
    const station = this.station();
    const port = MISSION_DATASET.port;
    const cellSize = 0.0415;
    map.addSource("bathymetry", { type: "geojson", data: {
      type: "FeatureCollection",
      features: MISSION_DATASET.bathymetry.map((cell) => ({ type: "Feature", properties: { depthM: cell.depthM }, geometry: { type: "Polygon", coordinates: [[
        [cell.longitude - cellSize, cell.latitude - cellSize], [cell.longitude + cellSize, cell.latitude - cellSize], [cell.longitude + cellSize, cell.latitude + cellSize], [cell.longitude - cellSize, cell.latitude + cellSize], [cell.longitude - cellSize, cell.latitude - cellSize],
      ]] } })),
    } });
    map.addLayer({ id: "bathymetry-fill", type: "fill", source: "bathymetry", paint: {
      "fill-color": ["interpolate", ["linear"], ["get", "depthM"], 7, "#69d5cc", 24, "#238ca0", 38, "#073c68"], "fill-opacity": 0.48, "fill-outline-color": "rgba(214,246,242,.34)",
    } });
    map.addSource("route", { type: "geojson", data: { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[port.longitude, port.latitude], [station.longitude, station.latitude], [port.longitude, port.latitude]] } }] } });
    map.addLayer({ id: "route-line", type: "line", source: "route", paint: { "line-color": "#ffb66e", "line-width": 5, "line-opacity": 1, "line-dasharray": [2, 1.4] } });
    for (let step = 1; step < 12; step += 1) {
      const fraction = step / 12;
      const routeDot = document.createElement("i");
      routeDot.className = "route-dot";
      new maplibregl.Marker({ element: routeDot })
        .setLngLat([
          port.longitude + (station.longitude - port.longitude) * fraction,
          port.latitude + (station.latitude - port.latitude) * fraction,
        ])
        .addTo(map);
    }
    const stationElement = document.createElement("button");
    stationElement.className = "station-marker";
    stationElement.textContent = "NS-01";
    stationElement.setAttribute("aria-label", "NS-01 · draggable waypoint");
    stationElement.addEventListener("keydown", (event) => {
      const offsets: Record<string, [number, number]> = {
        ArrowLeft: [-0.04, 0], ArrowRight: [0.04, 0], ArrowUp: [0, 0.04], ArrowDown: [0, -0.04],
      };
      const offset = offsets[event.key];
      if (!offset) return;
      event.preventDefault();
      this.updateStation(station.longitude + offset[0], station.latitude + offset[1]);
    });
    const stationMarker = new maplibregl.Marker({ element: stationElement, draggable: this.phaseValue === "planning", anchor: "bottom" }).setLngLat([station.longitude, station.latitude]).addTo(map);
    stationMarker.on("dragend", () => { const point = stationMarker.getLngLat(); this.updateStation(point.lng, point.lat); });
    const portElement = document.createElement("div");
    portElement.className = "port-marker";
    portElement.textContent = "DEN HELDER";
    new maplibregl.Marker({ element: portElement, anchor: "bottom" }).setLngLat([port.longitude, port.latitude]).addTo(map);
  }

  private updateStation(longitude: number, latitude: number): void {
    if (!this.workspaceValue || this.workspaceValue.guiLocked || this.phaseValue !== "planning") return;
    const evaluation = evaluateStation(longitude, latitude, MISSION_DATASET.bathymetry, MISSION_DATASET.targetDepthM, MISSION_DATASET.safetyClearanceM);
    this.workspaceValue.applyGuiPatch((expedition) => {
      const waypoint = expedition.schedule.waypoints[1];
      if (!waypoint) return;
      waypoint.location.longitude = Number(longitude.toFixed(3));
      waypoint.location.latitude = Number(latitude.toFixed(3));
      waypoint.sea_depth_meter = evaluation ? -evaluation.seafloorDepthM : null;
    });
    this.dispatchEvent(new CustomEvent("station-evaluated", { bubbles: true, detail: evaluation }));
  }

  private showFallback(): void { const fallback = this.querySelector<HTMLElement>(".map-fallback"); if (fallback) fallback.hidden = false; }
}

if (!customElements.get("vs-operational-map")) customElements.define("vs-operational-map", OperationalMap);
