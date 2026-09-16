let currentView="dashboard", query="";
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function cname(id){return DATA.containers.find(x=>x.id===id)?.name||id}
function mat(id){return DATA.materials.find(x=>x.id===id)}
function totalStock(id){return DATA.stock.filter(x=>x.material===id).reduce((a,b)=>a+b.qty,0)}
function render(){
  const q=query.trim().toLowerCase();
  let html="";
  if(currentView==="dashboard") html=dashboard(q);
  if(currentView==="inventory") html=inventory(q);
  if(currentView==="bags") html=bags(q);
  if(currentView==="wheels") html=wheels(q);
  if(currentView==="map") html=map(q);
  $("#content").innerHTML=html||'<div class="card empty">Nessun risultato.</div>';
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===currentView));
}
function dashboard(q){
  const materialTotal=DATA.stock.reduce((a,b)=>a+b.qty,0);
  const searchResults=search(q);
  return `<div class="grid">
    <div class="card"><div class="muted">Contenitori</div><div class="stat">${DATA.containers.length}</div></div>
    <div class="card"><div class="muted">Tipi di materiale</div><div class="stat">${DATA.materials.length}</div></div>
    <div class="card"><div class="muted">Pezzi in giacenza</div><div class="stat">${materialTotal}</div></div>
    <div class="card"><div class="muted">Ruote censite</div><div class="stat">${DATA.wheels.length}</div></div>
  </div>
  ${q?`<div class="card"><h3 class="section-title">Risultati per “${esc(q)}”</h3>${searchResults}</div>`:""}
  <div class="card"><h3 class="section-title">Situazione rapida</h3>
    <div class="grid">
      <div><span class="pill ok">OK</span><strong> Inventario iniziale caricato</strong><p class="muted">Le quantità sono separate per contenitore.</p></div>
      <div><span class="pill warn">ATTENZIONE</span><strong> Dati da verificare</strong><p class="muted">Le ruote del magazzino sono state interpretate come singoli esemplari.</p></div>
    </div>
  </div>`;
}
function search(q){
  if(!q) return "";
  const rows=[];
  DATA.materials.forEach(m=>{
    const text=[m.name,m.category,m.size,m.variant].join(" ").toLowerCase();
    if(text.includes(q)){
      const loc=DATA.stock.filter(s=>s.material===m.id).map(s=>`${esc(cname(s.container))} ×${s.qty}`).join(" · ");
      rows.push(`<div class="card search-result"><strong>${esc(m.name)} ${esc(m.size)} ${esc(m.variant)}</strong><div class="muted">${esc(m.category)}</div><div>${loc||"Nessuna giacenza registrata"}</div><b>Totale: ${totalStock(m.id)}</b></div>`);
    }
  });
  DATA.containers.filter(c=>c.name.toLowerCase().includes(q)).forEach(c=>rows.push(`<div class="card search-result"><strong>👜 ${esc(c.name)}</strong><div class="muted">${esc(c.type)}</div></div>`));
  DATA.wheels.filter(w=>[w.size,w.assignment,w.note].join(" ").toLowerCase().includes(q)).forEach(w=>rows.push(`<div class="card search-result"><div class="wheel"><div class="wheel-icon">🛞</div><div><strong>${esc(w.id)} · ${esc(w.size)}</strong><div>${esc(w.assignment||"Non assegnata")}</div><div class="muted">${esc(w.note)}</div></div></div></div>`));
  DATA.personalBags.filter(p=>[p.color,p.person].join(" ").toLowerCase().includes(q)).forEach(p=>rows.push(`<div class="card search-result"><strong>👜 Sacca ${esc(p.color)}</strong><div>Persona: <span class="person">${esc(p.person)}</span></div></div>`));
  return rows.join("")||'<div class="empty">Nessun risultato.</div>';
}
function inventory(q){
  let ms=DATA.materials.filter(m=>!q||[m.name,m.category,m.size,m.variant].join(" ").toLowerCase().includes(q));
  return `<div class="card"><h3 class="section-title">Inventario aggregato</h3><div class="table-wrap"><table class="table"><thead><tr><th>Materiale</th><th>Categoria</th><th>Variante</th><th>Totale</th><th>Posizioni</th></tr></thead><tbody>
  ${ms.map(m=>`<tr><td><strong>${esc(m.name)}</strong> ${esc(m.size)}</td><td>${esc(m.category)}</td><td>${esc(m.variant)}</td><td class="qty">${totalStock(m.id)}</td><td>${DATA.stock.filter(s=>s.material===m.id).map(s=>`${esc(cname(s.container))} ×${s.qty}`).join("<br>")||"—"}</td></tr>`).join("")}</tbody></table></div></div>`;
}
function bags(q){
  const cs=DATA.containers.filter(c=>!q||c.name.toLowerCase().includes(q));
  return `<div class="grid">${cs.map(c=>`<div class="card"><h3>${c.type==="Sacca"?"👜":c.type==="Cesta"?"🧺":c.type==="Cassetta"?"🧰":"🏬"} ${esc(c.name)}</h3><div class="muted">${esc(c.type)}</div>
  ${DATA.stock.filter(s=>s.container===c.id).map(s=>{let m=mat(s.material);return `<div class="node"><strong>${esc(m.name)} ${esc(m.size)}</strong><span class="pill">${esc(m.variant||"")}</span><span class="pill">${s.qty} pezzi</span></div>`}).join("")||'<p class="muted">Nessun materiale quantitativo registrato.</p>'}</div>`).join("")}</div>
  <div class="card"><h3 class="section-title">Sacche ruote personali</h3><div class="grid">${DATA.personalBags.map(p=>`<div class="node">👜 <strong>Sacca ${esc(p.color)}</strong>${esc(p.person)}</div>`).join("")}</div></div>`;
}
function wheels(q){
  let ws=DATA.wheels.filter(w=>!q||[w.id,w.size,w.assignment,w.note].join(" ").toLowerCase().includes(q));
  return `<div class="card"><h3 class="section-title">Ruote censite: ${ws.length}</h3><div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Misura</th><th>Assegnazione</th><th>Note</th></tr></thead><tbody>${ws.map(w=>`<tr><td><strong>${esc(w.id)}</strong></td><td>${esc(w.size)}</td><td>${esc(w.assignment||"—")}</td><td>${esc(w.note||"—")}</td></tr>`).join("")}</tbody></table></div></div>`;
}
function map(q){
  return `<div class="card"><h3 class="section-title">Mappa dei contenitori</h3><div class="tree">
    ${DATA.containers.filter(c=>c.type!=="Locale").map(c=>`<div class="node"><strong>${c.type==="Sacca"?"👜":c.type==="Cesta"?"🧺":"🧰"} ${esc(c.name)}</strong><div class="children">${DATA.stock.filter(s=>s.container===c.id).map(s=>{let m=mat(s.material);return `<span class="child">${esc(m.name)} ${esc(m.size)} ×${s.qty}</span>`}).join("")}</div></div>`).join("")}
    <div class="node"><strong>🏬 Magazzino</strong><div class="children">${DATA.wheels.map(w=>`<span class="child">🛞 ${esc(w.size)} ${esc(w.assignment||"")}</span>`).join("")}<span class="child">Copertoncini: rosso 24" ×2</span><span class="child">Copertoncini: rosso 25" ×2</span><span class="child">Copertoncini: grigio 25" ×1</span></div></div>
    <div class="node"><strong>🛞 Sacche ruote</strong><div class="children">${DATA.personalBags.map(p=>`<span class="child">${esc(p.color)} · ${esc(p.person)}</span>`).join("")}</div></div>
  </div></div>`;
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{currentView=b.dataset.view;render()}));
$("#search").addEventListener("input",e=>{query=e.target.value;render()});
render();