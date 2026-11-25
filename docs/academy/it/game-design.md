# Game design

**Lingua:** Italiano · [English](../en/game-design.md)

## Premessa

Il giocatore è parte del team scientifico della **RV Virtual Explorer**. Riceve un obiettivo di ricerca, prepara nave e configurazione, sceglie dove e come campionare, esegue le operazioni e difende le proprie decisioni nel debrief.

La Academy è un serious game a missioni. La vertical slice attuale è lineare nell’esecuzione, ma lascia una decisione centrale al giocatore: scegliere una stazione CTD compatibile con obiettivo e fondale.

## Ciclo principale

1. **Briefing** — leggere domanda, area, strumento, livello e criteri di successo.
2. **Esplorazione** — osservare carta batimetrica, copertura dati, rotta, nave e configurazione.
3. **Pianificazione** — scegliere la stazione, controllare profondità e margine, ispezionare i sistemi di bordo.
4. **Validazione** — verificare che GUI e YAML rappresentino una configurazione coerente.
5. **Navigazione** — raggiungere la stazione e preparare il mantenimento della posizione.
6. **Operazione** — calare la CTD, acquisire il profilo e recuperare la rosetta.
7. **Debrief** — collegare la decisione iniziale alle prove prodotte e alle conseguenze operative.
8. **Iterazione** — ripetere, confrontare o passare a una missione più autonoma.

## Quattro viste, un solo progetto

Il tratto distintivo della Academy è la **sincronizzazione bidirezionale controllata**. Web UI, YAML, terminale e file non sono dimostrazioni separate: osservano e, quando autorizzato, modificano lo stesso `DemoWorkspace`, con revisione e audit condivisi.

### GUI

Rende spaziali e visibili le decisioni: carta, waypoint, nave, compartimenti, avanzamento e risultati.

### YAML

È la rappresentazione riproducibile della spedizione. Ogni modifica valida aggiorna lo stesso workspace della GUI. Una bozza non valida blocca le modifiche grafiche finché non viene corretta o archiviata, evitando due verità concorrenti.

### Terminale controllato

Espone un sottoinsieme didattico di comandi VirtualShip (`init`, `plan`, `run`) e semplici operazioni di lettura. Non è una shell del sistema operativo: metacaratteri e comandi pericolosi vengono rifiutati.

La direzione **Web UI → terminale** è visibile perché le modifiche grafiche aggiornano immediatamente `expedition.yaml`, `cat expedition.yaml` legge lo stato corrente e l’audit registra revisioni, ispezioni della nave e transizioni operative. La scheda Terminale e la cronologia dei comandi restano aperte durante i ridisegni della Web UI, così ogni azione accettata produce una nuova riga osservabile. La direzione **terminale → Web UI** è controllata: `virtualship init` reinizializza il progetto, `virtualship plan` apre il pianificatore YAML e `virtualship run` avvia la stessa missione applicando gli stessi gate di sicurezza. Non esistono una configurazione “grafica” e una “da terminale” indipendenti.

### File

Il pannello File rende apribili `expedition.yaml`, `checkpoint.yaml`, `results/ctd_profiles.json` e `README.md`. La vista di `expedition.yaml` legge sempre il workspace corrente; gli altri file espongono checkpoint, risultato scientifico e istruzioni del progetto in forma leggibile.

## Meccaniche attuali

| Meccanica | Comportamento | Apprendimento |
| --- | --- | --- |
| Waypoint trascinabile | Aggiorna posizione, fondale, rotta e YAML. | Una scelta geografica modifica l’intero progetto. |
| Batimetria | Scandagli, isobate, fascia sicura e limite della copertura. | Il fondale è un vincolo misurabile, non uno sfondo. |
| Margine CTD | Obiettivo 30 m + 5 m di sicurezza. | La profondità operativa non coincide con la profondità del mare. |
| Ispezione nave | Compartimenti cliccabili con descrizione. | L’operazione scientifica dipende da sistemi e persone. |
| Tutor reversibile | Può essere nascosto, ripristinato e affiancato all’undo. | L’assistenza è scaffolding, non una modalità separata. |
| YAML con revisioni | Applica, blocca o archivia bozze. | Configurazione, validazione e recupero dagli errori. |
| Sincronizzazione Web UI–terminale | Modifiche grafiche, YAML, comandi e file convergono sullo stesso workspace versionato. | Equivalenza tra rappresentazione visuale e riproducibile. |
| File apribili | Mostra configurazione corrente, checkpoint, profilo CTD e README. | Leggere gli artefatti che rendono verificabile una missione. |
| Mission state | Planning → underway → stationkeeping → lowering → sampling → recovering → completed. | La misura è una sequenza operativa, non un singolo click. |
| Debrief | Decisione → evidenza → conseguenza. | Valutazione del ragionamento oltre al completamento. |

## Successo, errore e recupero

Nella Missione 01 il giocatore può partire solo se:

- la stazione è dentro una cella Copernicus valida;
- il fondale consente 30 m di calata e 5 m di margine;
- laboratorio campioni e verricello CTD sono stati ispezionati;
- il workspace YAML non è bloccato da una bozza invalida.

Gli errori non causano un game over arbitrario. Producono un blocco spiegato, valori indisponibili o un invito alla correzione. `Undo`, suggerimento di stazione e archiviazione della bozza sono strumenti di recupero tracciabile.

## Valutazione

La vertical slice usa **gate di competenza** e un debrief, non un punteggio numerico. I livelli futuri potranno aggiungere rubriche su:

- sicurezza e validità della configurazione;
- adeguatezza del disegno di campionamento;
- uso delle risorse e tempo nave;
- qualità della giustificazione;
- gestione dell’incertezza;
- riproducibilità del progetto e dell’analisi.

Un punteggio, se introdotto, dovrà sempre essere scomponibile in queste dimensioni e non premiare scorciatoie non scientifiche.

## Accessibilità e internazionalizzazione

- interfaccia italiana e inglese;
- componenti interattivi realizzati come pulsanti e controlli da tastiera;
- focus confinato nei dialoghi di briefing e debrief;
- tutor nascondibile ma recuperabile;
- animazioni ridotte quando il sistema richiede `prefers-reduced-motion`;
- colori accompagnati da testo, valori e forme, non usati come unico segnale.
