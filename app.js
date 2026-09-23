// ==========================================
// PDRugby Inventory — V0.9
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
const ASSET_VERSION = "0.9";
const STOCK_STORAGE_KEY = "pdr_stock_v09";
const DEFAULT_CRITICAL_THRESHOLDS = {
  M001: 5, M002: 2, M003: 2, M004: 5,
  M005: 2, M006: 2, M007: 1, M008: 1, M009: 1,
  M010: 2, M011: 0, M012: 0, M013: 0, M014: 2,
  M015: 1, M016: 1, M017: 2, M018: 2
};
let stockDirty = false;
let baseStockSnapshot = [];
let importedDataActive = false;

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
function containerById(id) { return (DATA.containers || []).find(c => c.id === id) || null; }
function containerPath(id) {
  const path = []; let cur = containerById(id); const seen = new Set();
  while (cur && !seen.has(cur.id)) { seen.add(cur.id); path.unshift(cur.name); cur = cur.parent ? containerById(cur.parent) : null; }
  return path;
}
function containerPathLabel(id) { return containerPath(id).join(" → "); }
function childrenOf(id) { return (DATA.containers || []).filter(c => c.parent === id); }
function looseItemsFor(id) { return (DATA.looseItems || []).filter(x => x.container === id); }
function materialTags(m) {
  if (!m) return [];
  const tags=[]; if (m.size) tags.push(m.size); if (m.variant) tags.push(m.variant);
  if (m.condition && m.condition !== m.variant) tags.push(m.condition); return tags;
}
function materialLabel(m) { return m ? [m.name, ...materialTags(m)].filter(Boolean).join(" · ") : ""; }

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
    let raw = localStorage.getItem(STOCK_STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem("pdr_stock_v08");
      if (legacy) { raw = legacy; localStorage.setItem(STOCK_STORAGE_KEY, legacy); }
    }
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
  localStorage.removeItem(STOCK_STORAGE_KEY); localStorage.removeItem("pdr_stock_v08");
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
function updateStockIndicator() {
  const el = document.getElementById("stockStatus");
  if (el) el.textContent = stockDirty ? "MODIFICHE LOCALI" : "DATI INIZIALI";
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}
function downloadBlob(filename, content, type = "application/octet-stream") {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function timestampStamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}
function currentStockMap(rows) {
  return new Map((rows || []).map(x => [`${x.container}|${x.material}`, Number(x.qty) || 0]));
}
function stockChanges() {
  const base = currentStockMap(baseStockSnapshot);
  const current = currentStockMap(DATA.stock || []);
  const keys = new Set([...base.keys(), ...current.keys()]);
  return [...keys].sort().map(key => {
    const [container, material] = key.split("|");
    const oldQty = base.get(key) || 0;
    const newQty = current.get(key) || 0;
    if (oldQty === newQty) return null;
    return {container, material, old: oldQty, new: newQty};
  }).filter(Boolean);
}
function exportChangesJson() {
  const changes = stockChanges();
  const payload = {
    format: "PdRugby inventory update",
    version: ASSET_VERSION,
    exportedAt: new Date().toISOString(),
    changes
  };
  downloadBlob(`PdRugby_update_${timestampStamp()}.json`, JSON.stringify(payload, null, 2), "application/json");
}
function exportBackupJson() {
  const payload = {
    format: "PdRugby inventory backup",
    version: ASSET_VERSION,
    exportedAt: new Date().toISOString(),
    data: cloneJson(DATA)
  };
  downloadBlob(`PdRugby_backup_${timestampStamp()}.json`, JSON.stringify(payload, null, 2), "application/json");
}
function exportDataJs() {
  const data = cloneJson(DATA);
  if (!data.criticalThresholds) data.criticalThresholds = cloneJson(DEFAULT_CRITICAL_THRESHOLDS);
  const header = `/*\n * DATI PdRugby — esportazione V${ASSET_VERSION}\n * Generato automaticamente dall'inventario.\n * Sostituire il data.js del repository con questo file per aggiornare il database master.\n */\nconst DATA = `;
  downloadBlob(`data_PdRugby_${timestampStamp()}.js`, header + JSON.stringify(data, null, 2) + ";\n", "text/javascript");
}
function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const imported = payload?.data || payload;
      if (!imported || !Array.isArray(imported.players) || !Array.isArray(imported.containers) || !Array.isArray(imported.materials) || !Array.isArray(imported.stock)) {
        throw new Error("File non riconosciuto: struttura dati incompleta.");
      }
      if (!confirm("Importare questo backup? I dati attualmente modificati sul dispositivo verranno sostituiti.")) return;
      Object.keys(DATA).forEach(k => delete DATA[k]);
      Object.assign(DATA, cloneJson(imported));
      normalizeData();
      localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(DATA.stock || []));
      baseStockSnapshot = cloneJson(DATA.stock || []);
      stockDirty = false;
      importedDataActive = true;
      render();
      updateStockIndicator();
      alert("Backup importato correttamente.");
    } catch (err) {
      console.error("[Import]", err);
      alert(`Impossibile importare il file.\n${err.message || "Formato non valido."}`);
    }
  };
  reader.readAsText(file);
}
function dataManager() {
  const changes = stockChanges();
  return pageHead("DATI · BACKUP / EXPORT", "Gestione dati", "Modifica l'inventario sul dispositivo, poi esporta il database aggiornato.") +
    `<div class="data-manager-grid">
      <div class="section data-card">
        <div class="data-icon">📤</div><h2>Database aggiornato</h2>
        <p>Genera un nuovo <b>data.js</b> con le quantità attuali. È il file da caricare nel repository per aggiornare il database master.</p>
        <button class="primary-data-btn" id="exportDataJsBtn">Esporta data.js aggiornato</button>
      </div>
      <div class="section data-card">
        <div class="data-icon">↗</div><h2>Solo modifiche</h2>
        <p>Genera un piccolo JSON con le sole variazioni rispetto ai dati iniziali.</p>
        <strong>${changes.length} modifiche</strong>
        <button class="data-btn" id="exportChangesBtn">Esporta aggiornamento JSON</button>
      </div>
      <div class="section data-card">
        <div class="data-icon">💾</div><h2>Backup completo</h2>
        <p>Salva una copia completa dei dati attuali. Utile prima di fare modifiche importanti.</p>
        <button class="data-btn" id="exportBackupBtn">Esporta backup JSON</button>
      </div>
      <div class="section data-card">
        <div class="data-icon">📥</div><h2>Importa backup</h2>
        <p>Ripristina un backup JSON precedentemente esportato su questo dispositivo.</p>
        <input id="importBackupInput" type="file" accept="application/json,.json" class="hidden-file-input">
        <button class="data-btn" id="importBackupBtn">Importa backup JSON</button>
      </div>
    </div>
    <div class="section export-flow"><h2 class="section-title">Flusso consigliato <span>semplice</span></h2>
      <div class="flow-steps"><span>1 · Modifica inventario</span><b>→</b><span>2 · Esporta data.js</span><b>→</b><span>3 · Carica su GitHub</span><b>→</b><span>4 · GitHub Pages aggiornata</span></div>
    </div>`;
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

function globalSearchResults() {
  if (!query) return ""; const q=query.toLowerCase(), results=[]; const idx=stockIndex();
  DATA.players.forEach(p=>{ if(playerSearchText(p).includes(q)) results.push({type:"Giocatore",title:`#${p.number} · ${p.name}`,sub:`${p.role} · ${p.wheels?.diameter||""} ${p.wheels?.cover||""}`,action:`player:${p.id}`}); });
  DATA.wheels.forEach(w=>{ if([w.id,w.size,w.assignment,w.note].join(" ").toLowerCase().includes(q)) results.push({type:"Ruota",title:w.id,sub:[w.size,w.assignment,w.note].filter(Boolean).join(" · "),action:"wheels"}); });
  DATA.materials.forEach(m=>{ if([materialLabel(m),m.category].join(" ").toLowerCase().includes(q)){ const loc=(idx.byMaterial[m.id]||[]).map(x=>`${containerPathLabel(x.container)} ×${x.qty}`).join(" · "); results.push({type:"Materiale",title:materialLabel(m),sub:loc||"Non presente nelle quantità censite",action:"inventory"}); }});
  DATA.containers.forEach(c=>{ if([c.name,c.type,containerPathLabel(c.id)].join(" ").toLowerCase().includes(q)) results.push({type:"Contenitore",title:c.name,sub:containerPathLabel(c.id),action:"bags"}); });
  (DATA.looseItems||[]).forEach(x=>{ if([x.label,containerPathLabel(x.container)].join(" ").toLowerCase().includes(q)) results.push({type:"Dotazione",title:x.label,sub:containerPathLabel(x.container),action:"bags"}); });
  return `<div class="global-results"><div class="section-title"><b>Risultati ricerca</b><span>${results.length}</span></div>`+(results.length?results.slice(0,30).map(r=>`<button class="search-result" data-search-action="${esc(r.action)}"><small>${esc(r.type)}</small><b>${esc(r.title)}</b><span>${esc(r.sub)}</span></button>`).join(""):`<div class="empty-data">Nessun risultato.</div>`)+`</div>`;
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
  const roleClass=p.role==="Difesa"?"defense":"", shared=sharedPlayers(p), acc=accessoriesValues(p);
  return `<article class="player-card" data-player="${esc(p.id)}"><div class="player-top"><div class="portrait small-portrait">${p.avatar?photoBox(p.avatar,"Avatar "+p.name):""}</div><div class="player-main"><span class="player-id">#${esc(p.number)}</span><div class="player-name">${esc(p.name)}</div><span class="role ${roleClass}">${esc((p.role||"").toUpperCase())}</span></div></div><div class="player-summary"><div class="mini-block compact"><div class="mini-title">RUOTE</div><div class="spec-line"><span>Configurazione</span><b>${esc(p.wheels.diameter||"—")} · ${esc(p.wheels.cover||"—")}</b></div><div class="spec-line"><span>Spillo</span><b>${esc(p.wheels.spoke||"—")}</b></div><div class="spec-line"><span>Corrimano</span><b>${esc(handrimLabel(p))}</b></div></div><div class="mini-block compact"><div class="mini-title">ACCESSORI</div>${acc.length?`<div class="children">${acc.slice(0,4).map(x=>`<span class="child">${esc(x)}</span>`).join("")}</div>`:'<div class="empty-data">Da completare</div>'}</div><div class="mini-block compact"><div class="mini-title">BORSA</div><div class="spec-line"><span>Tipo</span><b>${esc(p.bag?.color||"—")}</b></div><div class="spec-line"><span>Dotazione</span><b>${esc((p.bag?.contents||[]).length?p.bag.contents.join(" · "):"—")}</b></div></div></div><div class="player-footer"><span>${shared.length?`Condivide configurazione con ${shared.length} giocator${shared.length===1?"e":"i"}`:"Configurazione individuale"}</span><span class="open-hint">Apri scheda ›</span></div></article>`;
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
  const critical=[], idx=stockIndex(); DATA.materials.forEach(m=>{const total=totalStock(m.id,idx),status=stockStatus(m,total);if(status!=="ok")critical.push({m,total,status});});
  const criticalHtml=critical.length?`<div class="critical-grid">${critical.map(x=>`<button class="critical-card" data-dashboard-action="inventory"><b>${esc(materialLabel(x.m))}</b><strong>${esc(x.total)}</strong><span>${x.status==="out"?"ESAURITO":`Soglia ${esc(criticalThreshold(x.m))}`}</span></button>`).join("")}</div>`:`<div class="ok-banner">✓ Nessun materiale sotto soglia critica</div>`;
  return pageHead("PD RUGBY · EQUIPMENT MANAGER","Dashboard","Accesso rapido alla dotazione della squadra.")+`<div class="dashboard-stack"><section class="section dashboard-priority"><div class="section-title"><b>Situazione</b><span>${DATA.players.length} giocatori · ${DATA.wheels.length} ruote</span></div><div class="stats"><div class="stat-card"><small>GIOCATORI</small><div class="stat-value">${DATA.players.length}</div></div><div class="stat-card"><small>RUOTE CENSITE</small><div class="stat-value">${DATA.wheels.length}</div></div><div class="stat-card"><small>CONTENITORI</small><div class="stat-value">${DATA.containers.filter(c=>!c.parent).length}</div></div><div class="stat-card"><small>CRITICI</small><div class="stat-value">${critical.length}</div></div></div></section><section class="section"><h2 class="section-title"><b>Materiali critici</b><span>${critical.length}</span></h2>${criticalHtml}</section><section class="section"><h2 class="section-title"><b>Giocatori</b><span>${DATA.players.length}</span></h2><div class="player-grid">${DATA.players.map(playerCard).join("")}</div></section><section class="section"><h2 class="section-title"><b>Configurazioni ruote condivise</b></h2>${sharedConfigs()}</section></div>`;
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
function renderContainerCard(c,index,depth=0){const children=childrenOf(c.id),stockItems=index.byContainer[c.id]||[],loose=looseItemsFor(c.id),photo=c.photo?photoBox(c.photo,c.name,"small-photo"):"",stockHtml=stockItems.map(s=>stockEditorRow(c,s)).join(""),looseHtml=loose.map(x=>`<div class="loose-item"><span>${esc(x.label)}</span>${x.qty!=null?`<b>${esc(x.qty)}</b>`:""}</div>`).join(""),childHtml=children.map(ch=>renderContainerCard(ch,index,depth+1)).join("");return `<div class="card stock-card nested-container depth-${Math.min(depth,3)}"><div class="section-title"><b>${esc(c.name)}</b><span>${esc(c.type||"Contenitore")}</span></div>${depth===0?photo:""}${c.note?`<div class="container-note">${esc(c.note)}</div>`:""}${stockHtml?`<div class="stock-list">${stockHtml}</div>`:""}${looseHtml?`<div class="loose-list">${looseHtml}</div>`:""}${childHtml?`<div class="child-containers"><div class="nested-title">CONTENUTO</div>${childHtml}</div>`:""}${addMaterialBox(c)}</div>`;}
function bags(){const index=stockIndex(),roots=DATA.containers.filter(c=>!c.parent),containersHtml=roots.map(c=>renderContainerCard(c,index)).join(""),personal=(DATA.personalBags||[]).map(p=>`<div class="card personal-bag"><b>Sacca ${esc(p.color)}</b><div>${esc(p.person)}</div></div>`).join("");return pageHead("DOTAZIONE","Borse e contenitori","Gestione gerarchica delle sacche, dei contenitori e del loro contenuto.")+`<div class="section stock-toolbar"><span><b>Modifica rapida quantità</b> · Le modifiche vengono salvate sul dispositivo.</span><button class="reset-stock" id="resetStockBtn">Ripristina dati iniziali</button></div><div class="content-grid">${containersHtml}</div><div class="section"><h2 class="section-title">Sacche personali <span>${(DATA.personalBags||[]).length}</span></h2><div class="content-grid">${personal}</div></div>`;}
function inventory(){const index=stockIndex(),ms=DATA.materials.filter(m=>!query||[materialLabel(m),m.category].join(" ").toLowerCase().includes(query));const rows=ms.map(m=>{const total=totalStock(m.id,index),status=stockStatus(m,total),pos=(index.byMaterial[m.id]||[]).map(s=>`${esc(containerPathLabel(s.container))} ×${esc(s.qty)}`).join("<br>")||"—";return `<tr class="${status==="critical"?"stock-critical-row":""} ${status==="out"?"stock-out-row":""}"><td><b>${esc(m.name)}</b><small class="cell-sub">${esc(materialTags(m).join(" · "))}</small></td><td>${esc(m.category)}</td><td class="qty"><strong>${esc(total)}</strong>${status==="critical"?`<span class="stock-alert">CRITICO</span>`:status==="out"?`<span class="stock-alert">ESAURITO</span>`:""}</td><td>${pos}</td></tr>`;}).join("");return pageHead("MAGAZZINO","Inventario","Quantità aggregate e posizione del materiale.")+`<div class="section stock-toolbar"><span>🔴 <b>Scorta critica</b> = quantità pari o inferiore alla soglia configurata.</span><button class="reset-stock" id="resetStockBtn">Ripristina dati iniziali</button></div><div class="section"><div class="table-wrap"><table class="table"><thead><tr><th>Materiale</th><th>Categoria</th><th>Totale</th><th>Posizioni</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;}
function mapNode(c,index){const items=(index.byContainer[c.id]||[]).map(s=>{const m=mat(s.material);return m?`<span class="child">${esc(materialLabel(m))} ×${esc(s.qty)}</span>`:"";}).join(""),loose=looseItemsFor(c.id).map(x=>`<span class="child">${esc(x.label)}${x.qty!=null?` ×${esc(x.qty)}`:""}</span>`).join(""),children=childrenOf(c.id).map(ch=>mapNode(ch,index)).join("");return `<div class="node"><b>${esc(c.name)}</b>${items||loose?`<div class="children">${items}${loose}</div>`:""}${children?`<div class="nested-map">${children}</div>`:""}</div>`;}
function map(){const index=stockIndex(),roots=DATA.containers.filter(c=>!c.parent).map(c=>mapNode(c,index)).join(""),playersTree=DATA.players.map(p=>`<span class="child">#${esc(p.number)} ${esc(p.name)} · ${esc(p.wheels.diameter)}</span>`).join("");return pageHead("STRUTTURA","Mappa","Vista gerarchica di contenitori, materiali e dotazioni.")+`<div class="section"><div class="tree">${roots}<div class="node"><b>GIOCATORI</b><div class="children">${playersTree}</div></div></div></div>`;}
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
  else if (currentView === "data") html = dataManager();

  const content = $("#content");
  if (content) content.innerHTML = (query ? globalSearchResults() + html : html);

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

function openPlayer(id){const p=DATA.players.find(x=>x.id===id);if(!p)return;currentView="players";query="";const searchEl=$("#search");if(searchEl)searchEl.value="";const shared=sharedPlayers(p),sharedHtml=shared.length?shared.map(x=>`<span class="child"><b>#${esc(x.number)}</b> ${esc(x.name)}</span>`).join(""):'<span class="child">Nessun altro giocatore</span>',bagContents=(p.bag?.contents||[]).map(x=>`<div class="node">${esc(x)}</div>`).join(""),roleClass=p.role==="Difesa"?"defense":"",content=$("#content");if(!content)return;content.innerHTML=pageHead("SCHEDA GIOCATORE",`#${esc(p.number)} · ${esc(p.name)}`,`${esc(p.role)} · dotazione personale`)+`<div class="player-detail v09-player-detail"><div class="hero-player compact-hero"><div class="player-identity"><span class="big-number">#${esc(p.number)}</span><div><h2>${esc(p.name)}</h2><span class="role ${roleClass}">${esc(p.role.toUpperCase())}</span></div></div>${p.avatar?photoBox(p.avatar,"Avatar "+p.name,"detail-avatar optional-photo"):""}<div class="hero-sub">Carrozzina · ${esc(p.wheelchair.model||"Da completare")}</div></div><div class="detail-panels"><div class="detail-card"><h3>RUOTE</h3><div class="kv"><div><small>Diametro</small><b>${esc(p.wheels.diameter||"—")}</b></div><div><small>Coperture</small><b>${esc(p.wheels.cover||"—")}</b></div><div><small>Spillo</small><b>${esc(p.wheels.spoke||"—")}</b></div><div><small>Corrimano</small><b>${esc(handrimLabel(p))}</b></div></div><div class="wheel-note">2 ruote in dotazione alla carrozzina</div></div><div class="detail-card"><h3>CARROZZINA</h3><div class="kv"><div><small>Modello</small><b>${esc(p.wheelchair.model||"—")}</b></div><div><small>Ruolo</small><b>${esc(p.role||"—")}</b></div></div>${p.wheelchair.photo?photoBox(p.wheelchair.photo,"Carrozzina "+p.name,"optional-chair-photo"):""}</div><div class="detail-card"><h3>ACCESSORI</h3>${accessoriesHtml(p)}</div><div class="detail-card"><h3>COMPONENTI IN COMUNE</h3><div class="compatibility">Configurazione compatibile: diametro + copertura</div><div class="children">${sharedHtml}</div></div><div class="detail-card"><h3>BORSA ${esc((p.bag?.color||"").toUpperCase())}</h3>${p.bag?.photo?photoBox(p.bag.photo,"Borsa "+p.bag.color,"detail-bag optional-bag-photo"):""}${bagContents||'<div class="empty-data">Nessun contenuto registrato.</div>'}</div><div class="detail-card"><h3>NOTE</h3><div class="note large-note">${esc(p.notes||"—")}</div></div></div></div>`;const logoutBtn=$("#logoutBtn");if(logoutBtn)logoutBtn.addEventListener("click",logout);}
// ------------------------------------------
// Avvio
// ------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  normalizeData();

  const contentEl = $("#content");
  if (contentEl) {
    contentEl.addEventListener("click", e => {
      const searchBtn=e.target.closest("[data-search-action]");
      if(searchBtn){e.stopPropagation();const action=searchBtn.dataset.searchAction||"";if(action.startsWith("player:"))openPlayer(action.slice(7));else nav(action);return;}
      const dashBtn=e.target.closest("[data-dashboard-action]");
      if(dashBtn){e.stopPropagation();nav(dashBtn.dataset.dashboardAction||"inventory");return;}
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
      const exportDataBtn = e.target.closest("#exportDataJsBtn");
      if (exportDataBtn) { e.stopPropagation(); exportDataJs(); return; }
      const exportChangesBtn = e.target.closest("#exportChangesBtn");
      if (exportChangesBtn) { e.stopPropagation(); exportChangesJson(); return; }
      const exportBackupBtn = e.target.closest("#exportBackupBtn");
      if (exportBackupBtn) { e.stopPropagation(); exportBackupJson(); return; }
      const importBtn = e.target.closest("#importBackupBtn");
      if (importBtn) { e.stopPropagation(); document.getElementById("importBackupInput")?.click(); return; }
      const resetBtn = e.target.closest("#resetStockBtn");
      if (resetBtn) { e.stopPropagation(); resetStockState(); return; }
      const card = e.target.closest("[data-player]");
      if (card) openPlayer(card.dataset.player);
    });
  }

  contentEl.addEventListener("change", e => {
    if (e.target.id !== "importBackupInput") return;
    const file = e.target.files?.[0];
    if (file) importBackup(file);
    e.target.value = "";
  });

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

  baseStockSnapshot = cloneJson(DATA.stock || []);
  loadStockState();
  checkAuth();
  render();
  updateStockIndicator();
});
