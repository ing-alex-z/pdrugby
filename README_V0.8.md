# PdRugby Inventory — V0.8

## Obiettivo
V0.8 aggiunge una gestione dati semplice: l'inventario viene modificato sul dispositivo e può essere esportato come database `data.js` aggiornato, senza API GitHub o sincronizzazione multiutente.

## File da sostituire / aggiungere
- `app.js` → sostituire
- `index.html` → sostituire
- `style_v07.css` → mantenere dalla V0.7
- `style_v08.css` → aggiungere
- `data.js` → **NON sostituire** con questo pacchetto: usare quello già presente nel repository
- `style.css` → **NON modificare**

## Nuove funzioni
- Esporta `data.js` aggiornato
- Esporta JSON con sole modifiche
- Esporta backup JSON completo
- Importa backup JSON
- Pagina `Dati / Export`
- Layout mobile più verticale
- Sidebar più compatta
- Scheda giocatore mobile più compatta e orientata ai dati; foto mantenute come elemento secondario

## Flusso consigliato
1. Modificare le quantità da `Borse` / `Inventario`.
2. Aprire `Dati / Export`.
3. Premere **Esporta data.js aggiornato**.
4. Caricare il file generato nel repository GitHub, sostituendo il `data.js` master.
5. GitHub Pages aggiornerà l'app.

Il JSON completo è utile come backup. Il JSON delle sole modifiche è utile come registro/trasmissione, ma non sostituisce `data.js`.

## Nota
Le modifiche locali usano `localStorage` del browser. Non c'è sincronizzazione automatica tra utenti.
