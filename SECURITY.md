# Protezione dell'Inventario

## Accesso Temporaneo Client-Side
L'app utilizza un'autenticazione lato client tramite hash cryptographic SHA-256 (`crypto.subtle`). 
La password non è mai scritta in chiaro nel codice JS.

## Raccomandazione per Protezione Avanzata (Cloudflare Access)
Essendo un sito statico hosted su GitHub Pages, se si desidera una protezione rigorosa in cui il codice/dati non siano visibili nell'ispeziona elemento degli sviluppatori, è consigliato attivare **Cloudflare Access** davanti a GitHub Pages (vedi dettagli nelle versioni precedenti).