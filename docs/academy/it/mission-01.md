# Missione 01 — Stazione CTD nel Mare del Nord

**Lingua:** Italiano · [English](../en/mission-01.md)

## Stato

**Implementata e giocabile** nella vertical slice browser.

## Brief

La RV Virtual Explorer parte da Den Helder. Lo studente deve scegliere una stazione nel Mare del Nord meridionale, verificare che la CTD possa raggiungere 30 m mantenendo 5 m di margine dal fondale, ispezionare i sistemi necessari ed eseguire la sequenza operativa completa.

## Obiettivi didattici

- leggere una carta batimetrica operativa;
- distinguere limite della copertura e limite di sicurezza;
- collegare waypoint, rotta, fondale e YAML;
- riconoscere il ruolo del laboratorio campioni e del verricello CTD;
- comprendere le fasi di una stazione oceanografica;
- interpretare un profilo verticale di temperatura e salinità;
- spiegare la relazione fra decisione, evidenza e conseguenza.

## Parametri della missione

| Parametro | Valore |
| --- | --- |
| ID | `north-sea-mission-01` |
| Data osservativa | 1 giugno 2024 |
| Porto | Den Helder · 4.74° E, 52.98° N |
| Strumento | Rosetta CTD · temperatura e salinità |
| Profondità obiettivo | 30 m |
| Margine minimo | 5 m |
| Fondale minimo accettabile | 35 m |
| Velocità nave configurata | 10 kn |
| Rallentamento / accelerazione | 15 min / 15 min |
| Copertura batimetrica | 158 celle valide |
| Intervallo batimetrico | 7.1–39.0 m |
| Celle sicure | 17 celle con profondità ≥35 m |
| Campioni CTD | 15 livelli fra 0.49 e 29.44 m |

## Situazione iniziale e soluzione suggerita

| Stato | Coordinate | Fondale | Margine rispetto a 30 m | Esito |
| --- | --- | --- | --- | --- |
| NS-01 iniziale | 4.3333° E, 53.3333° N | 27.5 m | −2.5 m | Non sicuro |
| Stazione suggerita | 4.3333° E, 53.6667° N | 36.1 m | +6.1 m | Sicuro |

La stazione suggerita è una soluzione didattica, non l’unica cella sicura. La carta rende visibili la zona operativa e i valori disponibili affinché lo studente possa scegliere autonomamente.

## Regole

Una posizione è valutabile solo se cade dentro una cella batimetrica realmente presente. Essere dentro il rettangolo geografico complessivo non è sufficiente.

La regola di sicurezza è:

```text
fondale − profondità_obiettivo ≥ margine_minimo
```

Per la missione:

```text
fondale − 30 m ≥ 5 m
```

La partenza è autorizzata quando:

1. la stazione è coperta e sicura;
2. il laboratorio campioni è stato ispezionato;
3. il verricello CTD è stato ispezionato;
4. non esiste una bozza YAML invalida che blocca il workspace.

## Sequenza operativa

| Fase | Azione | Concetto |
| --- | --- | --- |
| Planning | Scelta stazione e ispezioni | Disegno e sicurezza |
| Underway | Navigazione verso NS-01 | Rotta e tempo nave |
| Stationkeeping | Mantenimento della posizione | Stabilità della misura |
| Lowering | Calata della rosetta | Profondità e cavo |
| Sampling | Acquisizione del profilo | Colonna d’acqua |
| Recovering | Recupero e trasferimento | Integrità del campione |
| Completed | Debrief | Decisione, evidenza, conseguenza |

## Elementi dell’interfaccia

### Carta

- base geografica OpenStreetMap;
- celle batimetriche Copernicus pre-elaborate;
- isobate a 10, 20, 30 e 35 m;
- scandagli selezionati per leggibilità;
- limite delle celle disponibili;
- zona operativa ≥35 m;
- rotta Den Helder → NS-01 → Den Helder;
- waypoint trascinabile e accessibile da tastiera.

### Nave

- **Motori** — propulsione e generazione elettrica;
- **Plancia** — navigazione, rotta e stationkeeping;
- **Laboratorio campioni / wet lab** — ambiente lavabile per trattare acqua e campioni recuperati;
- **Verricello CTD** — controllo del cavo e della profondità della rosetta.

### Workspace

Mappa, YAML, terminale e pannello file osservano la stessa spedizione. Una modifica valida incrementa la revisione; una bozza YAML invalida viene conservata ma non applicata.

## Dati

La missione usa subset Copernicus autenticati e pre-elaborati. Il browser non effettua download né calcoli oceanografici live. I dettagli sono in [Integrità scientifica e provenienza](scientific-integrity.md).

## Limiti della vertical slice

- una sola stazione scientifica e un solo strumento;
- rotta e fasi operative rappresentate con un modello didattico semplificato;
- nessuna deriva reale durante stationkeeping;
- nessun job OceanParcels o HPC;
- terminale controllato, non shell reale;
- profilo e batimetria sono uno snapshot versionato, non una previsione corrente;
- la carta non è destinata alla navigazione reale.

## Criterio di accettazione didattica

La missione è riuscita quando lo studente può spiegare non soltanto **dove** ha spostato NS-01, ma **perché** il nuovo fondale è compatibile con 30 m di campionamento e 5 m di margine, e dove tale decisione compare nello YAML.
