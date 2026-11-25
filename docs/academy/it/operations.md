# Sviluppo, verifica e distribuzione

**Lingua:** Italiano · [English](../en/operations.md)

## Requisiti locali

- Node.js 24 o successivo;
- npm;
- browser Chromium per gli smoke test;
- Docker con Compose per costruire l’immagine di produzione.

## Avvio locale

Dalla radice della repository:

```powershell
npm --prefix web install
npm --prefix web run dev
```

La demo è disponibile, per impostazione predefinita, su `http://127.0.0.1:5173/`.

## Verifica

```powershell
npm --prefix web run typecheck
npm --prefix web run test -- --run
npm --prefix web run build
```

Lo smoke browser deve verificare almeno:

1. briefing e ingresso nella sala operativa;
2. presenza della carta, dei 19 scandagli selezionati e del limite dati;
3. assenza di pannelli sovrapposti alla carta;
4. cockpit e tre compartimenti dello scafo cliccabili;
5. tre pannelli operativi accanto alla nave;
6. suggerimento di stazione con fondale 36.1 m e margine 6.1 m;
7. ispezione di laboratorio e verricello;
8. ciclo completo fino al debrief.

Lo script `web/e2e/mission-smoke.mjs` è il punto previsto per automatizzare questo controllo. Le sue asserzioni di layout devono essere aggiornate insieme a ogni riorganizzazione strutturale dell’interfaccia.

## Build container

```bash
export ACADEMY_VERSION=$(git rev-parse --short HEAD)
docker compose -f deploy/vps/compose.yaml build web
```

L’immagine risultante è `virtualship-academy:<commit-breve>`.

## Produzione attuale

- URL: `https://yazvmoracle.duckdns.org/virtualship/`
- endpoint pubblico di salute: `https://yazvmoracle.duckdns.org/virtualship/healthz`
- branch distribuito: `demo`
- repository sul VPS: `/home/ubuntu/virtualship-academy`
- container: `virtualship-academy-web`
- rete esterna Docker: `virtualship_academy_gateway`

La pagina principale è protetta da autenticazione HTTP Basic. Una risposta `401` senza credenziali è attesa; `/healthz` deve restituire `200` e `ok`.

## Deploy

Sul VPS:

```bash
cd /home/ubuntu/virtualship-academy
git pull --ff-only origin demo
export ACADEMY_VERSION=$(git rev-parse --short HEAD)
docker compose -f deploy/vps/compose.yaml build web
docker compose -f deploy/vps/compose.yaml up -d web
docker inspect --format '{{.Config.Image}} {{.State.Status}} {{.State.Health.Status}}' virtualship-academy-web
```

Verifica esterna:

```bash
curl -fsS https://yazvmoracle.duckdns.org/virtualship/healthz
```

Il deploy è riuscito soltanto quando commit locale, `origin/demo`, commit sul VPS, tag dell’immagine e stato healthy sono coerenti.

## Rollback

Le immagini sono versionate con il commit breve. Se l’immagine precedente è ancora presente:

```bash
cd /home/ubuntu/virtualship-academy
export ACADEMY_VERSION=<commit-precedente>
docker compose -f deploy/vps/compose.yaml up -d web
```

Verificare nuovamente container e `/healthz`. Il rollback dell’immagine non modifica automaticamente la working copy Git del server; la differenza deve essere documentata durante l’incidente.

## Segreti

Il file di autenticazione viene montato nel container come `/run/secrets/academy.htpasswd`. Password, file `.env` locali e credenziali Copernicus:

- non devono essere aggiunti a Git;
- non devono apparire in log, screenshot o documentazione;
- non devono essere copiati nel bundle web;
- devono essere gestiti soltanto sul sistema autorizzato.

## Proprietà operative del container

- filesystem in sola lettura;
- directory temporanea in `tmpfs`;
- utente Nginx non privilegiato;
- capability eliminate;
- `no-new-privileges`;
- restart automatico `unless-stopped`;
- health check interno su `127.0.0.1:8080/healthz`.

## Diagnostica essenziale

| Sintomo | Controllo |
| --- | --- |
| `/healthz` non risponde | Stato container, log Nginx, rete gateway. |
| Pagina principale restituisce `401` | Atteso senza autenticazione; verificare il secret solo sul server. |
| Mappa senza base geografica | Connettività verso i tile OpenStreetMap; i dati missione restano locali. |
| Waypoint non modificabile | Fase diversa da planning oppure bozza YAML invalida. |
| Pulsante partenza disabilitato | Stazione non sicura, ispezioni mancanti o workspace bloccato. |
| Profondità `–` | Waypoint fuori dalle celle Copernicus disponibili. |
| Layout cambiato ma smoke fallisce | Riallineare le asserzioni visive all’intento documentato, non disabilitarle. |
