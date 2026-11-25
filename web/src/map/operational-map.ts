import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";

import { MISSION_DATASET } from "../demo/mission-dataset";
import type { Locale } from "../i18n";
import { evaluateStation } from "../mission/rules";
import type { MissionPhase } from "../ship/mission-timeline";
import type { DemoWorkspace } from "../workspace/demo-workspace";
import {
  BATHYMETRY_CONTOUR_LEVELS,
  bathymetryBounds,
  bathymetryContours,
  bathymetryCoverageBoundary,
  bathymetrySoundings,
} from "./bathymetry-visuals";

function roundCoordinate(value: number): number {
  return Number(value.toFixed(4));
}

export function operationalMapCameraOptions() {
  const rawBounds = bathymetryBounds(MISSION_DATASET.bathymetry);
  const bounds = rawBounds
    ? rawBounds.map(([longitude, latitude]) => [roundCoordinate(longitude), roundCoordinate(latitude)]) as [[number, number], [number, number]]
    : [[3.5, 52.5], [5.25, 54]] as [[number, number], [number, number]];
  return {
    bounds,
    minZoom: 4.5,
    fitBoundsOptions: { padding: 34, maxZoom: 7.8 },
  };
}

export interface OperationalMapCamera {
  center: [number, number];
  zoom: number;
}

export class OperationalMap extends HTMLElement {
  private workspaceValue: DemoWorkspace | null = null;
  private localeValue: Locale = "it";
  private phaseValue: MissionPhase = "planning";
  private unsubscribe?: () => void;
  private map?: MapLibreMap;
  private cameraValue?: OperationalMapCamera;

  set locale(value: Locale) { this.localeValue = value; this.render(); }
  set phase(value: MissionPhase) { this.phaseValue = value; this.setAttribute("data-phase", value); this.render(); }
  set camera(value: OperationalMapCamera | undefined) { this.cameraValue = value; }
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
      ? { chart: "CARTA BATIMETRICA OPERATIVA", area: "Mare del Nord meridionale · Den Helder", hint: "Trascina NS-01 nella zona operativa ≥35 m", safe: "Stazione idonea", unsafe: "Fondale troppo vicino", outside: "Fuori dalla copertura Copernicus", target: "Obiettivo CTD", floor: "Fondale", clearance: "Margine", recommend: "Mostrami una stazione idonea", offline: "Carta scientifica locale (sfondo online non disponibile)", depth: "Profondità", isobaths: "Isobate", soundings: "Scandagli", safeLine: "Zona operativa ≥35 m", coverage: "Limite dati Copernicus" }
      : { chart: "OPERATIONAL BATHYMETRIC CHART", area: "Southern North Sea · Den Helder", hint: "Drag NS-01 into the ≥35 m operating zone", safe: "Suitable station", unsafe: "Seafloor too close", outside: "Outside Copernicus coverage", target: "CTD target", floor: "Seafloor", clearance: "Clearance", recommend: "Show me a suitable station", offline: "Local scientific chart (online basemap unavailable)", depth: "Depth", isobaths: "Isobaths", soundings: "Soundings", safeLine: "Operating zone ≥35 m", coverage: "Copernicus data limit" };
  }

  private station() {
    const waypoint = this.workspaceValue?.expedition.schedule.waypoints[1];
    return waypoint?.location ?? MISSION_DATASET.initialStation;
  }

  private render(): void {
    if (!this.workspaceValue) return;
    if (this.map) {
      const center = this.map.getCenter();
      this.cameraValue = { center: [center.lng, center.lat], zoom: this.map.getZoom() };
    }
    this.map?.remove();
    this.map = undefined;
    const copy = this.copy();
    const station = this.station();
    const evaluation = evaluateStation(station.longitude, station.latitude, MISSION_DATASET.bathymetry, MISSION_DATASET.targetDepthM, MISSION_DATASET.safetyClearanceM);
    this.setAttribute("data-station-safe", String(evaluation?.safe ?? false));
    this.innerHTML = `
      <article class="instrument-panel map-panel" aria-label="${copy.chart}">
        <div class="panel-heading"><div><p class="panel-kicker">${copy.chart}</p><h3>${copy.area}</h3></div><span class="map-source">Copernicus Marine · 2024-06-01</span></div>
        <div class="map-shell">
          <div class="maplibre-surface" aria-label="${copy.area}"></div>
          <div class="map-fallback" hidden><span>${copy.offline}</span></div>
        </div>
      </article>`;
    if (navigator.userAgent.toLowerCase().includes("jsdom")) return;
    queueMicrotask(() => this.initialiseMap());
  }

  recommendStation(): void {
    const { longitude, latitude } = MISSION_DATASET.recommendedStation;
    this.updateStation(longitude, latitude);
  }

  private initialiseMap(): void {
    const container = this.querySelector<HTMLElement>(".maplibre-surface");
    if (!container || !this.isConnected) return;
    try {
      const defaultCamera = operationalMapCameraOptions();
      const camera = this.cameraValue
        ? { center: this.cameraValue.center, zoom: this.cameraValue.zoom }
        : { bounds: defaultCamera.bounds, fitBoundsOptions: defaultCamera.fitBoundsOptions };
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
          layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-opacity": 0.22, "raster-saturation": -0.85, "raster-contrast": -0.12, "raster-brightness-max": 0.94 } }],
        },
        ...camera,
        minZoom: defaultCamera.minZoom,
        attributionControl: false,
      });
      this.map = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
      map.on("load", () => this.addScientificLayers());
      map.on("moveend", () => {
        const center = map.getCenter();
        this.cameraValue = { center: [center.lng, center.lat], zoom: map.getZoom() };
        this.dispatchEvent(new CustomEvent("map-camera-changed", { bubbles: true, detail: this.cameraValue }));
      });
      map.on("error", () => this.showFallback());
    } catch { this.showFallback(); }
  }

  private addScientificLayers(): void {
    const map = this.map;
    if (!map || !this.workspaceValue) return;
    const copy = this.copy();
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
      "fill-color": ["step", ["get", "depthM"], "#8fcbd2", 10, "#b8dce0", 20, "#d6e9e7", 30, "#edf1e5", 35, "#fff8e8"],
      "fill-opacity": 1,
      "fill-outline-color": "rgba(28,67,76,.08)",
    } });
    const contours = bathymetryContours(MISSION_DATASET.bathymetry, BATHYMETRY_CONTOUR_LEVELS);
    map.addSource("bathymetry-contours", { type: "geojson", data: contours });
    map.addLayer({ id: "bathymetry-contours", type: "line", source: "bathymetry-contours", paint: {
      "line-color": ["case", ["==", ["get", "depthM"], 35], "#b72f62", "#315761"],
      "line-width": ["case", ["==", ["get", "depthM"], 35], 2.8, 1.15],
      "line-opacity": 0.95,
    } });
    for (const level of BATHYMETRY_CONTOUR_LEVELS) {
      const levelFeatures = contours.features.filter((feature) => feature.properties.depthM === level);
      const feature = levelFeatures[Math.floor(levelFeatures.length / 2)];
      if (!feature) continue;
      const [start, end] = feature.geometry.coordinates;
      const label = document.createElement("span");
      label.className = `contour-label${level === 35 ? " contour-label-safe" : ""}`;
      label.textContent = `${level} m`;
      new maplibregl.Marker({ element: label, anchor: "center" })
        .setLngLat([(start[0] + end[0]) / 2, (start[1] + end[1]) / 2])
        .addTo(map);
    }
    const safeCells = MISSION_DATASET.bathymetry.filter((cell) => cell.depthM >= MISSION_DATASET.targetDepthM + MISSION_DATASET.safetyClearanceM);
    const safeBoundary = bathymetryCoverageBoundary(safeCells);
    map.addSource("safe-operating-zone", { type: "geojson", data: safeBoundary });
    map.addLayer({ id: "safe-operating-zone", type: "line", source: "safe-operating-zone", paint: {
      "line-color": "#087d74",
      "line-width": 3,
      "line-opacity": 1,
    } });
    if (safeCells.length) {
      const safeLabel = document.createElement("span");
      safeLabel.className = "safe-zone-label";
      safeLabel.textContent = `${this.localeValue === "it" ? "ZONA OPERATIVA" : "OPERATING ZONE"} ≥35 m`;
      const longitude = safeCells.reduce((sum, cell) => sum + cell.longitude, 0) / safeCells.length;
      const latitude = Math.min(...safeCells.map((cell) => cell.latitude)) - 0.035;
      new maplibregl.Marker({ element: safeLabel, anchor: "center" }).setLngLat([longitude, latitude]).addTo(map);
    }
    for (const sounding of bathymetrySoundings(MISSION_DATASET.bathymetry, 35).features) {
      const marker = document.createElement("span");
      marker.className = `depth-sounding${sounding.properties.safe ? " depth-sounding-safe" : ""}`;
      marker.textContent = sounding.properties.label;
      marker.setAttribute("aria-label", `${copy.depth} ${sounding.properties.label} m`);
      new maplibregl.Marker({ element: marker, anchor: "center" }).setLngLat(sounding.geometry.coordinates).addTo(map);
    }
    const coverageBounds = bathymetryBounds(MISSION_DATASET.bathymetry);
    if (coverageBounds) {
      const [[west], [, north]] = coverageBounds;
      map.addSource("copernicus-coverage", { type: "geojson", data: {
        ...bathymetryCoverageBoundary(MISSION_DATASET.bathymetry),
      } });
      map.addLayer({ id: "copernicus-coverage", type: "line", source: "copernicus-coverage", paint: {
        "line-color": "#b72f62",
        "line-width": 2.6,
        "line-dasharray": [3, 2],
        "line-opacity": 1,
      } });
      const coverageLabel = document.createElement("span");
      coverageLabel.className = "coverage-limit-label";
      coverageLabel.textContent = copy.coverage.toUpperCase();
      new maplibregl.Marker({ element: coverageLabel, anchor: "left" }).setLngLat([west + 0.03, north + 0.025]).addTo(map);
    }
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
    const camera = this.map
      ? { center: this.map.getCenter().toArray() as [number, number], zoom: this.map.getZoom() }
      : this.cameraValue;
    this.workspaceValue.applyGuiPatch((expedition) => {
      const waypoint = expedition.schedule.waypoints[1];
      if (!waypoint) return;
      waypoint.location.longitude = Number(longitude.toFixed(3));
      waypoint.location.latitude = Number(latitude.toFixed(3));
      waypoint.sea_depth_meter = evaluation ? -evaluation.seafloorDepthM : null;
    });
    this.dispatchEvent(new CustomEvent("station-evaluated", { bubbles: true, detail: { evaluation, camera } }));
  }

  private showFallback(): void { const fallback = this.querySelector<HTMLElement>(".map-fallback"); if (fallback) fallback.hidden = false; }
}

if (!customElements.get("vs-operational-map")) customElements.define("vs-operational-map", OperationalMap);
