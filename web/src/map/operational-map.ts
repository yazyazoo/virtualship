import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";

import { MISSION_DATASET } from "../demo/mission-dataset";
import type { Locale } from "../i18n";
import { evaluateStation } from "../mission/rules";
import type { MissionPhase } from "../ship/mission-timeline";
import type { DemoWorkspace } from "../workspace/demo-workspace";
import {
  BATHYMETRY_CONTOUR_LEVELS,
  BATHYMETRY_DEPTH_BANDS,
  bathymetryBounds,
  bathymetryContours,
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
      ? { chart: "CARTA OPERATIVA REALE", area: "Mare del Nord meridionale · Den Helder", hint: "Trascina NS-01 in acque abbastanza profonde", safe: "Stazione idonea", unsafe: "Fondale troppo vicino", outside: "Fuori dalla copertura Copernicus", target: "Obiettivo CTD", floor: "Fondale", clearance: "Margine", recommend: "Mostrami una stazione idonea", offline: "Carta scientifica locale (sfondo online non disponibile)", depth: "Profondità", isobaths: "Isobate", safeLine: "35 m · soglia sicura", coverage: "Copertura Copernicus" }
      : { chart: "REAL OPERATIONAL CHART", area: "Southern North Sea · Den Helder", hint: "Drag NS-01 into sufficiently deep water", safe: "Suitable station", unsafe: "Seafloor too close", outside: "Outside Copernicus coverage", target: "CTD target", floor: "Seafloor", clearance: "Clearance", recommend: "Show me a suitable station", offline: "Local scientific chart (online basemap unavailable)", depth: "Depth", isobaths: "Isobaths", safeLine: "35 m · safe threshold", coverage: "Copernicus coverage" };
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
    const floorLabel = evaluation ? evaluation.seafloorDepthM.toFixed(1) : "–";
    const clearanceLabel = evaluation ? evaluation.clearanceM.toFixed(1).replace("-", "−") : "–";
    const bandLabels = BATHYMETRY_DEPTH_BANDS.map((band) => {
      const label = Number.isFinite(band.maximumM)
        ? `${band.minimumM}–${band.maximumM} m`
        : `≥${band.minimumM} m`;
      return `<span><i style="--depth-color:${band.color}"></i>${label}</span>`;
    }).join("");
    this.setAttribute("data-station-safe", String(evaluation?.safe ?? false));
    this.innerHTML = `
      <article class="instrument-panel map-panel" aria-label="${copy.chart}">
        <div class="panel-heading"><div><p class="panel-kicker">${copy.chart}</p><h3>${copy.area}</h3></div><span class="map-source">Copernicus Marine · 2024-06-01</span></div>
        <div class="map-shell">
          <div class="maplibre-surface" aria-label="${copy.area}"></div>
          <div class="map-fallback" hidden><span>${copy.offline}</span></div>
          <section class="bathymetry-legend" aria-label="${copy.depth}">
            <strong>${copy.depth} · m</strong>
            <div>${bandLabels}</div>
            <small><i class="legend-isobath"></i>${copy.isobaths} 10 / 20 / 30 m · <i class="legend-safe"></i>${copy.safeLine} · <i class="legend-coverage"></i>${copy.coverage}</small>
          </section>
          <section class="station-card ${evaluation?.safe ? "station-safe" : "station-unsafe"}">
            <strong>${evaluation?.safe ? copy.safe : evaluation ? copy.unsafe : copy.outside}</strong>
            <span>${copy.target}: ${MISSION_DATASET.targetDepthM} m</span>
            <span data-station-floor>${copy.floor}: ${floorLabel} m</span>
            <span data-station-clearance>${copy.clearance}: ${clearanceLabel} m</span>
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
          layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-opacity": 0.58, "raster-saturation": -0.42, "raster-contrast": 0.08 } }],
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
      "fill-color": ["step", ["get", "depthM"], "#b7e3de", 10, "#72c7c7", 20, "#318da5", 30, "#176486", 35, "#083d67"],
      "fill-opacity": 0.78,
      "fill-outline-color": "rgba(225,248,244,.16)",
    } });
    const contours = bathymetryContours(MISSION_DATASET.bathymetry, BATHYMETRY_CONTOUR_LEVELS);
    map.addSource("bathymetry-contours", { type: "geojson", data: contours });
    map.addLayer({ id: "bathymetry-contours", type: "line", source: "bathymetry-contours", paint: {
      "line-color": ["case", ["==", ["get", "depthM"], 35], "#ffb66e", "#f6f2de"],
      "line-width": ["case", ["==", ["get", "depthM"], 35], 2.2, 1.2],
      "line-opacity": 0.9,
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
    const coverageBounds = bathymetryBounds(MISSION_DATASET.bathymetry);
    if (coverageBounds) {
      const [[west, south], [east, north]] = coverageBounds;
      map.addSource("copernicus-coverage", { type: "geojson", data: {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [[[west, south], [east, south], [east, north], [west, north], [west, south]]] },
      } });
      map.addLayer({ id: "copernicus-coverage", type: "line", source: "copernicus-coverage", paint: {
        "line-color": "#93e1d5",
        "line-width": 1.5,
        "line-dasharray": [4, 3],
        "line-opacity": 0.9,
      } });
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
