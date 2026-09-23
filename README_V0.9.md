# PdRugby Inventory — V0.9

V0.9 è una revisione operativa dell'inventario PdRugby, pensata soprattutto per l'uso da smartphone.

## Novità

- dashboard più verticale e orientata a giocatori, ruote e materiali critici;
- scheda giocatore verticale: ruote/configurazione prima delle foto, che restano accessorie;
- sidebar mobile compatta;
- ricerca globale di giocatori, ruote, materiali, contenitori e dotazioni;
- contenitori annidati: una sacca può contenere altri sacchetti/contenitori;
- quantità modificabili con `− / +`;
- aggiunta di materiale tramite menu generato da `DATA.materials`;
- tag/stato materiale, compresi `Nuova` e `Usata`;
- soglie critiche configurabili per materiale;
- `0` = esaurito;
- salvataggio locale delle quantità;
- migrazione automatica delle quantità locali V0.8 alla V0.9;
- export `data.js` aggiornato, pronto per sostituire il database master nel repository;
- export delle sole variazioni in JSON;
- backup JSON completo e import del backup;
- mappa gerarchica dei contenitori.

## Dati V0.9

`data.js` include anche l'aggiornamento fornito per:

- Sacca Errea Rossa;
- Sacca Italia Blu;
- Sacchetto arancione scout come contenitore annidato della Sacca Italia Blu;
- sacchetti interni con camere 24/25";
- materiali di fissaggio/accessori e relative quantità;
- Routine nuove/usate.

## Uso dell'export

Per aggiornare il database master:

1. modificare le quantità nell'app;
2. aprire **Dati / Export**;
3. premere **Esporta data.js aggiornato**;
4. caricare il file esportato nel repository sostituendo `data.js`;
5. GitHub Pages pubblicherà il nuovo database insieme all'app.

Il file JSON completo resta utile come backup indipendente.

## Nota sui dati non quantificati

Voci come `Bandiere`, `Striscioni`, `Porta borracce`, `Ghiaccio spray` e `Spruzzino PdR` possono essere registrate come dotazione senza inventare una quantità numerica. Se in futuro verrà definita una quantità, potranno essere convertite in normali righe di stock.

## File da pubblicare

- `index.html`
- `app.js`
- `data.js`
- `style.css`
- `style_v07.css`
- `style_v08.css`
- `style_v09.css`
- cartella `images/`

Non è necessario pubblicare i file README.
