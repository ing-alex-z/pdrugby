// ==========================================
// PDRugby Inventory — V0.6
// ==========================================

let currentView = "dashboard";
let query = "";

const $ = s => document.querySelector(s);

// Sanitizzazione HTML
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));

// SHA-256 della password temporanea: pdrugby2026
const PASS_HASH = "88dd01db53af6248b327211b46176db942c2d963f46beebfb9659b43f212ac95";
const AUTH_KEY = "pdr_auth";
const ASSET_VERSION = "0.7";
const STOCK_STORAGE_KEY = "pdr_stock_v07";
const DEFAULT_CRITICAL_THRESHOLDS = {
  M001: 5, M002: 2, M003: 2, M004: 5,
  M005: 2, M006: 2, M007: 1, M008: 1, M009: 1,
  M010: 2, M011: 0, M012: 0, M013: 0, M014: 2,
  M015: 1, M016: 1, M017: 2, M018: 2
};
let stockDirty = false;

// ------------------------------------------
// Utility dati
// ------------------------------------------

function checkDataIntegrity() {
  if (typeof DATA === "undefined") {
    console.error("[Dati] DATA non disponibile: verificare che data.js sia caricato prima di app.js.");
    return false;
  }
  return true;
}

function mat(id) {
  if (!checkDataIntegrity()) return null;
  return DATA.materials.find(x => x.id === id) || null;
}

function cname(id) {
  if (!checkDataIntegrity()) return id;
  const found = DATA.containers.find(x => x.id === id);
  return found ? found.name : id;
}

function stockIndex() {
  const byMaterial = Object.create(null);
  const byContainer = Object.create(null);

  (DATA.stock || []).forEach(s => {
    if (!byMaterial[s.material]) byMaterial[s.material] = [];
    if (!byContainer[s.container]) byContainer[s.container] = [];
    byMaterial[s.material].push(s);
    byContainer[s.container].push(s);
  });

  return { byMaterial, byContainer };
}

function criticalThreshold(m) {
  if (!m) return 0;
  const value = m.criticalThreshold !== undefined ? m.criticalThreshold : (DATA.criticalThresholds ? DATA.criticalThresholds[m.id] : undefined);
  if (value !== undefined && value !== null && value !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return Number(DEFAULT_CRITICAL_THRESHOLDS[m.id] || 0);
}
function stockStatus(m, qty) {
  const n = Number(qty || 0);
  const threshold = criticalThreshold(m);
  if (n === 0) return "out";
  if (threshold > 0 && n <= threshold) return "critical";
  return "ok";
}
function loadStockState() {
  if (!checkDataIntegrity()) return;
  try {
    const raw = localStorage.getItem(STOCK_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) return;
    const savedMap = new Map(saved.map(x => [`${x.container}|${x.material}`, Number(x.qty) || 0]));
    const currentMap = new Map((DATA.stock || []).map(x => [`${x.container}|${x.material}`, x]));
    saved.forEach(x => {
      const key = `${x.container}|${x.material}`;
      if (currentMap.has(key)) currentMap.get(key).qty = Math.max(0, Number(x.qty) || 0);
      else if (DATA.containers.some(c => c.id === x.container) && DATA.materials.some(m => m.id === x.material)) {
        DATA.stock.push({container:x.container, material:x.material, qty:Math.max(0, Number(x.qty)||0)});
      }
    });
    stockDirty = true;
  } catch (err) {
    console.warn("[Inventario] Stato locale non leggibile:", err);
  }
}
function saveStockState() {
  try {
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(DATA.stock || []));
    stockDirty = true;
    updateStockIndicator();
  } catch (err) {
    console.error("[Inventario] Impossibile salvare:", err);
  }
}
function resetStockState() {
  if (!confirm("Ripristinare le quantità originali di data.js? Le modifiche locali andranno perse.")) return;
  localStorage.removeItem(STOCK_STORAGE_KEY);
  location.reload();
}
function findStock(containerId, materialId) {
  return (DATA.stock || []).find(x => x.container === containerId && x.material === materialId);
}
function changeStock(containerId, materialId, delta) {
  let row = findStock(containerId, materialId);
  if (!row && delta > 0) {
    row = {container:containerId, material:materialId, qty:0};
    DATA.stock.push(row);
  }
  if (!row) return;
  row.qty = Math.max(0, Number(row.qty || 0) + Number(delta || 0));
  saveStockState();
  render();
}
function addStock(containerId, materialId, qty) {
  const n = Math.max(1, parseInt(qty, 10) || 1);
  changeStock(containerId, materialId, n);
}
function materialLabel(m) {
  if (!m) return "";
  return [m.name, m.size, m.variant].filter(Boolean).join(" · ");
}
function updateStockIndicator() {
  const el = document.getElementById("stockStatus");
  if (el) el.textContent = stockDirty ? "MODIFICHE LOCALI" : "DATI INIZIALI";
}

function totalStock(id, index) {
  const rows = (index || stockIndex()).byMaterial[id] || [];
  return rows.reduce((sum, row) => sum + Number(row.qty || 0), 0);
}

function wheelConfig(p) {
  return `${p.wheels?.diameter || ""}|${p.wheels?.cover || ""}`;
}

function sharedPlayers(p) {
  if (!checkDataIntegrity()) return [];
  const key = wheelConfig(p);
  return DATA.players.filter(x => x.id !== p.id && wheelConfig(x) === key);
}

// ------------------------------------------
// Normalizzazione V0.6
// Mantiene compatibilità con i dati V0.4/V0.5.
// ------------------------------------------

function normalizePlayer(p) {
  p.wheels = p.wheels || {};
  p.wheelchair = p.wheelchair || {};
  p.bag = p.bag || { color:"", photo:"", contents:[] };

  // Vecchio formato: handrim: "Gommato"
  // Nuovo formato: handrim: {type, model, diameter, notes}
  if (typeof p.wheels.handrim === "string") {
    p.wheels.handrim = {
      type: p.wheels.handrim,
      model: "",
      diameter: "",
      notes: ""
    };
  } else {
    p.wheels.handrim = Object.assign({
      type: "",
      model: "",
      diameter: "",
      notes: ""
    }, p.wheels.handrim || {});
  }

  // Vecchio formato: accessories: []
  // Nuovo formato strutturato.
  if (Array.isArray(p.accessories)) {
    p.accessories = {
      pelvicLock: "",
      cushion: "",
      straps: "",
      handrim: "",
      footrest: "",
      other: p.accessories.slice()
    };
  } else {
    p.accessories = Object.assign({
      pelvicLock: "",
      cushion: "",
      straps: "",
      handrim: "",
      footrest: "",
      other: []
    }, p.accessories || {});
  }

  if (!Array.isArray(p.bag.contents)) p.bag.contents = [];
  return p;
}

function normalizeData() {
  if (!checkDataIntegrity()) return false;
  DATA.players.forEach(normalizePlayer);
  return true;
}

function handrimLabel(p) {
  const h = p.wheels?.handrim || {};
  if (typeof h === "string") return h || "Da completare";
  return h.type || h.model || "Da completare";
}

function accessoriesValues(p) {
  const a = p.accessories || {};
  if (Array.isArray(a)) return a;
  const values = [
    ["Pelvi-lock", a.pelvicLock],
    ["Cuscino", a.cushion],
    ["Cinghie", a.straps],
    ["Corrimano", a.handrim],
    ["Poggiapiedi", a.footrest]
  ];
  const result = values
    .filter(x => x[1])
    .map(x => `${x[0]}: ${x[1]}`);
  if (Array.isArray(a.other)) result.push(...a.other.filter(Boolean));
  return result;
}

function accessoriesHtml(p) {
  const values = accessoriesValues(p);
  if (!values.length) return '<div class="empty-data large">Da completare</div>';
  return '<div class="children">' +
    values.map(x => `<span class="child">${esc(x)}</span>`).join("") +
    '</div>';
}

function playerSearchText(p) {
  const h = p.wheels?.handrim || {};
  const a = accessoriesValues(p).join(" ");
  return [
    p.name, p.number, p.role,
    p.wheelchair?.model,
    p.wheels?.diameter, p.wheels?.cover, p.wheels?.spoke,
    typeof h === "string" ? h : h.type, h.model, h.diameter,
    a, p.notes
  ].join(" ").toLowerCase();
}

// ------------------------------------------
// Autenticazione
// ------------------------------------------

async function sha256(str) {
  if (!window.crypto?.subtle) {
    throw new Error("SHA-256 non disponibile. Verificare che il sito sia aperto tramite HTTPS.");
  }
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

function checkAuth() {
  const overlay = document.getElementById("loginOverlay");
  if (!overlay) return;
  overlay.classList.toggle("hidden", isAuthenticated());
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  checkAuth();
  const input = document.getElementById("passwordInput");
  if (input) {
    input.value = "";
    input.focus();
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const inputEl = document.getElementById("passwordInput");
  const errorEl = document.getElementById("loginError");
  const button = e.currentTarget.querySelector('button[type="submit"]');

  if (!inputEl) return;

  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }

  // Password condivisa temporanea: tolleriamo spazi accidentali.
  const input = inputEl.value.replace(/\s/g, "");

  if (!input) {
    if (errorEl) {
      errorEl.textContent = "Inserisci la password.";
      errorEl.classList.remove("hidden");
    }
    return;
  }

  try {
    if (button) {
      button.disabled = true;
      button.textContent = "Accesso...";
    }

    const inputHash = await sha256(input);

    if (inputHash === PASS_HASH) {
      sessionStorage.setItem(AUTH_KEY, "true");
      checkAuth();
      inputEl.value = "";
    } else {
      if (errorEl) {
        errorEl.textContent = "Password errata. Riprova.";
        errorEl.classList.remove("hidden");
      }
      inputEl.select();
    }
  } catch (err) {
    console.error("[Login]", err);
    if (errorEl) {
      errorEl.textContent = err.message || "Errore durante l'accesso.";
      errorEl.classList.remove("hidden");
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Accedi";
    }
  }
}

// ------------------------------------------
// Rendering
// ------------------------------------------

function img(src, alt, cls = "") {
  if (!src) return "";
  return `<img class="${esc(cls)}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy"
    onerror="this.classList.add('img-missing');if(this.nextElementSibling)this.nextElementSibling.classList.remove('hidden');">`;
}

function photoBox(src, alt, cls = "") {
  const image = img(src, alt, "photo-img");
  const fallback = `<div class="photo-fallback hidden"><span>IMMAGINE</span><small>${esc(src || "Percorso non impostato")}</small></div>`;
  return `<div class="photo-box ${esc(cls)}">${image}${fallback}</div>`;
}

function pageHead(kicker, title, desc) {
  return `<div class="page-head">
    <div><div class="eyebrow">${esc(kicker)}</div><h1>${title}</h1><p>${esc(desc)}</p></div>
    <div class="top-actions-head">
      <span class="readonly" id="stockStatus">DATI INIZIALI</span>
      <button id="logoutBtn" class="logout-btn" title="Esci">🔒 Esci</button>
    </div>
  </div>`;
}

function playerCard(p) {
  const contents = p.bag.contents.map(esc).join("<br>");
  const roleClass = p.role === "Difesa" ? "defense" : "";

  return `<article class="player-card" data-player="${esc(p.id)}">
    <div class="player-top">
      <div class="portrait">${photoBox(p.avatar, "Avatar " + p.name)}</div>
      <div>
        <span class="player-id">#${esc(p.number)}</span>
        <div class="player-name">${esc(p.name)}</div>
        <span class="role ${roleClass}">${esc((p.role || "").toUpperCase())}</span>
      </div>
      <span class="active-dot">● Attivo</span>
    </div>

    <div class="mini-block">
      <div class="mini-title">CARROZZINA</div>
      ${photoBox(p.wheelchair.photo, "Carrozzina " + p.name, "chair-photo")}
      <div class="specs">
        <div><span>Diametro ruote</span><b>${esc(p.wheels.diameter)}</b></div>
        <div><span>Coperture</span><b>${esc(p.wheels.cover)}</b></div>
        <div><span>Spillo</span><b>${esc(p.wheels.spoke)}</b></div>
        <div><span>Corrimano</span><b>${esc(handrimLabel(p))}</b></div>
      </div>
    </div>

    <div class="mini-block">
      <div class="mini-title">RUOTE</div>
      <div class="wheel-mini"><span>${esc(p.wheels.diameter)} · ${esc(p.wheels.cover)}</span><span class="wheel-dot"></span></div>
    </div>

    <div class="mini-block">
      <div class="mini-title">ACCESSORI</div>
      ${accessoriesHtml(p)}
    </div>

    <div class="mini-block">
      <div class="mini-title">BORSA ${esc((p.bag.color || "").toUpperCase())}</div>
      <div class="bag-mini">
        ${photoBox(p.bag.photo, "Borsa " + p.bag.color, "bag-photo")}
        <div><b>Contenuto</b><span>${contents}</span></div>
      </div>
    </div>

    <div class="mini-block">
      <div class="mini-title">NOTE</div>
      <div class="note">${esc(p.notes || "—")}</div>
    </div>
  </article>`;
}

function sharedConfigs() {
  const seen = new Set();
  return DATA.players.filter(p => {
    const k = wheelConfig(p);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).map(p => {
    const names = [p.name, ...sharedPlayers(p).map(x => x.name)].map(esc).join(", ");
    return `<div class="shared"><span class="wheel-dot"></span><div>
      <b>${esc(p.wheels.diameter)} ${esc(p.wheels.cover)}</b><small>${names}</small>
    </div></div>`;
  }).join("");
}

// ------------------------------------------
// Pagine
// ------------------------------------------

function dashboard() {
  return pageHead(
    "PD RUGBY · EQUIPMENT MANAGER",
    "Dashboard",
    "Gestione di giocatori, carrozzine, ruote, borse e materiale della squadra."
  ) +
  `<div class="stats">
    <div class="stat-card"><small>GIOCATORI</small><div class="stat-value">${DATA.players.length}</div></div>
    <div class="stat-card"><small>CARROZZINE</small><div class="stat-value">${DATA.players.length}</div></div>
    <div class="stat-card"><small>RUOTE CENSITE</small><div class="stat-value">${DATA.wheels.length}</div></div>
    <div class="stat-card"><small>CONTENITORI</small><div class="stat-value">${DATA.containers.length}</div></div>
  </div>
  <div class="section">
    <h2 class="section-title">Giocatori <span>${DATA.players.length} attivi</span></h2>
    <div class="player-grid">${DATA.players.map(playerCard).join("")}</div>
  </div>
  <div class="bottom-strip">
    <div class="bottom-title">Configurazioni ruote<br>condivise</div>
    ${sharedConfigs()}
  </div>`;
}

function players() {
  const ps = DATA.players.filter(p => !query || playerSearchText(p).includes(query));
  return pageHead("SQUADRA", "Giocatori", "Schede e configurazioni delle attrezzature della squadra.") +
    `<div class="player-grid">${ps.map(playerCard).join("")}</div>`;
}

function wheelchairs() {
  const ps = DATA.players.filter(p => !query || [
    p.name, p.number, p.role, p.wheelchair.model,
    p.wheels.diameter, p.wheels.cover, handrimLabel(p)
  ].join(" ").toLowerCase().includes(query));

  const list = ps.map(p => `<div class="card">
    <div class="section-title"><b>#${esc(p.number)} ${esc(p.name)}</b><span>${esc(p.role)}</span></div>
    ${photoBox(p.wheelchair.photo, "Carrozzina " + p.name, "large-photo")}
    <div class="kv">
      <div><small>Modello</small><b>${esc(p.wheelchair.model)}</b></div>
      <div><small>Diametro</small><b>${esc(p.wheels.diameter)}</b></div>
      <div><small>Coperture</small><b>${esc(p.wheels.cover)}</b></div>
      <div><small>Spillo</small><b>${esc(p.wheels.spoke)}</b></div>
      <div><small>Corrimano</small><b>${esc(handrimLabel(p))}</b></div>
    </div>
  </div>`).join("");

  return pageHead("DOTAZIONE", "Carrozzine", "Scheda tecnica visuale delle carrozzine della squadra.") +
    `<div class="content-grid">${list}</div>`;
}

function wheels() {
  const ws = DATA.wheels.filter(w => !query || [
    w.id, w.size, w.assignment, w.note
  ].join(" ").toLowerCase().includes(query));

  const rows = ws.map(w =>
    `<tr><td><b>${esc(w.id)}</b></td><td>${esc(w.size)}</td><td>${esc(w.assignment || "—")}</td><td>${esc(w.note || "—")}</td></tr>`
  ).join("");

  return pageHead("DOTAZIONE", "Ruote", "Ruote censite singolarmente, con assegnazione e note.") +
    `<div class="section"><div class="table-wrap"><table class="table">
      <thead><tr><th>ID</th><th>Misura</th><th>Assegnazione</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody></table></div></div>`;
}

function stockEditorRow(c, s) {
  const m = mat(s.material);
  if (!m) return "";
  const status = stockStatus(m, s.qty);
  return `<div class="stock-row ${status === "critical" ? "stock-critical" : ""} ${status === "out" ? "stock-out" : ""}">
    <div class="stock-info"><b>${esc(m.name)} ${esc(m.size)}</b>${m.variant ? `<span class="pill">${esc(m.variant)}</span>` : ""}
      ${status === "critical" ? `<span class="stock-alert">SCORTA CRITICA · ≤ ${esc(criticalThreshold(m))}</span>` : ""}
      ${status === "out" ? `<span class="stock-alert">ESAURITO</span>` : ""}
    </div>
    <div class="stock-controls">
      <button class="qty-btn" data-stock-action="dec" data-container="${esc(c.id)}" data-material="${esc(m.id)}" aria-label="Diminuisci">−</button>
      <strong class="stock-qty">${esc(s.qty)}</strong>
      <button class="qty-btn" data-stock-action="inc" data-container="${esc(c.id)}" data-material="${esc(m.id)}" aria-label="Aumenta">+</button>
    </div>
  </div>`;
}
function addMaterialBox(c) {
  const options = DATA.materials.map(m => `<option value="${esc(m.id)}">${esc(materialLabel(m))}</option>`).join("");
  return `<div class="add-stock"><select data-add-material="${esc(c.id)}"><option value="">＋ Aggiungi materiale…</option>${options}</select><input type="number" min="1" value="1" data-add-qty="${esc(c.id)}" aria-label="Quantità"><button class="add-stock-btn" data-add-stock="${esc(c.id)}">Aggiungi</button></div>`;
}
function bags() {
  const index = stockIndex();
  const containersHtml = DATA.containers.map(c => {
    const photo = c.photo ? photoBox(c.photo, c.name, "small-photo") : "";
    const stockItems = index.byContainer[c.id] || [];
    let itemsHtml = stockItems.map(s => stockEditorRow(c, s)).join("");
    if (!itemsHtml) itemsHtml = '<span class="muted">Nessun contenuto quantitativo registrato.</span>';
    return `<div class="card stock-card"><div class="section-title"><b>${esc(c.name)}</b><span>${esc(c.type)}</span></div>${photo}<div class="stock-list">${itemsHtml}</div>${addMaterialBox(c)}</div>`;
  }).join("");
  const personalBagsHtml = DATA.personalBags.map(p =>
    `<div class="card personal-bag">${photoBox(p.photo, "Sacca " + p.color, "small-photo")}<b>Sacca ${esc(p.color)}</b><div>${esc(p.person)}</div></div>`
  ).join("");
  return pageHead("DOTAZIONE", "Borse", "Contenitori della squadra e dotazione personale.") +
    `<div class="section stock-toolbar"><span><b>Modifica rapida quantità</b> · Le modifiche vengono salvate sul dispositivo.</span><button class="reset-stock" id="resetStockBtn">Ripristina dati iniziali</button></div>` +
    `<div class="content-grid">${containersHtml}</div>
     <div class="section"><h2 class="section-title">Sacche personali</h2><div class="content-grid">${personalBagsHtml}</div></div>`;
}

function inventory() {
  const index = stockIndex();
  const ms = DATA.materials.filter(m => !query || [m.name, m.category, m.size, m.variant].join(" ").toLowerCase().includes(query));
  const rows = ms.map(m => {
    const total = totalStock(m.id, index);
    const status = stockStatus(m, total);
    const pos = (index.byMaterial[m.id] || []).map(s => `${esc(cname(s.container))} ×${esc(s.qty)}`).join("<br>") || "—";
    return `<tr class="${status === "critical" ? "stock-critical-row" : ""} ${status === "out" ? "stock-out-row" : ""}">
      <td><b>${esc(m.name)} ${esc(m.size)}</b></td><td>${esc(m.category)}</td><td>${esc(m.variant)}</td>
      <td class="qty"><strong>${esc(total)}</strong>${status === "critical" ? `<span class="stock-alert">CRITICO</span>` : status === "out" ? `<span class="stock-alert">ESAURITO</span>` : ""}</td><td>${pos}</td>
    </tr>`;
  }).join("");
  return pageHead("MAGAZZINO", "Inventario", "Quantità aggregate e posizione del materiale.") +
    `<div class="section stock-toolbar"><span>🔴 <b>Scorta critica</b> = quantità pari o inferiore alla soglia configurata.</span><button class="reset-stock" id="resetStockBtn">Ripristina dati iniziali</button></div>` +
    `<div class="section"><div class="table-wrap"><table class="table"><thead><tr><th>Materiale</th><th>Categoria</th><th>Variante</th><th>Totale</th><th>Posizioni</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function map() {
  const index = stockIndex();

  const containersTree = DATA.containers.map(c => {
    const items = (index.byContainer[c.id] || []).map(s => {
      const m = mat(s.material);
      if (!m) return "";
      return `<span class="child">${esc(m.name)} ${esc(m.size)} ×${esc(s.qty)}</span>`;
    }).join("");

    return `<div class="node"><b>${esc(c.name)}</b><div class="children">${items}</div></div>`;
  }).join("");

  const playersTree = DATA.players.map(p =>
    `<span class="child">#${esc(p.number)} ${esc(p.name)} · ${esc(p.wheels.diameter)}</span>`
  ).join("");

  return pageHead("STRUTTURA", "Mappa", "Vista concettuale di contenitori, materiali e dotazioni.") +
    `<div class="section"><div class="tree">${containersTree}
      <div class="node"><b>GIOCATORI</b><div class="children">${playersTree}</div></div>
    </div></div>`;
}

function checklist() {
  const cRows = DATA.containers.map(c =>
    `<div class="readonly-row"><span class="fake-check"></span><b>${esc(c.name)}</b></div>`
  ).join("");

  const pRows = DATA.players.map(p =>
    `<div class="readonly-row"><span class="fake-check"></span>#${esc(p.number)}
      <b>${esc(p.name)}</b> · ${esc(p.wheels.diameter)} ${esc(p.wheels.cover)}</div>`
  ).join("");

  return pageHead("OPERATIVITÀ", "Check-list", "Controllo rapido delle dotazioni prima di una trasferta.") +
    `<div class="section"><h2 class="section-title">Dotazione principale <span>Sola lettura</span></h2>${cRows}</div>
     <div class="section"><h2 class="section-title">Giocatori <span>Controllo individuale</span></h2>${pRows}</div>`;
}

function render() {
  let html = "";
  if (currentView === "dashboard") html = dashboard();
  else if (currentView === "players") html = players();
  else if (currentView === "wheelchairs") html = wheelchairs();
  else if (currentView === "wheels") html = wheels();
  else if (currentView === "bags") html = bags();
  else if (currentView === "inventory") html = inventory();
  else if (currentView === "map") html = map();
  else if (currentView === "checklist") html = checklist();

  const content = $("#content");
  if (content) content.innerHTML = html;

  document.querySelectorAll(".nav-item").forEach(b =>
    b.classList.toggle("active", b.dataset.view === currentView)
  );

  const logoutBtn = $("#logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

function nav(view) {
  currentView = view;
  query = "";
  const s = $("#search");
  if (s) s.value = "";
  render();
  document.body.classList.remove("mobile-nav-open");
}

function openPlayer(id) {
  const p = DATA.players.find(x => x.id === id);
  if (!p) return;

  currentView = "players";
  query = "";
  const s = $("#search");
  if (s) s.value = "";

  const shared = sharedPlayers(p);
  const sharedHtml = shared.length
    ? shared.map(x => `<span class="child"><b>#${esc(x.number)}</b> ${esc(x.name)}</span>`).join("")
    : '<span class="child">Nessun altro giocatore</span>';

  const bagContents = p.bag.contents.map(x => `<div class="node">${esc(x)}</div>`).join("");
  const roleClass = p.role === "Difesa" ? "defense" : "";

  const content = $("#content");
  if (!content) return;

  content.innerHTML = pageHead(
    "SCHEDA GIOCATORE",
    `#${esc(p.number)} · ${esc(p.name)}`,
    `${esc(p.role)} · dotazione personale`
  ) +
  `<div class="player-detail">
    <div class="hero-player">
      <span class="big-number">#${esc(p.number)}</span>
      <span class="role ${roleClass}">${esc(p.role.toUpperCase())}</span>
      ${photoBox(p.avatar, "Avatar " + p.name, "detail-avatar")}
      <h2>${esc(p.name)}</h2>
      <div class="hero-sub">Carrozzina · ${esc(p.wheelchair.model)}</div>
    </div>

    <div class="detail-panels">
      <div class="detail-card">
        <h3>CARROZZINA</h3>
        ${photoBox(p.wheelchair.photo, "Carrozzina " + p.name, "detail-chair")}
        <div class="kv"><div><small>Modello</small><b>${esc(p.wheelchair.model)}</b></div></div>
      </div>

      <div class="detail-card">
        <h3>SPECIFICHE TECNICHE</h3>
        <div class="kv">
          <div><small>Diametro ruote</small><b>${esc(p.wheels.diameter)}</b></div>
          <div><small>Coperture</small><b>${esc(p.wheels.cover)}</b></div>
          <div><small>Lunghezza spillo</small><b>${esc(p.wheels.spoke)}</b></div>
          <div><small>Corrimano</small><b>${esc(handrimLabel(p))}</b></div>
        </div>
      </div>

      <div class="detail-card">
        <h3>ACCESSORI</h3>
        ${accessoriesHtml(p)}
      </div>

      <div class="detail-card">
        <h3>COMPONENTI IN COMUNE</h3>
        <div class="compatibility">Stessa combinazione diametro + coperture</div>
        <div class="children">${sharedHtml}</div>
      </div>

      <div class="detail-card">
        <h3>BORSA ${esc((p.bag.color || "").toUpperCase())}</h3>
        ${photoBox(p.bag.photo, "Borsa " + p.bag.color, "detail-bag")}
        ${bagContents}
      </div>

      <div class="detail-card">
        <h3>ALTRI ACCESSORI / NOTE</h3>
        <div class="note large-note">${esc(p.notes || "Da completare")}</div>
      </div>
    </div>
  </div>`;

  const logoutBtn = $("#logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

// ------------------------------------------
// Avvio
// ------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  normalizeData();

  const contentEl = $("#content");
  if (contentEl) {
    contentEl.addEventListener("click", e => {
      const qtyBtn = e.target.closest("[data-stock-action]");
      if (qtyBtn) {
        e.stopPropagation();
        const delta = qtyBtn.dataset.stockAction === "inc" ? 1 : -1;
        changeStock(qtyBtn.dataset.container, qtyBtn.dataset.material, delta);
        return;
      }
      const addBtn = e.target.closest("[data-add-stock]");
      if (addBtn) {
        e.stopPropagation();
        const containerId = addBtn.dataset.addStock;
        const select = contentEl.querySelector(`[data-add-material="${containerId}"]`);
        const input = contentEl.querySelector(`[data-add-qty="${containerId}"]`);
        if (!select || !select.value) { alert("Seleziona il materiale da aggiungere."); return; }
        addStock(containerId, select.value, input ? input.value : 1);
        return;
      }
      const resetBtn = e.target.closest("#resetStockBtn");
      if (resetBtn) { e.stopPropagation(); resetStockState(); return; }
      const card = e.target.closest("[data-player]");
      if (card) openPlayer(card.dataset.player);
    });
  }

  document.querySelectorAll(".nav-item").forEach(b =>
    b.addEventListener("click", () => nav(b.dataset.view))
  );

  const searchEl = $("#search");
  if (searchEl) {
    searchEl.addEventListener("input", e => {
      query = e.target.value.trim().toLowerCase();
      render();
    });
  }

  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchEl?.focus();
    }
  });

  const menuBtn = $("#mobileMenu");
  if (menuBtn) {
    menuBtn.addEventListener("click", () =>
      document.body.classList.toggle("mobile-nav-open")
    );
  }

  const form = $("#loginForm");
  if (form) form.addEventListener("submit", handleLogin);

  const togglePassword = $("#togglePassword");
  const passwordInput = $("#passwordInput");
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const visible = passwordInput.type === "text";
      passwordInput.type = visible ? "password" : "text";
      togglePassword.textContent = visible ? "👁" : "🙈";
      togglePassword.setAttribute("aria-label", visible ? "Mostra password" : "Nascondi password");
    });
  }

  loadStockState();
  checkAuth();
  render();
  updateStockIndicator();
});
