export type Locale = "it" | "en";

const it = {
  "mode.academy": "Academy",
  "mode.lab": "Parcels Lab",
  "difficulty.master": "Flying Dutchman — Master",
  "app.title": "VirtualShip Academy",
  "app.subtitle": "Impara a progettare una spedizione oceanografica",
  "app.modeLabel": "Modalità applicazione",
  "mission.statusLabel": "Stato missione",
  "mission.metricsLabel": "Metriche missione",
  "sidebar.label": "Console e file della spedizione",
  "status.mode": "Modalità",
  "mission.title": "Transetto CTD nel Mare del Nord",
  "mission.level": "Triennale · Missione introduttiva",
  "mission.kicker": "MISSIONE 01 · MARE DEL NORD",
  "metric.route": "ROTTA",
  "metric.eta": "ARRIVO",
  "metric.stations": "STAZIONI",
  "metric.sea": "STATO DEL MARE",
  "metric.calm": "2 · calmo",
  "language.label": "Lingua",
  "sidebar.terminal": "Terminale",
  "sidebar.yaml": "YAML",
  "sidebar.files": "File",
  "status.prototype": "Prototipo UI · dati scientifici non validati",
} as const;

type Catalog = Record<keyof typeof it, string>;

const en: Catalog = {
  "mode.academy": "Academy",
  "mode.lab": "Parcels Lab",
  "difficulty.master": "Flying Dutchman — Master",
  "app.title": "VirtualShip Academy",
  "app.subtitle": "Learn to design an oceanographic expedition",
  "app.modeLabel": "Application mode",
  "mission.statusLabel": "Mission status",
  "mission.metricsLabel": "Mission metrics",
  "sidebar.label": "Expedition console and files",
  "status.mode": "Mode",
  "mission.title": "North Sea CTD Transect",
  "mission.level": "Bachelor · Introductory mission",
  "mission.kicker": "MISSION 01 · NORTH SEA",
  "metric.route": "ROUTE",
  "metric.eta": "ETA",
  "metric.stations": "STATIONS",
  "metric.sea": "SEA STATE",
  "metric.calm": "2 · calm",
  "language.label": "Language",
  "sidebar.terminal": "Terminal",
  "sidebar.yaml": "YAML",
  "sidebar.files": "Files",
  "status.prototype": "UI prototype · scientific data not validated",
};

export const catalogs = { it, en } satisfies Record<Locale, Catalog>;
export type TranslationKey = keyof typeof it;

export function t(locale: Locale, key: TranslationKey): string {
  return catalogs[locale][key];
}
