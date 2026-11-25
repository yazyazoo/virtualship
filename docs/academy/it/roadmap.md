# Roadmap

**Lingua:** Italiano · [English](../en/roadmap.md)

## Principio

Ogni milestone deve produrre un incremento didatticamente valutabile. Aggiungere schermate senza una competenza, una prova e un criterio di completamento non costituisce avanzamento della Academy.

## Stato al 25 novembre 2026

### Completato — Vertical slice Missione 01

- briefing e debrief bilingui;
- carta MapLibre con subset Copernicus reale pre-elaborato;
- copertura effettiva, isobate, scandagli e fascia sicura;
- waypoint, rotta e metriche sincronizzati;
- nave sezionata con cockpit e descrizioni;
- tutor reversibile e undo;
- workspace unico GUI/YAML/terminale/file;
- validazione e recupero di bozze YAML;
- terminale controllato;
- ciclo missione completo;
- build container hardened e deploy versionato.

## Milestone A — Consolidare il livello Triennale

### Obiettivo

Trasformare la vertical slice in una base ripetibile per più missioni introduttive.

### Lavoro

- registro missioni e selezione dall’interfaccia;
- schema dati missione documentato e validato;
- pipeline riproducibile per generare subset scientifici;
- riallineamento dello smoke browser al layout corrente;
- audit WCAG con tastiera, contrasto e screen reader;
- rubriche per docenti ed export delle evidenze;
- salvataggio e ripresa della sessione;
- almeno tre missioni: CTD, transect e strumento underway;
- gestione esplicita della disponibilità del basemap online.

### Criterio di uscita

Un docente può assegnare una missione, uno studente può completarla senza assistenza tecnica e il risultato contiene evidenze interpretabili.

## Milestone B — Livello Magistrale

### Obiettivo

Supportare disegni multi-stazione e confronti fra strategie.

### Lavoro

- più waypoint e stazioni scientifiche;
- configurazione di strumenti e sensori;
- budget di tempo nave e costo computazionale;
- confronto affiancato fra scenari;
- prodotti Copernicus multipli con metadati di qualità;
- meteo e finestre operative semplificate;
- tutor diagnostico anziché prescrittivo;
- rubrica su ipotesi, campionamento, trade-off e incertezza.

### Criterio di uscita

Due piani differenti possono essere entrambi validi, confrontati e valutati attraverso una giustificazione scientifica tracciabile.

## Milestone C — Gateway e job reali

### Obiettivo

Collegare l’interfaccia a esecuzioni autorizzate senza trasferire segreti nel browser.

### Lavoro

- API autenticata;
- gestione utenti e ruoli;
- validazione server-side delle configurazioni;
- coda job e quote;
- adapter Spider/Slurm;
- stato, log filtrati, cancellazione e retry;
- storage di input, output e metadati;
- audit e politiche di retention;
- threat model e revisione della sicurezza.

### Criterio di uscita

Un job può essere inviato, monitorato, riprodotto e attribuito senza esporre credenziali Copernicus o HPC.

## Milestone D — Livello Tesi Parcels

### Obiettivo

Fornire un workflow di ricerca riproducibile dalla domanda al risultato.

### Lavoro

- integrazione con VirtualShip e OceanParcels reali;
- ambienti software versionati;
- notebook e template di analisi;
- gestione di esperimenti e repliche;
- confronto con osservazioni;
- report automatico di provenienza;
- revisione tra pari e supervisione docente;
- export di un research package completo.

### Criterio di uscita

Un altro ricercatore può ricostruire configurazione, ambiente, job, dati selezionati, analisi e figure.

## Milestone E — Flying Dutchman — Master

### Obiettivo

Valutare padronanza, resilienza e qualità della decisione in campagne complesse.

### Lavoro

- motore di eventi dichiarativo e riproducibile;
- guasti, ritardi, meteo e conflitti di priorità;
- gestione di ruoli e consegne di squadra;
- incident log e decision log;
- obiettivi essenziali e opzionali;
- debrief comparativo con replay della timeline;
- rubriche per sicurezza, scienza, risorse e provenienza;
- modalità autore per costruire scenari verificabili.

### Criterio di uscita

La valutazione può spiegare perché una strategia è stata responsabile anche quando alcuni obiettivi sono stati abbandonati.

## Debito e manutenzione continua

- mantenere coerenti documentazione, UI bilingue e dataset;
- evitare dipendenze `latest` nelle release riproducibili;
- controllare dimensione del bundle e code splitting;
- aggiornare gli smoke test quando cambia l’architettura visiva;
- eseguire revisioni periodiche di provenienza e licenze;
- definire ownership di missioni, pipeline dati e infrastruttura;
- conservare una strategia di rollback verificata.

## Fuori roadmap finché non validato

- multiplayer sincrono;
- classifica globale;
- simulazione 3D immersiva;
- navigazione reale;
- generazione automatica non supervisionata di conclusioni scientifiche.

Queste funzioni possono essere esplorate soltanto se migliorano risultati didattici misurabili e non compromettono accessibilità, sicurezza o integrità scientifica.
