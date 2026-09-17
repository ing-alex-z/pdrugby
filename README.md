# MaterialePdRugby V0.4

Inventario web statico della squadra di wheelchair rugby.

## Contenuti

- schede giocatori
- avatar giocatori
- schede carrozzine
- specifiche ruote
- corrimano
- componenti/configurazioni condivise
- borse personali
- inventario materiale
- contenitori e mappa
- ruote censite
- check-list in sola lettura

## Immagini

I percorsi sono già impostati in `data.js`. Caricare i file nelle cartelle `images/` seguendo i nomi indicati nei commenti all'inizio del file.

## Privacy / login

**Non usare un semplice password gate scritto in JavaScript come protezione reale.** Essendo un sito statico, dati e codice sarebbero comunque scaricabili.

Per non rendere l'inventario pubblico, usare un livello di autenticazione davanti al sito, ad esempio Cloudflare Access. La guida completa è in `SECURITY.md`.

## GitHub

GitHub può rimanere il repository del progetto e del codice. Attenzione: GitHub documenta che i siti GitHub Pages sono pubblicamente disponibili su Internet anche quando il repository è privato, nelle configurazioni in cui Pages è disponibile.
