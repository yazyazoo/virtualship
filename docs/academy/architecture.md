# Architettura tecnica

## Ambito

La repository contiene due prodotti collegati ma distinti:

1. **VirtualShip upstream** — pacchetto Python e CLI per simulazioni oceanografiche.
2. **VirtualShip Academy vertical slice** — applicazione web in `web/`, attualmente autonoma e basata su dati pre-elaborati.

La Academy non sostituisce il simulatore upstream. Costruisce un’interfaccia didattica e un modello di interazione destinati a collegarsi progressivamente ai servizi reali.

## Stack della vertical slice

| Area | Tecnologia |
| --- | --- |
| Linguaggio | TypeScript |
| UI | Web Components nativi |
| Build | Vite |
| Carta | MapLibre GL 6.5 |
| Configurazione | YAML |
| Test | Vitest + jsdom |
| Smoke browser | Playwright Core con browser Chromium installato |
| Runtime produzione | Nginx in container Docker |

## Flusso dello stato

```text
                 ┌──────────────────┐
                 │ DemoWorkspace    │
                 │ expedition.yaml  │
                 │ revision + audit │
                 └────────┬─────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
       Mappa            Editor YAML     Terminale/File
          │               │                │
          └──── aggiornamenti validati ────┘
                          │
                          ▼
                 Valutazione stazione
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
        Mission state               Nave/CTD
```

`DemoWorkspace` è la fonte autorevole della spedizione. Espone copie strutturate, serializza lo YAML, valida le modifiche e notifica i componenti. Non esistono copie indipendenti per GUI e terminale.

## Stati della missione

La macchina a stati interattiva mantiene:

- fase corrente;
- sicurezza della stazione;
- sezioni della nave ispezionate;
- visibilità del tutor;
- cronologia per l’undo.

Le transizioni operative sono intenzionalmente esplicite:

```text
planning → underway → stationkeeping → lowering
         → sampling → recovering → completed
```

## Responsabilità dei moduli principali

| Percorso | Responsabilità |
| --- | --- |
| `web/src/app.ts` | Composizione, lingua, modalità, eventi e sincronizzazione. |
| `web/src/workspace/demo-workspace.ts` | Stato condiviso, revisioni, audit e validazione YAML. |
| `web/src/map/operational-map.ts` | Carta, waypoint, rotta e aggiornamento geografico. |
| `web/src/map/bathymetry-visuals.ts` | Bande, isobate, limite celle e selezione scandagli. |
| `web/src/mission/rules.ts` | Cella più vicina, copertura effettiva, margine e sicurezza. |
| `web/src/mission/mission-machine.ts` | Gate e transizioni della missione. |
| `web/src/ship/ship-cutaway.ts` | Nave, compartimenti, CTD, pannelli di stato e profilo. |
| `web/src/sidebar/developer-sidebar.ts` | Tutor, terminale, YAML e file. |
| `web/src/sidebar/controlled-terminal.ts` | Comandi didattici consentiti e rifiuto della shell. |
| `web/src/demo/mission-dataset.json` | Snapshot scientifico e metadati della Missione 01. |

## Contratti importanti

### Aggiornamento del waypoint

1. L’utente sposta NS-01.
2. La mappa valuta la posizione rispetto alle celle disponibili.
3. `sea_depth_meter` viene aggiornato o impostato a `null` fuori copertura.
4. Il workspace incrementa la revisione.
5. Mappa, nave, tutor e YAML si ridisegnano sullo stesso stato.

### Bozza YAML invalida

1. Il testo viene conservato come bozza non applicata.
2. La GUI viene bloccata per evitare sovrascritture implicite.
3. Terminale e tutor spiegano il problema.
4. Lo studente corregge o archivia la bozza.

### Terminale

Il terminale riconosce soltanto comandi esplicitamente implementati. Rifiuta metacaratteri, redirezioni e comandi di sistema. `virtualship run` avvia la missione precompilata: non esegue il pacchetto Python né un processo esterno.

## Sicurezza della distribuzione

Il container di produzione:

- usa filesystem di root in sola lettura;
- esegue Nginx come utente non privilegiato;
- rimuove tutte le capability Linux;
- abilita `no-new-privileges`;
- monta il file di autenticazione in sola lettura;
- espone un endpoint `/healthz` senza autenticazione;
- applica header di sicurezza essenziali.

## Evoluzione prevista

Il collegamento futuro a servizi reali dovrebbe preservare il contratto dell’interfaccia:

```text
Browser → API/Gateway autenticato → coda job → Spider/Slurm
                                     │
                                     └→ storage risultati e log
```

Credenziali Copernicus e HPC devono rimanere sul lato server. Il browser riceve job ID, stato, log filtrati e riferimenti agli artefatti, mai segreti o accesso shell.

## Strategia di test

- unit test per regole geografiche, macchina a stati e validazione;
- component test per Web Components e sincronizzazione;
- integration test per flusso GUI/YAML/missione;
- build TypeScript come gate statico;
- smoke browser per layout, mappa e ciclo completo;
- health check del container e dell’endpoint pubblico dopo il deploy.
