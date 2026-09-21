# PdRugby Inventory — V0.7

V0.7 parte dalla struttura reale della repository e **non richiede di sostituire `data.js`**.

## File da aggiornare

- `app.js` → versione V0.7 con modifica quantità, aggiunta materiale, soglie critiche, salvataggio locale e reveal password.
- `index.html` → interfaccia V0.7 e pulsante mostra/nascondi password.
- `style_v07.css` → nuove regole per editor inventario e miglioramenti mobile.

`style.css` esistente va mantenuto.
`data.js` esistente va mantenuto: contiene i tuoi dati aggiornati.

## Quantità

Nella pagina **Borse** ogni contenitore ha `−`, quantità e `+`.
Il pulsante `+ Aggiungi materiale` apre un menu costruito automaticamente da `DATA.materials`.

Le modifiche vengono salvate in `localStorage` del browser e quindi persistono sullo stesso dispositivo/browser.
Non modificano il file `data.js` su GitHub.

Il pulsante **Ripristina dati iniziali** cancella le modifiche locali e ricarica le quantità presenti in `data.js`.

## Soglie critiche

V0.7 include soglie iniziali per gli attuali materiali M001–M018.
Se vuoi personalizzarle direttamente in `data.js`, puoi aggiungere: 

```js
criticalThresholds: {
  M001: 5,
  M002: 2,
  M010: 3
},
```

nell'oggetto `DATA`. Questi valori hanno precedenza sui default V0.7.

- quantità > soglia → normale
- quantità > 0 e <= soglia → **SCORTA CRITICA** in rosso
- quantità = 0 → **ESAURITO** in rosso

Per materiali non critici si può usare `0`.

## Login

Aggiunto il pulsante 👁 per mostrare/nascondere la password. L'autenticazione resta quella già presente e usa SHA-256.

## Mobile

V0.7 mantiene `style.css` esistente e aggiunge `style_v07.css`, con particolare attenzione ai controlli quantità e all'uso da telefono.
