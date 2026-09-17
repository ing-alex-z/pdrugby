# Accesso privato

## Importante
Questa app è statica (HTML/CSS/JavaScript). Un login implementato solamente dentro JavaScript **non sarebbe una protezione reale**: i file e i dati potrebbero comunque essere scaricati direttamente.

Per un inventario della squadra, la protezione va quindi messa **davanti al sito**, a livello di hosting/proxy.

## Soluzione consigliata: Cloudflare Access

La configurazione consigliata per questa app è:

`GitHub (codice) → GitHub Pages / hosting statico → Cloudflare Access → utenti autorizzati`

Cloudflare Access può richiedere autenticazione prima di consentire l'accesso all'applicazione. Per una squadra è pratico usare l'autenticazione tramite e-mail/OTP, evitando una password condivisa da tutti.

### Prerequisiti

- un dominio/subdominio gestito tramite Cloudflare, ad esempio `materiale.padovarugby.it`
- il sito pubblicato su GitHub Pages oppure su altro hosting statico
- Cloudflare Zero Trust / Access configurato

### Impostazione

1. Pubblicare questa cartella come sito statico.
2. Collegare un dominio personalizzato al sito.
3. In Cloudflare: **Zero Trust → Access controls → Applications → Add an application**.
4. Creare un'applicazione **Self-hosted / private**.
5. Proteggere l'intero hostname, ad esempio `materiale.padovarugby.it`.
6. Creare una policy **Allow** per gli indirizzi e-mail dei componenti autorizzati.
7. Abilitare l'autenticazione via e-mail/OTP oppure un Identity Provider.
8. Verificare da una finestra anonima che senza autenticazione il sito non sia raggiungibile.

Cloudflare Access opera come identity-aware proxy davanti all'applicazione; le richieste vengono controllate prima di essere inoltrate all'origine.

## Protezioni aggiuntive già predisposte

- `robots.txt` disabilita l'indicizzazione dei crawler comuni.
- La UI dichiara esplicitamente la modalità **SOLA LETTURA**.

Queste ultime due misure **non sostituiscono l'autenticazione**.
