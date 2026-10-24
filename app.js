'use strict';
const $ = s => document.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^https?:\/\//i.test(u) ? u : '#';
const fmt = d => new Date(d).toLocaleDateString('pt-BR', {timeZone:'UTC'});
const LABELS = {consolidado:'Conhecimento consolidado', observacao:'Observação atual', previsao:'Previsão / probabilidade',
  historica:'Comparação histórica', regional:'Interpretação regional', incerteza:'Incerteza / questão em aberto'};
const tag = l => `<span class="tag t-${l}">${LABELS[l]}</span>`;
const verify = '<span class="badge verify">A VERIFICAR</span>';
async function getJSON(p){ const r = await fetch(p); if(!r.ok) throw new Error(p+' '+r.status); return r.json(); }
const err = (msg) => `<div class="panel error" role="alert"><strong>Indisponível.</strong> ${esc(msg)}</div>`;
let cfg = {municipality:{name:'São Paulo',center:[-46.6333,-23.5505]}};

/* ---------- Início ---------- */
async function pageInicio(el){
  el.innerHTML = '<h1>El Niño agora</h1><div id="st"><p>Carregando status…</p></div>' +
   '<h2>Por onde começar</h2><ul><li><a href="#/entenda">Entenda o fenômeno</a></li><li><a href="#/impactos">Veja os impactos: Mundo, Brasil e São Paulo</a></li><li><a href="#/mapa">Explore o mapa</a></li></ul>';
  try{
    const s = await getJSON('data/enso-status.json');
    if(!s.alertStatusPt || !s.issuedAt || !s.nextUpdateAt || !s.source?.url || !s.summaryPt) throw new Error('arquivo de status inválido');
    const stale = new Date() > new Date(s.nextUpdateAt + 'T23:59:59');
    $('#st').innerHTML = `<div class="panel ${stale?'stale':''}">
      <h2 style="margin-top:0">${esc(s.alertStatusPt)}</h2>
      ${stale?'<p><span class="badge stale">desatualizado</span> A data da próxima atualização já passou. Confira a edição mais recente na fonte.</p>':''}
      <p>${esc(s.summaryPt)} ${tag('previsao')}</p>
      <ul>${(s.highlights||[]).map(h=>`<li>${esc(h.text)} ${LABELS[h.label]?tag(h.label):''}</li>`).join('')}</ul>
      <p class="meta">Emitido em ${fmt(s.issuedAt)} · próxima atualização prevista: ${fmt(s.nextUpdateAt)} · conferido no sistema em ${fmt(s.curatedAt)}<br>
      Fonte: <a href="${safeUrl(s.source.url)}" rel="noopener">${esc(s.source.name)}</a></p></div>`;
  }catch(e){ $('#st').innerHTML = err('Não foi possível carregar o status do ENSO. Nenhuma informação antiga é mostrada como atual.'); }
}

/* ---------- Entenda ---------- */
function pageEntenda(el){
  el.innerHTML = `<h1>Entenda o El Niño</h1>
  <p>O <strong>ENSO</strong> (El Niño–Oscilação Sul) é um padrão natural de interação entre o oceano e a atmosfera no Pacífico tropical. ${tag('consolidado')}</p>
  <details><summary>Aprofundar: como funciona</summary>
   <p>Quando as águas do Pacífico equatorial ficam mais quentes que a média, temos El Niño; quando ficam mais frias, La Niña. Isso muda a circulação da atmosfera e, de forma variável, a chuva e a temperatura em diferentes regiões. ${tag('consolidado')}</p></details>
  <details><summary>Aprofundar: como se mede</summary>
   <p>O CPC/NOAA acompanha a temperatura da superfície do mar na região <strong>Niño-3.4</strong> (anomalia: diferença em relação à média do período) e usa o índice <strong>RONI</strong> para classificar a intensidade. ${tag('consolidado')}</p></details>
  <h2>El Niño, La Niña e neutralidade</h2>
  <div class="scroll"><table><thead><tr><th>Fase</th><th>O que é</th><th>Efeito típico</th></tr></thead><tbody>
   <tr><td>El Niño</td><td>Fase quente do ENSO</td><td>Varia por região; no Brasil, tendências citadas incluem mais chuva no Sul e menos no Norte/Nordeste ${tag('regional')} ${verify}</td></tr>
   <tr><td>La Niña</td><td>Fase fria do ENSO</td><td>Efeitos em geral opostos aos do El Niño em várias regiões ${tag('regional')} ${verify}</td></tr>
   <tr><td>Neutralidade</td><td>Pacífico tropical fora de El Niño e de La Niña</td><td>Sem sinal forte do ENSO ${tag('consolidado')}</td></tr></tbody></table></div>
  <div class="panel"><h2 style="margin-top:0">O que o El Niño não explica</h2>
   <ul><li>Eventos extremos isolados (uma chuva forte, um dia de calor) não são atribuídos ao El Niño. ${tag('consolidado')}</li>
   <li>ENSO é variabilidade natural de poucos anos. Não é o mesmo que mudança climática de longo prazo. ${tag('consolidado')}</li>
   <li>Nem os eventos mais fortes produzem o impacto típico em todos os lugares, segundo o CPC. ${tag('incerteza')}</li></ul></div>`;
}

/* ---------- Impactos ---------- */
const IMPACTOS = {
 mundo:{t:'Mundo', h:`<p>O El Niño altera a circulação atmosférica tropical e, por meio dela, chuva e temperatura em várias regiões do planeta. ${tag('consolidado')}</p>
   <p>O CPC/NOAA informa 75% de chance de evento histórico em out-dez de 2026 (edição de 10/09/2026). ${tag('previsao')}</p>
   <p>Os efeitos variam de lugar para lugar e não se repetem igual a cada evento. ${tag('incerteza')}</p>`},
 brasil:{t:'Brasil', h:`<p>Tendências citadas em fontes consultadas pelo projeto (ainda sem conferência em material institucional): ${verify}</p>
   <ul><li><strong>Sul:</strong> mais chuva e maior risco de eventos extremos, sobretudo na primavera. ${tag('regional')}</li>
   <li><strong>Norte e Nordeste:</strong> tendência de menos chuva em partes, com risco de estiagem e queimadas. ${tag('regional')}</li>
   <li><strong>Sudeste e Centro-Oeste:</strong> calor acima do normal e chuvas irregulares na primavera e no verão. ${tag('regional')}</li></ul>
   <p>O efeito depende também de outros sistemas atmosféricos. ${tag('incerteza')}</p>`},
 sp:{t:'São Paulo', h:`<p><span class="badge verify">em verificação</span> Ainda não há conteúdo verificado em fonte oficial (INPE/CPTEC, INMET) para o município.</p>
   <p>O sinal do El Niño em uma cidade específica tende a ser menos nítido do que em regiões inteiras. ${tag('incerteza')}</p>
   <p>Fontes secundárias citam possível deslocamento da ZCAS para o sul, com chuva acima da média no sul do estado. ${tag('regional')} ${verify}</p>
   <p>Este site não faz previsão por bairro ou rua.</p>`}
};
function pageImpactos(el){
  el.innerHTML = `<h1>Impactos por escala</h1>
  <div class="tabs" role="group" aria-label="Escala">${Object.entries(IMPACTOS).map(([k,v])=>`<button data-k="${k}" aria-pressed="false">${v.t}</button>`).join('')}</div>
  <section id="imp" aria-live="polite"></section>
  <div class="panel"><strong>Lembrete:</strong> eventos extremos isolados não são atribuídos ao El Niño, e ENSO não é mudança climática de longo prazo.</div>`;
  const show = k => { document.querySelectorAll('[data-k]').forEach(b=>b.setAttribute('aria-pressed', b.dataset.k===k));
    $('#imp').innerHTML = `<h2>${IMPACTOS[k].t}</h2>` + IMPACTOS[k].h; };
  el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>show(b.dataset.k));
  show('sp');
}

/* ---------- Mapa ---------- */
const STOPS = ['#440154','#3b528b','#21908d','#5dc863','#fde725'];
function colorAt(t){ const x=Math.min(Math.max(t,0),1)*(STOPS.length-1), i=Math.min(Math.floor(x),STOPS.length-2), f=x-i;
  const a=STOPS[i], b=STOPS[i+1], p=h=>[1,3,5].map(k=>parseInt(h.substr(k,2),16));
  return '#'+p(a).map((v,k)=>Math.round(v+(p(b)[k]-v)*f).toString(16).padStart(2,'0')).join(''); }
async function pageMapa(el){
  const [lon0,lat0] = cfg.municipality.center, N=7, STEP=0.15, SPAN=N*STEP/2+0.35;
  el.innerHTML = `<h1>Mapa: temperatura em grade</h1>
   <p>Pontos de uma grade de ${N}×${N} em torno de ${esc(cfg.municipality.name)}, com temperatura do ar a 2 m (modelo meteorológico). Cada ponto vem de um modelo em grade e <strong>não representa um ponto específico da cidade</strong>.</p>
   <div id="mapmsg"></div><div class="maptools" role="group" aria-label="Controles do mapa">
   <button id="zi">Aproximar</button><button id="zo">Afastar</button><button id="zr">Enquadrar ${esc(cfg.municipality.name)}</button></div>
   <div id="mapbox"></div><div id="info"></div>`;
  const pts=[]; for(let i=0;i<N;i++)for(let j=0;j<N;j++) pts.push({lat:lat0+(i-(N-1)/2)*STEP, lon:lon0+(j-(N-1)/2)*STEP});
  let data, savedAt=null;
  try{
    const u=`https://api.open-meteo.com/v1/forecast?latitude=${pts.map(p=>p.lat.toFixed(3)).join(',')}&longitude=${pts.map(p=>p.lon.toFixed(3)).join(',')}&current=temperature_2m&timezone=America%2FSao_Paulo`;
    const r=await fetch(u); if(!r.ok) throw new Error(r.status);
    const j=await r.json(); data=pts.map((p,k)=>({...p, v:j[k].current.temperature_2m, t:j[k].current.time}));
    try{ localStorage.setItem('mapcache', JSON.stringify({data, savedAt:new Date().toISOString()})); }catch(_){}
  }catch(e){
    try{ const c=JSON.parse(localStorage.getItem('mapcache')); data=c.data; savedAt=c.savedAt; }catch(_){}
    $('#mapmsg').innerHTML = err('A fonte de dados do mapa não respondeu.') + (data?`<p class="panel stale">Mostrando a última resposta válida (data original: ${fmt(data[0].t)}). <strong>Não são dados atuais.</strong></p>`:'');
    if(!data){ $('#mapbox').innerHTML='<p class="meta" style="padding:1rem">Sem dados para exibir. Nenhum valor fictício é mostrado.</p>'; return; }
  }
  const vs=data.map(d=>d.v), mn=Math.min(...vs), mx=Math.max(...vs), rng=(mx-mn)||1;
  const X=lon=>300+(lon-lon0)/SPAN*300, Y=lat=>300-(lat-lat0)/SPAN*300;
  let shapes='';
  try{ const g=await getJSON('data/municipio.geojson'); const rings=[];
    (g.features||[g]).forEach(f=>{const G=f.geometry||f; if(G.type==='Polygon')rings.push(...G.coordinates); if(G.type==='MultiPolygon')G.coordinates.forEach(p=>rings.push(...p));});
    shapes=rings.map(r=>`<polygon points="${r.map(c=>X(c[0]).toFixed(1)+','+Y(c[1]).toFixed(1)).join(' ')}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4"/>`).join('');
  }catch(_){}
  const dots=data.map(d=>`<g><circle cx="${X(d.lon).toFixed(1)}" cy="${Y(d.lat).toFixed(1)}" r="21" fill="${colorAt((d.v-mn)/rng)}"/>
   <text x="${X(d.lon).toFixed(1)}" y="${(Y(d.lat)+4).toFixed(1)}" text-anchor="middle" font-size="12" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${d.v.toFixed(1)}</text></g>`).join('');
  $('#mapbox').innerHTML=`<svg viewBox="0 0 600 600" role="img" aria-label="Mapa em grade com temperaturas de ${mn.toFixed(1)} a ${mx.toFixed(1)} °C em torno de ${esc(cfg.municipality.name)}" style="color:var(--text)">${shapes}${dots}
   <circle cx="300" cy="300" r="4" fill="none" stroke="currentColor" stroke-width="2"><title>Centro configurado: ${esc(cfg.municipality.name)}</title></circle></svg>`;
  const svg=$('#mapbox svg'); let vb={x:0,y:0,w:600,h:600};
  const set=()=>svg.setAttribute('viewBox',`${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  const zoom=f=>{const cx=vb.x+vb.w/2, cy=vb.y+vb.h/2; vb.w=Math.min(600,Math.max(75,vb.w*f)); vb.h=vb.w; vb.x=cx-vb.w/2; vb.y=cy-vb.h/2; set();};
  $('#zi').onclick=()=>zoom(.6); $('#zo').onclick=()=>zoom(1/.6); $('#zr').onclick=()=>{vb={x:0,y:0,w:600,h:600};set();};
  let drag=null; svg.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY}; svg.setPointerCapture(e.pointerId);};
  svg.onpointermove=e=>{ if(!drag)return; const k=vb.w/svg.clientWidth; vb.x-=(e.clientX-drag.x)*k; vb.y-=(e.clientY-drag.y)*k; drag={x:e.clientX,y:e.clientY}; set(); };
  svg.onpointerup=()=>drag=null;
  $('#info').innerHTML=`<div class="panel"><div class="legend" style="background:linear-gradient(90deg,${STOPS.join(',')})"></div>
   <div class="meta" style="display:flex;justify-content:space-between"><span>${mn.toFixed(1)} °C</span><span>${mx.toFixed(1)} °C</span></div>
   <p class="meta"><strong>Variável:</strong> temperatura do ar a 2 m (°C) · <strong>Tipo:</strong> modelo/previsão (valor “atual” do modelo), não observação · <strong>Data:</strong> ${esc(data[0].t)} (America/Sao_Paulo)${savedAt?` · guardado em ${fmt(savedAt)}`:''}<br>
   <strong>Resolução:</strong> grade com espaçamento de ${STEP}° (cerca de 16 km) entre os pontos consultados; cada valor vem de um modelo em grade e não descreve um bairro. As distâncias leste-oeste aparecem levemente esticadas.<br>
   <strong>Fonte:</strong> <a href="https://open-meteo.com/" rel="noopener">Weather data by Open-Meteo.com</a> (uso não comercial) · Contorno do município: ${shapes?'arquivo data/municipio.geojson':'não carregado (A VERIFICAR: adicione data/municipio.geojson com a malha do IBGE)'}.</p></div>
   <details open><summary>Alternativa em texto e tabela</summary>
   <p>Entre os ${data.length} pontos, a temperatura vai de ${mn.toFixed(1)} a ${mx.toFixed(1)} °C.</p>
   <div class="scroll"><table><caption class="meta">Temperatura do ar a 2 m (°C) por ponto da grade</caption><thead><tr><th>Latitude</th><th>Longitude</th><th>°C</th></tr></thead><tbody>
   ${data.map(d=>`<tr><td>${d.lat.toFixed(3)}</td><td>${d.lon.toFixed(3)}</td><td>${d.v.toFixed(1)}</td></tr>`).join('')}</tbody></table></div></details>`;
}

/* ---------- Notícias ---------- */
async function pageNoticias(el){
  el.innerHTML='<h1>Notícias</h1><div id="nw"><p>Carregando…</p></div>';
  try{
    const n=await getJSON('data/news.json');
    const items=(n.items||[]).filter(i=>i.title&&i.url&&i.publishedAt&&i.sourceName&&!isNaN(new Date(i.publishedAt)))
      .sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt))
      .sort((a,b)=>(+!!(b.tags||[]).some(t=>t==='brasil'||t==='sao-paulo'))-(+!!(a.tags||[]).some(t=>t==='brasil'||t==='sao-paulo')) || new Date(b.publishedAt)-new Date(a.publishedAt));
    $('#nw').innerHTML = items.length ? `<p class="meta">Notícia é contexto, não fonte científica. Lista editorial curada.</p><ul class="news">${items.map(i=>`<li>
      <a href="${safeUrl(i.url)}" rel="noopener"><strong>${esc(i.title)}</strong></a>
      ${(i.tags||[]).some(t=>t==='brasil'||t==='sao-paulo')?'<span class="tag">Brasil/SP</span>':''}${i.isIllustrative?'<span class="badge illus">ilustrativo</span>':''}
      <div class="meta">${esc(i.sourceName)} · ${fmt(i.publishedAt)}</div><p>${esc((i.summary||'').slice(0,300))}</p></li>`).join('')}</ul>`
      : `<div class="panel"><strong>Nenhuma notícia disponível.</strong> ${esc(n.message||'')}</div>`;
  }catch(e){ $('#nw').innerHTML=err('Não foi possível carregar as notícias. O restante do site continua funcionando.'); }
}

/* ---------- Fontes ---------- */
function pageFontes(el){
  const L=(u,t)=>`<a href="${u}" rel="noopener">${t}</a>`;
  el.innerHTML=`<h1>Fontes e metodologia</h1>
  <p>Conteúdo científico vem de instituições oficiais. Notícias servem como contexto. Dados do status do ENSO são curados à mão e exibem data de emissão e de próxima atualização.</p>
  <div class="scroll"><table><thead><tr><th>Fonte</th><th>O que fornece</th><th>Frequência</th><th>Limitações</th><th>Licença / atribuição</th></tr></thead><tbody>
  <tr><td>${L('https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.html','NOAA/CPC, ENSO Diagnostic Discussion')}</td><td>Status do ENSO, índices e probabilidades</td><td>Mensal</td><td>Texto em inglês; sem API JSON oficial localizada; atualização manual neste site</td><td>A VERIFICAR (termos do CPC)</td></tr>
  <tr><td>${L('https://clima.cptec.inpe.br/gpc/pdf/situacao-El-Nino-Junho-2023.pdf','INPE/CPTEC, situação do El Niño (2023)')}</td><td>Efeitos típicos do El Niño no Brasil</td><td>Material de 2023</td><td>Usar só para efeitos típicos; conferir material mais recente</td><td>A VERIFICAR</td></tr>
  <tr><td>${L('https://open-meteo.com/en/terms','Open-Meteo')}</td><td>Temperatura do ar a 2 m por coordenada (modelo)</td><td>Horária</td><td>Dado de modelo em grade, não observação; cotas e termos podem mudar</td><td>Gratuito para uso não comercial; atribuição “Weather data by Open-Meteo.com” com link</td></tr>
  <tr><td>${L('https://www.ibge.gov.br','IBGE (malhas geográficas)')}</td><td>Contorno do município (opcional)</td><td>—</td><td>Não incluído por padrão</td><td>A VERIFICAR</td></tr></tbody></table></div>
  <h2>Limites do projeto</h2><ul><li>Não faz previsão própria nem emite alertas.</li><li>Os rótulos científicos indicam se algo é fato, observação, previsão, interpretação regional ou incerteza.</li><li>Itens marcados A VERIFICAR ainda precisam de conferência em fonte oficial.</li></ul>`;
}

/* ---------- Roteador ---------- */
const ROUTES={'':pageInicio,'/':pageInicio,'/entenda':pageEntenda,'/impactos':pageImpactos,'/mapa':pageMapa,'/noticias':pageNoticias,'/fontes':pageFontes};
const TITLES={'/':'Início','/entenda':'Entenda','/impactos':'Impactos','/mapa':'Mapa','/noticias':'Notícias','/fontes':'Fontes'};
async function route(){
  const p=location.hash.slice(1)||'/', el=$('#app');
  document.querySelectorAll('#nav a').forEach(a=>a.getAttribute('href')==='#'+p?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  document.title=(TITLES[p]||'Início')+' · El Niño em Foco';
  try{ await (ROUTES[p]||pageInicio)(el); }catch(e){ el.innerHTML=err('Erro ao montar a página.'); }
  el.focus({preventScroll:true});
}
window.addEventListener('hashchange',route);
getJSON('data/config.json').then(c=>cfg=c).catch(()=>{}).finally(route);
