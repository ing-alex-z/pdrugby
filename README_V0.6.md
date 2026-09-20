# PDRugby Inventory — V0.6

V0.6 di consolidamento.

## Modifiche principali

- Login SHA-256 corretto per `pdrugby2026`.
- Spazi nella password ignorati.
- Gestione più pulita degli errori e del pulsante di accesso.
- Logout mantenuto tramite `sessionStorage`.
- Compatibilità con il formato dati precedente.
- `accessories` normalizzato verso una struttura estendibile.
- `handrim`/corrimano normalizzato verso una struttura estendibile.
- Ricerca giocatori centralizzata.
- Indici temporanei per lo stock, evitando scansioni ripetute.
- Cache-busting `?v=0.6` per CSS/JS.
- Grafica e struttura generale mantenute.

## Nota sicurezza

Il login è una protezione client-side adatta a tenere lontani utenti casuali.
Non è autenticazione server-side: i dati presenti in `data.js` restano tecnicamente
scaricabili da chi conosce il repository o gli URL degli asset.

## File da sostituire

- `app.js`
- `data.js`
- `index.html`

`style.css` non necessita di modifiche per questa versione.
