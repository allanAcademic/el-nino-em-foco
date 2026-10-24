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
function gaugeHTML(n){
  const MIN=-2,MAX=2.5,pos=v=>(Math.min(Math.max(v,MIN),MAX)-MIN)/(MAX-MIN)*100;
  const f=v=>Math.abs(v).toFixed(1).replace('.',',');
  return `<figure class="gauge"><div class="track"><i class="tk" style="left:${pos(-.5)}%"></i><i class="tk" style="left:${pos(.5)}%"></i>
   <b class="mk" style="left:${pos(n.value)}%"><span>${n.value<0?'−':'+'}${f(n.value)} °C</span></b></div>
   <div class="zones"><span style="width:${pos(-.5)}%">La Niña</span><span style="width:${pos(.5)-pos(-.5)}%">Neutro</span><span style="flex:1">El Niño</span></div>
   <figcaption>Anomalia da temperatura do mar na região Niño-3.4, ${esc(n.period)} ${tag('observacao')}<br>
   <small>Faixas de referência: ±0,5 °C. O CPC classifica a intensidade pelo índice RONI.</small></figcaption></figure>`;
}
async function pageInicio(el){
  el.innerHTML='<div id="st"><h1>Status do ENSO</h1><p>Carregando…</p></div><h2>Continue por aqui</h2><ul class="go"><li><a href="#/entenda"><strong>Entenda</strong> o que é o fenômeno</a></li><li><a href="#/impactos"><strong>Impactos</strong> no mundo, no Brasil e em São Paulo</a></li><li><a href="#/mapa"><strong>Mapa</strong> da temperatura em São Paulo</a></li></ul>';
  try{
    const s=await getJSON('data/enso-status.json');
    if(!s.alertStatusPt||!s.issuedAt||!s.nextUpdateAt||!s.source?.url||!s.summaryPt) throw new Error('arquivo de status inválido');
    const stale=new Date()>new Date(s.nextUpdateAt+'T23:59:59');
    const g=s.nino34&&typeof s.nino34.value==='number'?gaugeHTML(s.nino34):'';
    $('#st').innerHTML=`<h1>${esc(s.alertStatusPt)}</h1>
      ${stale?'<p class="stalebar"><span class="badge stale">desatualizado</span> A data da próxima atualização já passou. Confira a edição mais recente na fonte.</p>':''}
      <p class="lead">${esc(s.summaryPt)} ${tag('previsao')}</p>${g}
      <ul>${(s.highlights||[]).map(h=>`<li>${esc(h.text)} ${LABELS[h.label]?tag(h.label):''}</li>`).join('')}</ul>
      <p class="meta">Emitido em ${fmt(s.issuedAt)} · próxima atualização prevista: ${fmt(s.nextUpdateAt)} · conferido no sistema em ${fmt(s.curatedAt)}<br>
      Fonte: <a href="${safeUrl(s.source.url)}" rel="noopener">${esc(s.source.name)}</a></p>`;
  }catch(e){ $('#st').innerHTML='<h1>Status do ENSO</h1>'+err('Não foi possível carregar o status. Nenhuma informação antiga é mostrada como atual.'); }
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
const STOPS=['#440154','#3b528b','#21908d','#5dc863','#fde725'];
function colorAt(t){const x=Math.min(Math.max(t,0),1)*(STOPS.length-1),i=Math.min(Math.floor(x),STOPS.length-2),f=x-i;
  const p=h=>[1,3,5].map(k=>parseInt(h.substr(k,2),16)),a=p(STOPS[i]),b=p(STOPS[i+1]);
  return '#'+a.map((v,k)=>Math.round(v+(b[k]-v)*f).toString(16).padStart(2,'0')).join('');}
async function pageMapa(el){
  const [lon0,lat0]=cfg.municipality.center,N=7,STEP=0.1,nm=esc(cfg.municipality.name);
  el.innerHTML=`<h1>Temperatura em ${nm}</h1>
   <p class="lead">Temperatura do ar a 2 m em uma grade de ${N}×${N} pontos, vinda de um modelo meteorológico. Cada valor é de um modelo em grade e <strong>não descreve um ponto específico da cidade</strong>.</p>
   <div id="mapmsg"></div><div class="maptools"><button id="zr">Enquadrar ${nm}</button></div>
   <div id="mapbox" aria-label="Mapa interativo"></div><div id="info"></div>`;
  const pts=[];for(let i=0;i<N;i++)for(let j=0;j<N;j++)pts.push({lat:lat0+(i-(N-1)/2)*STEP,lon:lon0+(j-(N-1)/2)*STEP});
  let data,savedAt=null;
  try{
    const u=`https://api.open-meteo.com/v1/forecast?latitude=${pts.map(p=>p.lat.toFixed(3)).join(',')}&longitude=${pts.map(p=>p.lon.toFixed(3)).join(',')}&current=temperature_2m&timezone=America%2FSao_Paulo`;
    const r=await fetch(u);if(!r.ok)throw new Error(r.status);
    const j=await r.json();data=pts.map((p,k)=>({...p,v:j[k].current.temperature_2m,t:j[k].current.time}));
    try{localStorage.setItem('mapcache',JSON.stringify({data,savedAt:new Date().toISOString()}));}catch(_){}
  }catch(e){
    try{const c=JSON.parse(localStorage.getItem('mapcache'));data=c.data;savedAt=c.savedAt;}catch(_){}
    $('#mapmsg').innerHTML=err('A fonte de dados do mapa não respondeu.')+(data?`<p class="stalebar">Mostrando a última resposta válida (data original: ${fmt(data[0].t)}). <strong>Não são dados atuais.</strong></p>`:'');
    if(!data){$('#mapbox').remove();$('#zr').remove();return;}
  }
  const vs=data.map(d=>d.v),mn=Math.min(...vs),mx=Math.max(...vs),rng=(mx-mn)||1;
  let hasBoundary=false;
  if(window.L){
    const map=L.map('mapbox',{scrollWheelZoom:false}).setView([lat0,lon0],10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
    let bounds=L.latLngBounds([[lat0-.3,lon0-.3],[lat0+.3,lon0+.3]]);
    try{const g=await getJSON('data/municipio.geojson');const layer=L.geoJSON(g,{style:{color:'#d9480f',weight:3,fill:false,dashArray:'8 5'}}).addTo(map);bounds=layer.getBounds();hasBoundary=true;}catch(_){}
    map.fitBounds(bounds);$('#zr').onclick=()=>map.fitBounds(bounds);
    data.forEach(d=>L.marker([d.lat,d.lon],{keyboard:false,icon:L.divIcon({className:'ptwrap',iconSize:[34,34],html:`<span class="pt" style="background:${colorAt((d.v-mn)/rng)}">${d.v.toFixed(1)}</span>`})}).addTo(map));
  }else{$('#mapbox').outerHTML=err('A biblioteca de mapa não carregou. Os valores continuam na tabela abaixo.');$('#zr').remove();}
  $('#info').innerHTML=`<div class="legendbox"><div class="legend" style="background:linear-gradient(90deg,${STOPS.join(',')})"></div>
   <div class="meta lg"><span>${mn.toFixed(1)} °C</span><span>${mx.toFixed(1)} °C</span></div>
   <p class="meta"><strong>Variável:</strong> temperatura do ar a 2 m (°C) · <strong>Tipo:</strong> valor “atual” de modelo, não observação · <strong>Data:</strong> ${esc(data[0].t)} (America/Sao_Paulo)${savedAt?` · guardado em ${fmt(savedAt)}`:''}<br>
   <strong>Resolução:</strong> pontos consultados a cada ${STEP}° (cerca de 11 km). O modelo tem resolução própria e pontos vizinhos podem repetir valores. Linha tracejada laranja: limite do município${hasBoundary?'':' (não carregado)'}.<br>
   <strong>Fontes:</strong> <a href="https://open-meteo.com/" rel="noopener">Weather data by Open-Meteo.com</a> (uso não comercial); mapa © colaboradores do OpenStreetMap; limite municipal: malha do IBGE redistribuída em repositório público (A VERIFICAR a versão e os termos).</p></div>
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
  <tr><td>${L('https://www.ibge.gov.br','IBGE (malhas), via repositório tbrugz/geodata-br')}</td><td>Limite do município (data/municipio.geojson)</td><td>—</td><td>Cópia redistribuída e simplificada; conferir versão com a malha oficial</td><td>A VERIFICAR</td></tr><tr><td>${L('https://www.openstreetmap.org/copyright','OpenStreetMap')}</td><td>Mapa-base</td><td>Contínua</td><td>Servidores públicos têm política de uso justo; não adequado a alto tráfego</td><td>© colaboradores do OpenStreetMap (ODbL)</td></tr></tbody></table></div>
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
