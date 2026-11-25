# Glossario

**Lingua:** Italiano · [English](../en/glossary.md)

## Academy

Ambiente didattico web che usa missioni, vincoli e feedback per insegnare la progettazione di spedizioni VirtualShip.

## Batimetria

Rappresentazione della profondità e della forma del fondale. Nella Missione 01 deriva dalla variabile Copernicus `deptho`.

## Cella valida

Area della griglia per la quale esiste un valore batimetrico utilizzabile. Un punto dentro l’estensione rettangolare del dataset può comunque essere fuori copertura se non ricade in una cella valida.

## Copertura

Insieme delle celle per cui la missione possiede dati. Non coincide con la superficie visibile della mappa di base.

## CTD

Strumento che misura **Conductivity, Temperature and Depth**. La conducibilità viene usata per derivare la salinità. Una rosetta può includere sensori aggiuntivi e bottiglie per campioni d’acqua.

## Fondale

Profondità del fondo marino nella cella che copre la stazione. Nella UI è mostrata come valore positivo in metri.

## Isobata

Linea che collega punti di uguale profondità. Nella Academy le isobate sono derivate dalla griglia e hanno funzione didattica.

## Laboratorio campioni / wet lab

Ambiente lavabile di bordo in cui vengono trattati acqua e campioni appena recuperati. È progettato con superfici, scarichi e strumenti compatibili con umidità e spruzzi.

## Margine dal fondale

Differenza fra profondità del fondale e profondità obiettivo dello strumento. Nella Missione 01 deve essere almeno 5 m.

## Missione

Unità giocabile con brief, dati, obiettivi, vincoli, criteri di completamento e debrief.

## OceanParcels

Framework per simulazioni lagrangiane oceaniche su cui si appoggia il VirtualShip upstream per strumenti e particelle mobili.

## Parcels Lab

Area prevista per workflow di ricerca e calcolo. Nella vertical slice è un mock dichiarato e non invia job reali.

## Plancia / bridge

Centro di navigazione e controllo della nave. Coordina rotta, velocità e mantenimento della posizione.

## Provenienza

Informazioni necessarie per ricostruire origine e trasformazioni di un dato: provider, prodotto, variabili, tempo, dominio, software, parametri e checksum.

## Rosetta

Struttura calata dal verricello che ospita CTD, sensori e spesso bottiglie di campionamento.

## Scandaglio

Valore numerico di profondità riportato sulla carta. La Academy ne seleziona un sottoinsieme per mantenere leggibilità.

## Serious game

Esperienza con ruolo, obiettivi, regole e feedback costruita principalmente per apprendimento o formazione, non soltanto per intrattenimento.

## Stationkeeping

Mantenimento della nave nella posizione richiesta durante un’operazione, compensando vento, onde e corrente.

## Stazione

Posizione e momento in cui la nave svolge una o più operazioni scientifiche.

## Verricello CTD

Sistema che controlla cavo, velocità e profondità della rosetta durante calata e recupero.

## Waypoint

Punto geografico della rotta. Una stazione è un waypoint con operazioni scientifiche associate.

## Workspace

Progetto condiviso che contiene la configurazione della spedizione, la revisione corrente e l’audit. GUI, YAML e terminale sono viste dello stesso workspace.
