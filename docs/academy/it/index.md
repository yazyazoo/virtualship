# VirtualShip Academy

**Lingua:** Italiano · [English](../en/index.md)

VirtualShip Academy è l’ambiente didattico interattivo di VirtualShip. Trasforma la progettazione di una spedizione oceanografica in un **serious game accademico**: lo studente prende decisioni operative, ne osserva la rappresentazione in una configurazione riproducibile e collega ogni scelta a dati, strumenti e conseguenze scientifiche.

Questa sezione documenta la Academy e la vertical slice browser. La documentazione del simulatore Python VirtualShip upstream rimane nella [User Guide](../../user-guide/index.md).

## Stato del prodotto

| Area | Stato | Sintesi |
| --- | --- | --- |
| Missione 01 · Stazione CTD nel Mare del Nord | **Implementata** | Ciclo completo da briefing a debrief con dati Copernicus pre-elaborati. |
| Livello Triennale | **Vertical slice giocabile** | Tutor reversibile, mappa, nave, YAML, terminale controllato e file. |
| Livello Magistrale | **Pianificato** | Spedizioni multi-stazione, scelte strumentali e confronto tra scenari. |
| Livello Tesi Parcels | **Pianificato** | Workflow di ricerca, OceanParcels, analisi e provenienza estesa. |
| Flying Dutchman — Master | **Pianificato** | Missioni capstone con informazione incompleta, incidenti e autonomia elevata. |
| Parcels Lab remoto | **Mock esplicito** | L’interfaccia esiste, ma non invia job a Spider/Slurm. |
| Backend Copernicus/Parcels live nel browser | **Non collegato** | La demo usa subset scientifici pre-elaborati e versionati. |

## Documenti

```{toctree}
:maxdepth: 2

vision
game-design
levels
mission-01
architecture
scientific-integrity
operations
roadmap
glossary
```

## Principio guida

La Academy non nasconde il modello scientifico dietro una metafora di gioco. L’interfaccia grafica, `expedition.yaml` e i comandi VirtualShip sono tre viste dello stesso progetto:

> **GUI → YAML → CLI → evidenza scientifica**

La GUI riduce la barriera d’ingresso, lo YAML rende le decisioni ispezionabili e versionabili, il terminale rende esplicite le operazioni. La progressione dei livelli riduce gradualmente l’assistenza e aumenta la responsabilità scientifica dello studente.
