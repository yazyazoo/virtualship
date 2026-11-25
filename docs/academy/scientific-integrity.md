# Integrità scientifica e provenienza

## Principio

Ogni elemento deve dichiarare se è **osservato/modellato da una fonte esterna**, **derivato localmente**, **simulato a fini didattici** o **pianificato**. Una visualizzazione convincente non deve far sembrare reale ciò che non lo è.

## Classificazione della vertical slice

| Elemento | Classificazione | Nota |
| --- | --- | --- |
| Batimetria Missione 01 | Copernicus reale pre-elaborato | Variabile `deptho`, subset versionato. |
| Profilo temperatura/salinità | Copernicus reale pre-elaborato | Variabili `thetao` e `so`, data osservativa versionata. |
| Scandagli e isobate | Derivati | Calcolati nel browser dalle celle pre-elaborate. |
| Zona sicura ≥35 m | Derivata | Obiettivo 30 m + margine 5 m. |
| Valutazione del waypoint | Derivata | Usa la cella valida che copre la posizione. |
| Base geografica | Servizio cartografico | Tile OpenStreetMap, non batimetria scientifica. |
| Rotta e metriche | Derivate dalla configurazione | Distanza haversine; durata dalla schedule quando presente. |
| Fasi nave e animazioni | Simulazione didattica | Non sono un digital twin dinamico della nave. |
| Terminale Academy | Simulazione controllata | Non avvia processi VirtualShip reali. |
| Parcels Lab | Mock dichiarato | Nessun job remoto viene inviato. |

## Provenienza Missione 01

| Campo | Valore |
| --- | --- |
| Provider | Copernicus Marine Service |
| Dataset batimetrico | `cmems_mod_glo_phy_my_0.083deg_static` |
| Dataset colonna d’acqua | `cmems_mod_glo_phy_my_0.083deg_P1D-m` |
| Variabili | `deptho`, `thetao`, `so` |
| Data osservativa | `2024-06-01` |
| Elaborazione | Subset geografico e temporale autenticato; nessun calcolo oceanografico nel browser |
| Stato | `verified-copernicus-subset` |
| Recuperato | `2026-11-25T14:51:51.053587+00:00` |
| Copernicus Marine Toolbox | `2.5.2` |

Checksum SHA-256 dei file sorgente usati nella pipeline:

```text
north-sea-bathymetry.nc
efe59db6165aad273a0e0c8a4b133ad8232ab744d779d8498c97efb191c8aed8

north-sea-water-column.nc
d6f7df66e5518d4f5a9c5c0cb0f07627c91d0f5976c33d984a3011a6bd2c3123
```

I file NetCDF grezzi non devono essere ricostruiti da valori copiati dalla UI. I checksum consentono di verificare gli input della pipeline autorizzata.

## Trasformazioni documentate

- selezione dell’area del Mare del Nord meridionale;
- selezione della data osservativa;
- rimozione delle celle non valide o terrestri;
- conversione della profondità in metri positivi verso il basso per la presentazione;
- serializzazione di 158 celle batimetriche;
- scelta di 15 livelli CTD disponibili fino a 29.44 m;
- calcolo client-side di bande, contorni e limite delle celle;
- selezione sparsa degli scandagli per evitare sovrapposizioni.

## Accuratezza e uso corretto

La carta Academy è una rappresentazione pedagogica. Non è una carta nautica ufficiale, non include tutti i pericoli e non deve essere usata per navigazione, pianificazione reale o sicurezza in mare.

La profondità assegnata a un waypoint rappresenta la cella del dataset che lo copre. Non è una misura puntuale del fondale e non implica accuratezza centimetrica. La risoluzione, la data e la natura del prodotto devono accompagnare ogni interpretazione.

## Regole editoriali

Ogni nuova missione deve documentare:

1. provider, prodotto, versione e variabili;
2. data o intervallo temporale;
3. dominio geografico e risoluzione;
4. procedura di subset e trasformazione;
5. checksum degli input o identificatori equivalenti;
6. cosa viene calcolato nel browser;
7. cosa è simulato per l’esperienza didattica;
8. limiti d’uso e incertezza rilevante.

Le etichette consigliate nell’interfaccia sono:

- **Dati reali pre-elaborati**;
- **Derivato da dati Copernicus**;
- **Simulazione didattica**;
- **Funzione pianificata / non collegata**.

## Credenziali e riproducibilità

Le credenziali Copernicus non fanno parte del dataset, dei metadati o della documentazione. La riproducibilità si basa su identificatori di prodotto, parametri, timestamp, versioni degli strumenti e checksum, non sulla condivisione di account o segreti.
