import type { DemoWorkspace } from "../workspace/demo-workspace";
import type { Locale } from "../i18n";
import type { MissionPhase } from "../ship/mission-timeline";

function project(longitude: number, latitude: number): [number, number] {
  return [((longitude - 3) / 4) * 900, 420 - ((latitude - 51) / 4.5) * 420];
}

export class OperationalMap extends HTMLElement {
  private workspaceValue: DemoWorkspace | null = null;
  private localeValue: Locale = "it";
  private phaseValue: MissionPhase = "planning";
  private unsubscribe?: () => void;

  set locale(value: Locale) { this.localeValue = value; this.render(); }
  set phase(value: MissionPhase) { this.phaseValue = value; this.setAttribute("data-phase", value); this.render(); }

  set workspace(value: DemoWorkspace) {
    this.unsubscribe?.();
    this.workspaceValue = value;
    this.unsubscribe = value.subscribe(() => this.render());
    this.render();
  }

  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
  }

  private render(): void {
    if (!this.workspaceValue) return;
    const waypoints = this.workspaceValue.expedition.schedule.waypoints;
    const points = waypoints
      .map(({ location }) => project(location.longitude, location.latitude).join(","))
      .join(" ");
    const copy = this.localeValue === "it"
      ? { chart: "CARTA OPERATIVA", area: "Mare del Nord meridionale", edit: "Stazioni suggerite · liberamente regolabili", locked: "Risolvi la bozza YAML per modificare le stazioni", move: "Sposta a est", depth: "Batimetria demo", route: "Rotta pianificata", port: "PORTO", return: "RIENTRO", aria: "Carta operativa batimetrica", routeAria: "Rotta dimostrativa nel Mare del Nord" }
      : { chart: "OPERATIONAL CHART", area: "Southern North Sea", edit: "Suggested stations · freely adjustable", locked: "Resolve the YAML draft to edit stations", move: "Move east", depth: "Demo bathymetry", route: "Planned route", port: "PORT", return: "RETURN", aria: "Bathymetric operational chart", routeAria: "Demo North Sea route" };
    const phaseIndex: Record<MissionPhase, number> = { planning: 0, underway: 1, stationkeeping: 2, lowering: 2, sampling: 2, recovering: 3, completed: waypoints.length - 1 };
    const vesselWaypoint = waypoints[Math.min(phaseIndex[this.phaseValue], waypoints.length - 1)] ?? waypoints[0];
    if (!vesselWaypoint) return;
    const [vesselX, vesselY] = project(vesselWaypoint.location.longitude, vesselWaypoint.location.latitude);
    this.innerHTML = `
      <article class="instrument-panel map-placeholder" aria-label="${copy.aria}">
        <div class="panel-heading"><div><p class="panel-kicker">${copy.chart}</p><h3>${copy.area}</h3></div><div class="map-controls"><span>3°E–7°E · 51°N–55.5°N</span></div></div>
        <div class="demo-chart">
          <svg viewBox="0 0 900 420" preserveAspectRatio="none" aria-label="${copy.routeAria}">
            <defs><linearGradient id="sea-map" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#082e46"/><stop offset=".55" stop-color="#0d5269"/><stop offset="1" stop-color="#0b7680"/></linearGradient></defs>
            <rect width="900" height="420" fill="url(#sea-map)"/>
            <path d="M610 0 C650 62 630 104 690 148 C748 190 720 258 810 304 L900 342 V420 H790 C740 384 692 376 634 330 C578 286 610 226 560 188 C520 158 534 92 492 44 L470 0Z" fill="#c8c3a8"/>
            <path d="M0 336 C120 310 190 350 284 328 C376 305 430 326 520 294M0 268 C116 244 208 270 324 244 C430 220 502 244 594 214M42 192 C188 170 288 188 420 150 C500 126 560 140 642 112" fill="none" stroke="#5db1b4" stroke-width="1.5" opacity=".62"/>
            <polyline points="${points}" fill="none" stroke="#ffb66e" stroke-width="4" stroke-dasharray="10 6"/>
            ${waypoints.map(({ location }, index) => { const [x,y] = project(location.longitude, location.latitude); return `<circle cx="${x}" cy="${y}" r="${index === 0 || index === waypoints.length - 1 ? 8 : 10}" fill="#f6f2de" stroke="#ffb66e" stroke-width="4"/><text x="${x + 13}" y="${y - 10}" fill="#f6f2de" font-size="12">${index === 0 ? copy.port : index === waypoints.length - 1 ? copy.return : `NS-0${index}`}</text>`; }).join("")}
            <g class="vessel-marker" transform="translate(${vesselX} ${vesselY})"><path d="M-12 -5 L10 -5 L15 0 L9 6 L-9 6 Z" fill="#93e1d5" stroke="#082e46" stroke-width="2"/><circle r="18" fill="none" stroke="#93e1d5" opacity=".45"/></g>
          </svg>
          <div class="station-controls"><span>${this.workspaceValue.guiLocked ? copy.locked : copy.edit}</span>${waypoints.slice(1,-1).map((_,index) => `<button data-move-station="${index+1}" ${this.workspaceValue?.guiLocked ? "disabled" : ""}>${copy.move} NS-0${index+1}</button>`).join("")}</div>
          <div class="map-legend"><span><i class="legend-depth"></i>${copy.depth}</span><span><i class="legend-route"></i>${copy.route}</span></div>
        </div>
      </article>`;
    this.querySelectorAll<HTMLButtonElement>("[data-move-station]").forEach((button) =>
      button.addEventListener("click", () => {
        if (this.workspaceValue?.guiLocked) return;
        const index = Number(button.dataset.moveStation);
        this.workspaceValue?.applyGuiPatch((expedition) => {
          const waypoint = expedition.schedule.waypoints[index];
          if (waypoint) waypoint.location.longitude = Number((waypoint.location.longitude + 0.12).toFixed(2));
        });
      }),
    );
  }
}

if (!customElements.get("vs-operational-map")) customElements.define("vs-operational-map", OperationalMap);
