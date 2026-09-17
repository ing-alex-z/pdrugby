// ==========================================
// CONFIGURAZIONE E STATO GLOBALE
// ==========================================
let currentView = "dashboard";
let query = "";

// Helper rapido per la selezione degli elementi DOM
const $ = function(s) {
  return document.querySelector(s);
};

// Sanitizzazione stringhe HTML per prevenire injection (XSS)
const esc = function(s) {
  return String(s ?? "").replace(/[&<>"']/g, function(c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
};

// Hash SHA-256 della password di sistema ("pdrugby2026")
const PASS_HASH = "8d3e2d6ed420f171bcbf280eebe800b77b73be2290f6b645934bc7e3da3ed69b"; 

// ==========================================
// FUNZIONI CRITTOGRAFICHE ED AUTENTICAZIONE
// ==========================================

/**
 * Calcola l'hash SHA-256 con messaggi d'errore espliciti per ambiente non sicuro o mancato supporto.
 */
async function sha256(str) {
  if (!window.crypto) {
    throw new Error("[Errore Crypto] Il browser corrente non supporta l'oggetto window.crypto.");
  }
  if (!window.crypto.subtle) {
    throw new Error("[Errore HTTPS] L'API crypto.subtle richiede una connessione sicura (HTTPS o localhost).");
  }
  
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function(b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  } catch (err) {
    throw new Error("[Errore Digest SHA-256] Impossibile elaborare l'hash: " + err.message);
  }
}

/**
 * Controlla lo stato della sessione e gestisce la visibilità della schermata di login.
 */
function checkAuth() {
  const auth = sessionStorage.getItem("pdr_auth");
  const overlay = document.getElementById("loginOverlay");
  
  if (!overlay) {
    console.warn("[Avviso DOM] Elemento '#loginOverlay' non trovato nel DOM.");
    return;
  }
  
  overlay.classList.toggle("hidden", auth === "true");
}

/**
 * Effettua il logout e aggiorna l'interfaccia.
 */
function logout() {
  sessionStorage.removeItem("pdr_auth");
  checkAuth();
}

// ==========================================
// VERIFICA E GESTIONE DATI (data.js)
// ==========================================

/**
 * Verifica esplicitamente che il file data.js sia caricato prima di eseguire query.
 */
function checkDataIntegrity() {
  if (typeof DATA === "undefined") {
    console.error("[Errore Dati] L'oggetto globale 'DATA' non esiste. Verificare che 'data.js' sia caricato prima di 'app.js'.");
    return false;
  }
  return true;
}

function mat(id) {
  if (!checkDataIntegrity()) return null;
  return DATA.materials.find(function(x) { return x.id === id; });
}

function cname(id) {
  if (!checkDataIntegrity()) return id;
  const found = DATA.containers.find(function(x) { return x.id === id; });
  return found ? found.name : id;
}

function totalStock(id) {
  if (!checkDataIntegrity()) return 0;
  return DATA.stock.filter(function(x) {
    return x.material === id;
  }).reduce(function(a, b) {
    return a + b.qty;
  }, 0);
}

function wheelConfig(p) {
  return p.wheels.diameter + "|" + p.wheels.cover;
}

function sharedPlayers(p) {
  if (!checkDataIntegrity()) return [];
  return DATA.players.filter(function(x) {
    return x.id !== p.id && wheelConfig(x) === wheelConfig(p);
  });
}

// ==========================================
// RENDERING COMPONENTI HTML
// ==========================================

function img(src, alt, cls) {
  if (!cls) cls = "";
  if (!src) return "";
  return '<img class="' + esc(cls) + '" src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" onerror="this.classList.add(\'img-missing\');if(this.nextElementSibling)this.nextElementSibling.classList.remove(\'hidden\');">';
}

function photoBox(src, alt, cls) {
  if (!cls) cls = "";
  const imgHtml = img(src, alt, "photo-img");
  const fallbackHtml = '<div class="photo-fallback hidden"><span>IMMAGINE</span><small>' + esc(src || "Percorso non impostato") + '</small></div>';
  return '<div class="photo-box ' + esc(cls) + '">' + imgHtml + fallbackHtml + '</div>';
}

function nav(view) {
  currentView = view;
  query = "";
  const s = $('#search');
  if (s) s.value = "";
  render();
  document.body.classList.remove('mobile-nav-open');
}

function pageHead(kicker, title, desc) {
  return '<div class="page-head">' +
    '<div><div class="eyebrow">' + kicker + '</div><h1>' + title + '</h1><p>' + desc + '</p></div>' +
    '<div class="top-actions-head">' +
      '<span class="readonly">SOLA LETTURA</span>' +
      '<button id="logoutBtn" class="logout-btn" title="Esci">🔒 Esci</button>' +
    '</div>' +
  '</div>';
}

function playerCard(p) {
  const contents = p.bag.contents.map(esc).join('<br>');
  const roleClass = p.role === 'Difesa' ? 'defense' : '';
  const notesText = esc(p.notes || '—');

  return '<article class="player-card" data-player="' + p.id + '">' +
    '<div class="player-top">' +
      '<div class="portrait">' + photoBox(p.avatar, 'Avatar ' + p.name) + '</div>' +
      '<div>' +
        '<span class="player-id">#' + p.number + '</span>' +
        '<div class="player-name">' + esc(p.name) + '</div>' +
        '<span class="role ' + roleClass + '">' + esc(p.role.toUpperCase()) + '</span>' +
      '</div>' +
      '<span class="active-dot">● Attivo</span>' +
    '</div>' +
    '<div class="mini-block">' +
      '<div class="mini-title">CARROZZINA</div>' +
      photoBox(p.wheelchair.photo, 'Carrozzina ' + p.name, 'chair-photo') +
      '<div class="specs">' +
        '<div><span>Diametro ruote</span><b>' + esc(p.wheels.diameter) + '</b></div>' +
        '<div><span>Coperture</span><b>' + esc(p.wheels.cover) + '</b></div>' +
        '<div><span>Spillo</span><b>' + esc(p.wheels.spoke) + '</b></div>' +
        '<div><span>Corrimano</span><b>' + esc(p.wheels.handrim) + '</b></div>' +
      '</div>' +
    '</div>' +
    '<div class="mini-block">' +
      '<div class="mini-title">RUOTE</div>' +
      '<div class="wheel-mini"><span>' + esc(p.wheels.diameter) + ' · ' + esc(p.wheels.cover) + '</span><span class="wheel-dot"></span></div>' +
    '</div>' +
    '<div class="mini-block">' +
      '<div class="mini-title">ACCESSORI</div>' +
      '<div class="empty-data">Da completare</div>' +
    '</div>' +
    '<div class="mini-block">' +
      '<div class="mini-title">BORSA ' + esc(p.bag.color.toUpperCase()) + '</div>' +
      '<div class="bag-mini">' +
        photoBox(p.bag.photo, 'Borsa ' + p.bag.color, 'bag-photo') +
        '<div><b>Contenuto</b><span>' + contents + '</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="mini-block">' +
      '<div class="mini-title">NOTE</div>' +
      '<div class="note">' + notesText + '</div>' +
    '</div>' +
  '</article>';
}

function sharedConfigs() {
  if (!checkDataIntegrity()) return '';
  const seen = new Set();
  const filtered = DATA.players.filter(function(p) {
    let k = wheelConfig(p);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return filtered.map(function(p) {
    const others = sharedPlayers(p);
    const namesList = [p.name];
    others.forEach(function(o) { namesList.push(o.name); });
    const names = namesList.map(esc).join(', ');
    return '<div class="shared"><span class="wheel-dot"></span><div><b>' + esc(p.wheels.diameter) + ' ' + esc(p.wheels.cover) + '</b><small>' + names + '</small></div></div>';
  }).join('');
}

// ==========================================
// VIEWS (PAGINE)
// ==========================================

function dashboard() {
  if (!checkDataIntegrity()) return '<div class="error">Impossibile caricare la dashboard: dati mancanti.</div>';
  const cards = DATA.players.map(playerCard).join('');
  return pageHead('PD RUGBY · EQUIPMENT MANAGER', 'Dashboard', 'Gestione di giocatori, carrozzine, ruote, borse e materiale della squadra.') +
    '<div class="stats">' +
      '<div class="stat-card"><small>GIOCATORI</small><div class="stat-value">' + DATA.players.length + '</div></div>' +
      '<div class="stat-card"><small>CARROZZINE</small><div class="stat-value">' + DATA.players.length + '</div></div>' +
      '<div class="stat-card"><small>RUOTE CENSITE</small><div class="stat-value">' + DATA.wheels.length + '</div></div>' +
      '<div class="stat-card"><small>CONTENITORI</small><div class="stat-value">' + DATA.containers.length + '</div></div>' +
    '</div>' +
    '<div class="section">' +
      '<h2 class="section-title">Giocatori <span>' + DATA.players.length + ' attivi</span></h2>' +
      '<div class="player-grid">' + cards + '</div>' +
    '</div>' +
    '<div class="bottom-strip">' +
      '<div class="bottom-title">Configurazioni ruote<br>condivise</div>' +
      sharedConfigs() +
    '</div>';
}

function players() {
  if (!checkDataIntegrity()) return '';
  let ps = DATA.players.filter(function(p) {
    if (!query) return true;
    const str = [p.name, p.number, p.role, p.wheels.diameter, p.wheels.cover, p.wheels.spoke, p.wheels.handrim].join(' ').toLowerCase();
    return str.includes(query);
  });
  return pageHead('SQUADRA', 'Giocatori', 'Schede e configurazioni delle attrezzature della squadra.') +
    '<div class="player-grid">' + ps.map(playerCard).join('') + '</div>';
}

function wheelchairs() {
  if (!checkDataIntegrity()) return '';
  let ps = DATA.players.filter(function(p) {
    if (!query) return true;
    const str = [p.name, p.number, p.role, p.wheelchair.model, p.wheels.diameter, p.wheels.cover].join(' ').toLowerCase();
    return str.includes(query);
  });
  const list = ps.map(function(p) {
    return '<div class="card">' +
      '<div class="section-title"><b>#' + p.number + ' ' + esc(p.name) + '</b><span>' + esc(p.role) + '</span></div>' +
      photoBox(p.wheelchair.photo, 'Carrozzina ' + p.name, 'large-photo') +
      '<div class="kv">' +
        '<div><small>Diametro</small><b>' + esc(p.wheels.diameter) + '</b></div>' +
        '<div><small>Coperture</small><b>' + esc(p.wheels.cover) + '</b></div>' +
        '<div><small>Spillo</small><b>' + esc(p.wheels.spoke) + '</b></div>' +
        '<div><small>Corrimano</small><b>' + esc(p.wheels.handrim) + '</b></div>' +
      '</div>' +
    '</div>';
  }).join('');
  return pageHead('DOTAZIONE', 'Carrozzine', 'Scheda tecnica visuale delle carrozzine della squadra.') +
    '<div class="content-grid">' + list + '</div>';
}

function wheels() {
  if (!checkDataIntegrity()) return '';
  let ws = DATA.wheels.filter(function(w) {
    if (!query) return true;
    const str = [w.id, w.size, w.assignment, w.note].join(' ').toLowerCase();
    return str.includes(query);
  });
  const rows = ws.map(function(w) {
    return '<tr><td><b>' + esc(w.id) + '</b></td><td>' + esc(w.size) + '</td><td>' + esc(w.assignment || '—') + '</td><td>' + esc(w.note || '—') + '</td></tr>';
  }).join('');
  return pageHead('DOTAZIONE', 'Ruote', 'Ruote censite singolarmente, con assegnazione e note.') +
    '<div class="section"><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Misura</th><th>Assegnazione</th><th>Note</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

function bags() {
  if (!checkDataIntegrity()) return '';
  const containersHtml = DATA.containers.map(function(c) {
    const photo = c.photo ? photoBox(c.photo, c.name, 'small-photo') : '';
    const stockItems = DATA.stock.filter(function(s) { return s.container === c.id; });
    let itemsHtml = stockItems.map(function(s) {
      let m = mat(s.material);
      if (!m) return '';
      return '<div class="node"><b>' + esc(m.name) + ' ' + esc(m.size) + '</b><span class="pill">' + esc(m.variant || '') + '</span><span class="pill">' + s.qty + ' pezzi</span></div>';
    }).join('');
    if (!itemsHtml) itemsHtml = '<span class="muted">Nessun contenuto quantitativo registrato.</span>';
    return '<div class="card"><div class="section-title"><b>' + esc(c.name) + '</b><span>' + esc(c.type) + '</span></div>' + photo + itemsHtml + '</div>';
  }).join('');

  const personalBagsHtml = DATA.personalBags.map(function(p) {
    return '<div class="card personal-bag">' + photoBox(p.photo, 'Sacca ' + p.color, 'small-photo') + '<b>Sacca ' + esc(p.color) + '</b><div>' + esc(p.person) + '</div></div>';
  }).join('');

  return pageHead('DOTAZIONE', 'Borse', 'Contenitori della squadra e dotazione personale.') +
    '<div class="content-grid">' + containersHtml + '</div>' +
    '<div class="section"><h2 class="section-title">Sacche personali</h2><div class="content-grid">' + personalBagsHtml + '</div></div>';
}

function inventory() {
  if (!checkDataIntegrity()) return '';
  let ms = DATA.materials.filter(function(m) {
    if (!query) return true;
    const str = [m.name, m.category, m.size, m.variant].join(' ').toLowerCase();
    return str.includes(query);
  });
  const rows = ms.map(function(m) {
    const pos = DATA.stock.filter(function(s) { return s.material === m.id; }).map(function(s) {
      return esc(cname(s.container)) + ' ×' + s.qty;
    }).join('<br>') || '—';
    return '<tr><td><b>' + esc(m.name) + ' ' + esc(m.size) + '</b></td><td>' + esc(m.category) + '</td><td>' + esc(m.variant) + '</td><td class="qty">' + totalStock(m.id) + '</td><td>' + pos + '</td></tr>';
  }).join('');

  return pageHead('MAGAZZINO', 'Inventario', 'Quantità aggregate e posizione del materiale.') +
    '<div class="section"><div class="table-wrap"><table class="table"><thead><tr><th>Materiale</th><th>Categoria</th><th>Variante</th><th>Totale</th><th>Posizioni</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}

function map() {
  if (!checkDataIntegrity()) return '';
  const containersTree = DATA.containers.map(function(c) {
    const items = DATA.stock.filter(function(s) { return s.container === c.id; }).map(function(s) {
      let m = mat(s.material);
      if (!m) return '';
      return '<span class="child">' + esc(m.name) + ' ' + esc(m.size) + ' ×' + s.qty + '</span>';
    }).join('');
    return '<div class="node"><b>' + esc(c.name) + '</b><div class="children">' + items + '</div></div>';
  }).join('');

  const playersTree = DATA.players.map(function(p) {
    return '<span class="child">#' + p.number + ' ' + esc(p.name) + ' · ' + esc(p.wheels.diameter) + '</span>';
  }).join('');

  return pageHead('STRUTTURA', 'Mappa', 'Vista concettuale di contenitori, materiali e dotazioni.') +
    '<div class="section"><div class="tree">' + containersTree + '<div class="node"><b>GIOCATORI</b><div class="children">' + playersTree + '</div></div></div></div>';
}

function checklist() {
  if (!checkDataIntegrity()) return '';
  const cRows = DATA.containers.map(function(c) {
    return '<div class="readonly-row"><span class="fake-check"></span><b>' + esc(c.name) + '</b></div>';
  }).join('');
  const pRows = DATA.players.map(function(p) {
    return '<div class="readonly-row"><span class="fake-check"></span>#' + p.number + ' <b>' + esc(p.name) + '</b> · ' + esc(p.wheels.diameter) + ' ' + esc(p.wheels.cover) + '</div>';
  }).join('');

  return pageHead('OPERATIVITÀ', 'Check-list', 'Controllo rapido delle dotazioni prima di una trasferta.') +
    '<div class="section"><h2 class="section-title">Dotazione principale <span>Sola lettura</span></h2>' + cRows + '</div>' +
    '<div class="section"><h2 class="section-title">Giocatori <span>Controllo individuale</span></h2>' + pRows + '</div>';
}

/**
 * Funzione principale per aggiornare la vista dell'applicazione.
 */
function render() {
  let html = '';
  if (currentView === 'dashboard') html = dashboard();
  else if (currentView === 'players') html = players();
  else if (currentView === 'wheelchairs') html = wheelchairs();
  else if (currentView === 'wheels') html = wheels();
  else if (currentView === 'bags') html = bags();
  else if (currentView === 'inventory') html = inventory();
  else if (currentView === 'map') html = map();
  else if (currentView === 'checklist') html = checklist();
  
  const content = $('#content');
  if (content) {
    content.innerHTML = html;
  } else {
    console.error("[Errore DOM] Elemento '#content' non trovato nella pagina.");
  }

  document.querySelectorAll('.nav-item').forEach(function(b) {
    b.classList.toggle('active', b.dataset.view === currentView);
  });
  
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

function openPlayer(id) {
  if (!checkDataIntegrity()) return;
  const p = DATA.players.find(function(x) { return x.id === id; });
  if (!p) {
    console.error("[Errore Giocatore] Nessun giocatore trovato con ID: " + id);
    return;
  }
  
  currentView = 'players';
  query = '';
  const s = $('#search');
  if (s) s.value = '';

  const roleClass = p.role === 'Difesa' ? 'defense' : '';
  const shared = sharedPlayers(p);
  const sharedHtml = shared.length > 0
    ? shared.map(function(x) { return '<span class="child"><b>#' + x.number + '</b> ' + esc(x.name) + '</span>'; }).join('')
    : '<span class="child">Nessun altro giocatore</span>';

  const bagContents = p.bag.contents.map(function(x) { return '<div class="node">' + esc(x) + '</div>'; }).join('');

  const content = $('#content');
  if (content) {
    content.innerHTML = pageHead('SCHEDA GIOCATORE', '#' + p.number + ' · ' + esc(p.name), esc(p.role) + ' · dotazione personale') +
      '<div class="player-detail">' +
        '<div class="hero-player">' +
          '<span class="big-number">#' + p.number + '</span>' +
          '<span class="role ' + roleClass + '">' + esc(p.role.toUpperCase()) + '</span>' +
          photoBox(p.avatar, 'Avatar ' + p.name, 'detail-avatar') +
          '<h2>' + esc(p.name) + '</h2>' +
          '<div class="hero-sub">Carrozzina · ' + esc(p.wheelchair.model) + '</div>' +
        '</div>' +
        '<div class="detail-panels">' +
          '<div class="detail-card"><h3>CARROZZINA</h3>' + photoBox(p.wheelchair.photo, 'Carrozzina ' + p.name, 'detail-chair') + '<div class="kv"><div><small>Modello</small><b>' + esc(p.wheelchair.model) + '</b></div></div></div>' +
          '<div class="detail-card"><h3>SPECIFICHE TECNICHE</h3><div class="kv"><div><small>Diametro ruote</small><b>' + esc(p.wheels.diameter) + '</b></div><div><small>Coperture</small><b>' + esc(p.wheels.cover) + '</b></div><div><small>Lunghezza spillo</small><b>' + esc(p.wheels.spoke) + '</b></div><div><small>Corrimano</small><b>' + esc(p.wheels.handrim) + '</b></div></div></div>' +
          '<div class="detail-card"><h3>ACCESSORI</h3><div class="empty-data large">Da completare</div></div>' +
          '<div class="detail-card"><h3>COMPONENTI IN COMUNE</h3><div class="compatibility">Stessa combinazione diametro + coperture</div><div class="children">' + sharedHtml + '</div></div>' +
          '<div class="detail-card"><h3>BORSA ' + esc(p.bag.color.toUpperCase()) + '</h3>' + photoBox(p.bag.photo, 'Borsa ' + p.bag.color, 'detail-bag') + bagContents + '</div>' +
          '<div class="detail-card"><h3>ALTRI ACCESSORI / NOTE</h3><div class="note large-note">' + esc(p.notes || 'Da completare') + '</div></div>' +
        '</div>' +
      '</div>';
  }

  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

// ==========================================
// INIZIALIZZAZIONE EVENTI ALLA CARICA DEL DOM
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
  console.log("[Inizializzazione] DOM pronto, avvio script...");

  // Controllo preventivo dell'integrità dei dati
  checkDataIntegrity();

  const contentEl = $('#content');
  if (contentEl) {
    contentEl.addEventListener('click', function(e) {
      const card = e.target.closest('[data-player]');
      if (card) openPlayer(card.dataset.player);
    });
  }

  document.querySelectorAll('.nav-item').forEach(function(b) {
    b.addEventListener('click', function() {
      nav(b.dataset.view);
    });
  });

  const searchEl = $('#search');
  if (searchEl) {
    searchEl.addEventListener('input', function(e) {
      query = e.target.value.trim().toLowerCase();
      render();
    });
  }

  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchEl) searchEl.focus();
    }
  });

  const menuBtn = $('#mobileMenu');
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      document.body.classList.toggle('mobile-nav-open');
    });
  }

  // Verifica lo stato di autenticazione iniziale
  checkAuth();

  // Gestione Form di Login con cattura degli errori esplicita
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      const inputEl = document.getElementById("passwordInput");
      const errorEl = document.getElementById("loginError");

      if (!inputEl) {
        console.error("[Errore Form] L'elemento '#passwordInput' è assente nel codice HTML.");
        return;
      }

      const input = inputEl.value;

      try {
        console.log("[Login] Elaborazione password...");
        const inputHash = await sha256(input);
        
        if (inputHash === PASS_HASH) {
          console.log("[Login] Password corretta, accesso effettuato.");
          sessionStorage.setItem("pdr_auth", "true");
          checkAuth();
        } else {
          console.warn("[Login] Tentativo di accesso rifiutato: password non valida.");
          if (errorEl) {
            errorEl.textContent = "Password errata. Riprova.";
            errorEl.classList.remove("hidden");
          }
        }
      } catch (err) {
        // Mostra l'errore esplicito sia in Console che a schermo
        console.error("[Login Errore Bloccante]", err);
        if (errorEl) {
          errorEl.textContent = err.message;
          errorEl.classList.remove("hidden");
        } else {
          alert("Errore Login: " + err.message);
        }
      }
    });
  } else {
    console.warn("[Avviso DOM] Modulo '#loginForm' non trovato nella pagina.");
  }

  // Renderizza la vista principale
  render();
});