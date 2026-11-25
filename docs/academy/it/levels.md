# Livelli e progressione

**Lingua:** Italiano · [English](../en/levels.md)

## Modello di progressione

I quattro livelli non rappresentano soltanto “facile, medio, difficile”. Cambiano il tipo di responsabilità assegnata allo studente:

| Dimensione | Triennale | Magistrale | Tesi Parcels | Flying Dutchman — Master |
| --- | --- | --- | --- | --- |
| Ruolo | Operatore guidato | Responsabile di spedizione | Ricercatore autonomo | Capo missione in condizioni avverse |
| Tutor | Esplicito e reversibile | Su richiesta e diagnostico | Minimo, centrato sui metodi | Nessuna soluzione diretta |
| Interfaccia dominante | GUI con ponte verso YAML | GUI + YAML | YAML + notebook + CLI | Tutte, con informazioni incomplete |
| Scala | Una stazione, uno strumento | Più stazioni e strumenti | Esperimento riproducibile | Campagna complessa e incidenti concatenati |
| Dati | Curati e pre-elaborati | Più prodotti e qualità variabile | Dati e simulazioni di ricerca | Dati incompleti, ritardi e vincoli dinamici |
| Valutazione | Sicurezza e comprensione | Disegno e trade-off | Metodo, analisi e provenienza | Priorità, resilienza e difesa delle decisioni |
| Stato attuale | **Implementato in Missione 01** | Pianificato | Pianificato | Pianificato |

## Livello 1 — Triennale

### Identità

È il livello di ingresso. Introduce il lessico della spedizione e rende visibile la catena fra decisione geografica, configurazione e operazione di bordo. Il giocatore non deve già conoscere YAML, terminale o modellistica oceanografica.

### Obiettivi didattici

- riconoscere porto, rotta, waypoint, stazione e copertura dati;
- leggere scandagli e isobate;
- distinguere profondità del fondale, obiettivo CTD e margine di sicurezza;
- identificare plancia, motori, laboratorio campioni e verricello;
- comprendere perché una configurazione YAML documenta le scelte della GUI;
- seguire correttamente la sequenza di calata, campionamento e recupero;
- interpretare un profilo verticale elementare di temperatura e salinità.

### Struttura delle missioni

Le missioni presentano una domanda e un vincolo principale alla volta. I dati sono curati, la copertura è visibile e il tutor fornisce:

- checklist operative;
- spiegazione del perché;
- undo;
- suggerimento di una soluzione sicura;
- messaggi di errore direttamente collegati al concetto da apprendere.

### Missione rappresentativa

**Missione 01 — Stazione CTD nel Mare del Nord**: spostare NS-01 su un fondale di almeno 35 m, ispezionare laboratorio e verricello, eseguire una calata a 30 m e osservare il profilo Copernicus.

### Criteri di completamento

- stazione coperta e sicura;
- sistemi necessari ispezionati;
- configurazione valida;
- missione completata senza contatto con il fondale;
- debrief letto o discusso.

### Evidenze per il docente

Posizione scelta, revisione YAML, audit delle azioni, compartimenti ispezionati, fasi raggiunte e capacità di spiegare la differenza fra 30 m e 35 m.

## Livello 2 — Magistrale

### Identità

Il giocatore diventa responsabile del disegno di campionamento. Non cerca più una singola soluzione valida: confronta alternative scientificamente difendibili sotto vincoli di tempo nave, copertura, meteo e costo computazionale.

### Obiettivi didattici

- tradurre un’ipotesi in una strategia multi-stazione;
- scegliere fra CTD, XBT, ADCP, drifter, Argo e sensori underway;
- valutare risoluzione spaziale e temporale;
- bilanciare qualità del campionamento, durata della rotta e risorse;
- confrontare prodotti Copernicus e periodi osservativi;
- riconoscere bias, lacune, risoluzione e incertezza;
- modificare YAML in modo consapevole e recuperare da errori di schema.

### Struttura delle missioni

- transect costiero–offshore o attraverso un fronte;
- più stazioni con priorità diverse;
- scelta degli strumenti e dei sensori;
- finestre temporali o meteo;
- budget di ore nave e calcolo;
- dati non uniformi per qualità o copertura;
- confronto finale fra almeno due piani.

Il tutor non indica la stazione corretta. Evidenzia incoerenze, chiede una motivazione e offre strumenti diagnostici. I suggerimenti hanno un costo didattico visibile nella rubrica, non una penalità arcade.

### Fallimenti significativi

- campionamento insufficiente a verificare l’ipotesi;
- rotta valida ma incompatibile con il tempo disponibile;
- strumento inadatto alla variabile o alla scala;
- stazioni sicure ma fuori copertura scientifica utile;
- YAML formalmente valido ma metodologicamente incoerente.

### Criteri di completamento

Un piano è completato quando è sicuro, eseguibile, coerente con l’ipotesi e accompagnato da una breve giustificazione comparativa. Non è necessario che coincida con un’unica soluzione predisposta.

### Evidenze per il docente

Confronto fra scenari, motivazione della scelta, tempo nave, distribuzione delle stazioni, selezione strumentale, qualità dei dati e revisione finale del piano.

## Livello 3 — Tesi Parcels

### Identità

È il passaggio dal serious game al workflow di ricerca. La missione diventa un esperimento riproducibile collegato a VirtualShip e OceanParcels. Il prodotto guida il metodo, non l’esito scientifico.

### Obiettivi didattici

- formulare domanda, ipotesi e piano di analisi;
- scegliere prodotto, dominio, periodo e variabili;
- costruire o adattare configurazioni VirtualShip versionate;
- comprendere FieldSet, particelle, kernel e output Parcels;
- stimare costo di memoria e calcolo;
- inviare, monitorare e documentare job quando il backend sarà disponibile;
- analizzare risultati con notebook riproducibili;
- registrare software, parametri, checksum, fonti e limiti;
- distinguere verifica tecnica, validazione scientifica e interpretazione.

### Struttura delle missioni

Le missioni sono brief di ricerca aperti. Possono includere:

- confronto fra esperimento virtuale e osservazioni;
- traiettorie di drifter o Argo;
- sensibilità a periodo, risoluzione o parametrizzazione;
- repliche con semi o condizioni diverse;
- gestione di output voluminosi;
- revisione tra pari di configurazioni e notebook.

### Interfaccia

YAML, terminale e notebook diventano centrali. La GUI rimane uno strumento di ispezione e controllo, non il luogo esclusivo della progettazione. Eventuali job remoti devono mostrare stato, risorse, log e artefatti senza esporre credenziali.

### Criteri di completamento

- repository o pacchetto di progetto riproducibile;
- configurazione validata;
- provenienza completa;
- analisi eseguibile da un’altra persona;
- discussione dell’incertezza e dei limiti;
- conclusioni proporzionate alle prove.

### Evidenze per il docente o supervisore

Commit, configurazioni, log, output selezionati, notebook, figure, ambiente software, README di riproduzione e riflessione metodologica.

## Livello 4 — Flying Dutchman — Master

### Identità

È il livello capstone. “Master” indica padronanza operativa e scientifica, non un titolo accademico aggiuntivo. Il giocatore guida una campagna in cui informazioni, risorse e sistemi possono degradarsi. La difficoltà deriva da conflitti autentici fra priorità, non da comandi nascosti o casualità punitiva.

### Obiettivi didattici

- mantenere sicurezza, integrità scientifica e tracciabilità sotto pressione;
- distinguere obiettivi essenziali, desiderabili e sacrificabili;
- aggiornare il piano quando cambiano meteo, strumenti, dati o tempi;
- diagnosticare errori concatenati senza compromettere le prove già raccolte;
- coordinare ruoli scientifici, tecnici e di plancia;
- documentare deviazioni dal protocollo;
- difendere decisioni in un debrief strutturato.

### Struttura delle missioni

Una campagna può combinare:

- perdita parziale di copertura o ritardo del prodotto dati;
- guasto a sensore, verricello o propulsione;
- deriva durante stationkeeping;
- finestra meteo che si chiude;
- job remoto fallito o output incompleto;
- conflitto fra due obiettivi scientifici;
- richiesta tardiva di una nuova stazione;
- anomalia che può essere segnale reale oppure artefatto.

Gli eventi devono essere generati da regole dichiarabili e registrati nell’audit. La casualità non deve rendere una missione impossibile senza alternative.

### Tutor e feedback

Il tutor non propone la soluzione. Offre documentazione, stato dei sistemi, log e strumenti di verifica. Il feedback immediato riguarda sicurezza e validità formale; la qualità strategica emerge nel debrief.

### Criteri di completamento

Il successo non richiede di salvare ogni obiettivo. Richiede che il giocatore:

- protegga persone, nave, strumenti e integrità dei dati;
- mantenga un piano coerente con le risorse residue;
- renda espliciti compromessi e deviazioni;
- conservi una catena di provenienza utilizzabile;
- presenti una difesa finale basata sulle evidenze.

### Evidenze per la valutazione

Timeline degli eventi, decision log, revisioni della configurazione, uso delle risorse, dati salvati o scartati, incident report, giustificazione finale e piano di riproduzione.

## Sblocco e adattamento

La progressione consigliata richiede il completamento di almeno una missione rappresentativa e la dimostrazione delle competenze del livello precedente. Un docente può assegnare direttamente un livello, ma la Academy dovrebbe mostrare quali prerequisiti vengono dati per acquisiti.

L’adattamento non deve abbassare gli standard scientifici. Può cambiare quantità di supporto, tempo, complessità dell’interfaccia, numero di stazioni e forma della consegna.
