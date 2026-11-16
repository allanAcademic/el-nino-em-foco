/* El Niño em foco — Pacífico & Clima | lógica do site (sem dependências) */
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Ilustrações em traço (estilo gravura) */
const P=(a,r,c=100)=>[c+r*Math.sin(a),c-r*Math.cos(a)];
const ART={
 cloud(){const C='M40 150a22 22 0 0 1 4-43a32 32 0 0 1 60-10a26 26 0 0 1 44 20a20 20 0 0 1 12 33Z';
  let s='<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="78" cy="78" r="30" stroke-width="2.4"/><circle cx="78" cy="78" r="23" stroke-width=".7"/>';
  for(let i=0;i<40;i++){const a=i*Math.PI/20,p=P(a,38,78),q=P(a,i%2?52:68,78);s+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke-width="${i%2?.8:1.7}"/>`}
  s+=`<g transform="translate(100 18) scale(.55)"><path d="${C}" transform="translate(5 6)" fill="var(--card)" stroke-width=".9"/><path d="${C}" fill="var(--card)" stroke-width="3.4"/></g>`;
  s+=`<defs><clipPath id="cc"><path d="${C}"/></clipPath></defs><path d="${C}" transform="translate(6 8)" fill="var(--card)" stroke-width=".9"/><path d="${C}" fill="var(--card)" stroke-width="2.6"/><g clip-path="url(#cc)" stroke-width=".7">`;
  for(let i=0;i<26;i++)s+=`<line x1="${30+i*6}" y1="152" x2="${44+i*6}" y2="128"/>`;
  return s+'</g><path d="M52 146Q100 156 150 146" stroke-width="1.2"/></svg>'},
 waves(){let s='<svg viewBox="0 0 240 170" fill="none" stroke="currentColor" stroke-linecap="round">';
  for(let r=0;r<10;r++){let d='M0 '+(18+r*15);for(let x=0;x<=240;x+=6)d+=` L${x} ${(18+r*15+Math.sin(x/16+r*.9)*(5+r*.5)).toFixed(1)}`;s+=`<path d="${d}" stroke-width="${(.6+r*.22).toFixed(2)}"/>`}
  return s+'</svg>'},
 sun(){let s='<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-linecap="round"><circle cx="100" cy="100" r="34" stroke-width="2"/><circle cx="100" cy="100" r="26" stroke-width=".7"/>';
  for(let i=0;i<48;i++){const a=i*Math.PI/24,p=P(a,44),q=P(a,i%2?72:92);s+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke-width="${i%2?.8:1.6}"/>`}
  for(let i=0;i<9;i++)s+=`<line x1="${80}" y1="${86+i*4}" x2="${120}" y2="${86+i*4}" stroke-width=".5" clip-path="circle(26px at 20px ${14-i*4}px)" opacity="0"/>`;
  return s+'</svg>'}
};
document.querySelectorAll('[data-art]').forEach(e=>e.innerHTML=ART[e.dataset.art]());

/* Abas (com link direto: #info, #clima, #news, #about) */
const loaded={},TABS=['info','clima','news','about'];
function showTab(t,push){
  if(!TABS.includes(t))t='info';
  document.querySelectorAll('nav button').forEach(x=>x.setAttribute('aria-selected',x.dataset.t===t));
  tab=t;applyInv();
  TABS.forEach(id=>$('#'+id).hidden=id!==t);
  if(!loaded[t]){loaded[t]=1;if(t==='clima')loadClima();if(t==='news')loadNews('br');}
  if(push)history.replaceState(null,'','#'+t);
}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>showTab(b.dataset.t,true));

/* El Niño / La Niña */
const phases={
 nino:{bg:'linear-gradient(90deg,#d6d5d0,#e19a85 55%,#ca422a)',h:'el niño: águas mais quentes que o normal',
  t:'Os ventos alísios enfraquecem e a água quente se espalha para o leste do Pacífico. No Brasil, costuma trazer mais chuva e enchentes no Sul, seca e calor no Norte e no Nordeste, e temperaturas mais altas no Sudeste. No mundo, está ligado a secas na Austrália e na Indonésia e a chuvas fortes na costa do Peru.'},
 nina:{bg:'linear-gradient(90deg,#ca422a,#b9a89f 45%,#3d3b36)',h:'la niña: águas mais frias que o normal',
  t:'Os ventos alísios ficam mais fortes e empurram a água quente para o oeste, e águas frias afloram no leste. No Brasil, tende a trazer seca no Sul e chuva acima da média no Norte e no Nordeste. No mundo, aumenta a chance de furacões ativos no Atlântico e de seca no sul dos EUA.'},
 neu:{bg:'linear-gradient(90deg,#d6d5d0,#bdbab2,#d6d5d0)',h:'neutro: sem anomalia marcante',
  t:'A temperatura do Pacífico fica próxima da média e o clima responde mais a outros fatores, como a Zona de Convergência do Atlântico Sul e as frentes frias. É a fase mais comum entre um evento e outro.'}
};
function setPhase(p){
  document.querySelectorAll('#phase button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===p));
  $('#ocean').style.background=phases[p].bg;
  $('#phaseText').innerHTML='<h3>'+phases[p].h+'</h3><p style="margin:0">'+phases[p].t+'</p>';
}
document.querySelectorAll('#phase button').forEach(b=>b.onclick=()=>setPhase(b.dataset.p));
setPhase('nino');

/* Clima */
const wc=c=>c===0?'Céu limpo':c<=2?'Parcialmente nublado':c===3?'Nublado':c<=48?'Neblina':c<=57?'Garoa':c<=67?'Chuva':c<=77?'Neve':c<=82?'Pancadas de chuva':c<=99?'Tempestade':'—';
let city={n:'São Paulo',la:-23.55,lo:-46.63};
async function loadClima(){loadCity();loadMap()}
async function loadCity(){
  $('#cityTitle').textContent=city.n.toLowerCase()+' agora';
  try{
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+city.la+'&longitude='+city.lo+'&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,precipitation_sum,wind_gusts_10m_max&timezone=auto&forecast_days=5');
    const d=await r.json(),c=d.current,dy=d.daily;
    $('#sp').innerHTML='<div class="nowgrid"><div class="slide solid" style="margin:0;padding:24px"><div class="big">'+Math.round(c.temperature_2m)+'°</div><p style="margin:12px 0 0"><b>'+wc(c.weather_code)+'</b><br>Sensação '+Math.round(c.apparent_temperature)+'° · Umidade '+c.relative_humidity_2m+'%<br>Vento '+Math.round(c.wind_speed_10m)+' km/h</p></div><div class="days">'+
      dy.time.map((t,i)=>'<div class="box day"><b>'+new Date(t+'T12:00').toLocaleDateString('pt-BR',{weekday:'short',day:'numeric'})+'</b>'+wc(dy.weather_code[i])+'<br>'+Math.round(dy.temperature_2m_max[i])+'° / '+Math.round(dy.temperature_2m_min[i])+'°<br><span class="meta">chuva '+(dy.precipitation_probability_max[i]??0)+'%</span></div>').join('')+'</div></div>';
    showAlerts(dy);
  }catch(e){$('#sp').innerHTML='<span class="err">Não foi possível carregar o tempo. Verifique a conexão e recarregue.</span>';$('#alerts').textContent='Sem dados de previsão no momento.'}
}
/* Alertas automáticos (critérios nossos, não oficiais) */
function showAlerts(dy){
  const out=[];
  dy.time.forEach((t,i)=>{
    const day=new Date(t+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'short'});
    const mm=dy.precipitation_sum[i]||0,g=dy.wind_gusts_10m_max[i]||0,tx=dy.temperature_2m_max[i]||0;
    if(mm>=50)out.push(['chuva muito forte',day,'Previsão de cerca de '+Math.round(mm)+' mm. Evite áreas alagáveis e encostas, não atravesse ruas alagadas e acompanhe a Defesa Civil (199).']);
    else if(mm>=30)out.push(['chuva forte',day,'Previsão de cerca de '+Math.round(mm)+' mm. Atenção a alagamentos e deslizamentos; evite sair em horários de pico de chuva.']);
    if(g>=60)out.push(['rajadas de vento',day,'Rajadas de até '+Math.round(g)+' km/h. Fique longe de árvores, placas e fios, e prenda objetos soltos.']);
    if(tx>=35)out.push(['calor intenso',day,'Máxima de '+Math.round(tx)+'°. Beba água, evite o sol entre 10h e 16h e proteja crianças, idosos e animais.']);
  });
  $('#alerts').innerHTML=out.length?out.map(a=>'<div class="box alert"><h3>'+a[0]+'</h3><p><b>'+esc(a[1])+'</b><br>'+esc(a[2])+'</p></div>').join(''):'<div class="box"><h3>sem alertas</h3><p>Nenhum alerta pelos nossos critérios nos próximos 5 dias.</p></div>';
}
/* Busca de cidade (geocodificação Open-Meteo) */
async function searchCity(){
  const q=$('#q').value.trim(),box=$('#res');if(q.length<2)return;
  box.textContent='Buscando…';
  try{
    const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(q)+'&count=6&language=pt&format=json');
    const d=await r.json(),a=d.results||[];
    if(!a.length){box.textContent='Nenhuma cidade encontrada.';return}
    box.innerHTML='';
    a.forEach(c=>{const b=document.createElement('button');b.textContent=[c.name,c.admin1,c.country].filter(Boolean).join(', ');
      b.onclick=()=>{city={n:c.name,la:c.latitude,lo:c.longitude};box.innerHTML='';$('#q').value='';loadCity()};box.appendChild(b)});
  }catch(e){box.innerHTML='<span class="err">Não foi possível buscar a cidade agora.</span>'}
}
$('#qb').onclick=searchCity;
$('#q').addEventListener('keydown',e=>{if(e.key==='Enter')searchCity()});
const UF=[['RR',2,0,2.82,-60.67],['AP',4,0,0.03,-51.07],['AM',1,1,-3.12,-60.02],['PA',3,1,-1.46,-48.5],['MA',4,1,-2.53,-44.3],['CE',5,1,-3.73,-38.52],['RN',6,1,-5.79,-35.21],
['AC',0,2,-9.97,-67.81],['RO',1,2,-8.76,-63.9],['MT',2,2,-15.6,-56.1],['TO',3,2,-10.18,-48.33],['PI',4,2,-5.09,-42.8],['PE',5,2,-8.05,-34.88],['PB',6,2,-7.12,-34.86],
['MS',2,3,-20.47,-54.62],['GO',3,3,-16.68,-49.25],['DF',4,3,-15.79,-47.88],['BA',5,3,-12.97,-38.51],['AL',6,3,-9.67,-35.74],
['MG',4,4,-19.92,-43.94],['ES',5,4,-20.32,-40.34],['SE',6,4,-10.91,-37.07],
['PR',2,5,-25.43,-49.27],['SP',3,5,-23.55,-46.63],['RJ',4,5,-22.91,-43.17],['SC',2,6,-27.59,-48.55],['RS',2,7,-30.03,-51.23]];
const S=[[214,213,208],[202,66,42],[90,26,14]];
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const heat=t=>{const k=Math.max(0,Math.min(1,(t-15)/23));return{k,c:'rgb('+(k<.5?mix(S[0],S[1],k*2):mix(S[1],S[2],(k-.5)*2)).join(',')+')'}};
async function loadMap(){
  const box=$('#tiles');
  try{
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude='+UF.map(u=>u[3]).join(',')+'&longitude='+UF.map(u=>u[4]).join(',')+'&current=temperature_2m&timezone=auto');
    const d=await r.json();
    box.innerHTML='';
    UF.forEach((u,i)=>{const t=d[i].current.temperature_2m,h=heat(t),el=document.createElement('div');
      el.className='tile';el.style.cssText='grid-column:'+(u[1]+1)+';grid-row:'+(u[2]+1)+';background:'+h.c+';color:'+(h.k<.3?'#2b1712':'#f6e9e4');
      el.title=u[0]+': '+t+' °C';el.innerHTML=u[0]+'<small>'+Math.round(t)+'°</small>';box.appendChild(el)});
  }catch(e){box.outerHTML='<p class="err">Não foi possível carregar o mapa.</p>'}
}

/* Notícias: Google Notícias (RSS via rss2json), com GDELT como reserva */
const GN={
 br:'https://news.google.com/rss/search?q='+encodeURIComponent('"El Niño" OR "La Niña" OR "previsão do tempo" OR "onda de calor" when:7d')+'&hl=pt-BR&gl=BR&ceid=BR:pt-419',
 world:'https://news.google.com/rss/search?q='+encodeURIComponent('"El Nino" OR "La Nina" drought OR flood OR heatwave when:7d')+'&hl=en-US&gl=US&ceid=US:en'};
const GD={br:'("El Niño" OR "La Niña" OR "previsão do tempo") sourcelang:portuguese',world:'("El Nino" OR "La Nina") sourcelang:english'};
const fmt=d=>{const x=new Date(String(d).replace(' ','T')+(String(d).includes('T')||String(d).includes('Z')?'':'Z'));return isNaN(x)?'':x.toLocaleDateString('pt-BR')};
async function fromGoogle(k){
  const r=await fetch('https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(GN[k]));
  const d=await r.json();
  if(d.status!=='ok')throw new Error('rss');
  return d.items.slice(0,20).map(i=>({t:i.title,u:i.link,s:(i.author||'Google Notícias'),d:fmt(i.pubDate)}));
}
async function fromGdelt(k){
  const r=await fetch('https://api.gdeltproject.org/api/v2/doc/doc?query='+encodeURIComponent(GD[k])+'&mode=artlist&format=json&maxrecords=20&sort=datedesc&timespan=7d');
  const d=await r.json();
  return (d.articles||[]).map(n=>{const s=n.seendate||'';return{t:n.title,u:n.url,s:n.domain,d:s?s.slice(6,8)+'/'+s.slice(4,6)+'/'+s.slice(0,4):''}});
}
async function loadNews(k){
  const l=$('#list');l.textContent='Carregando…';
  let a=[];
  try{a=await fromGoogle(k)}catch(e){try{a=await fromGdelt(k)}catch(e2){}}
  if(!a.length){l.innerHTML='<span class="err">Não foi possível carregar as notícias. Se abriu o arquivo direto do computador, hospede-o (GitHub Pages, Netlify) ou sirva com <code>python -m http.server</code>.</span>';return}
  l.innerHTML=a.map(n=>'<a href="'+esc(n.u)+'" target="_blank" rel="noopener"><span><b>'+esc(n.t)+'</b><br><small>'+esc(n.s)+(n.d?' · '+n.d:'')+'</small></span></a>').join('');
}
document.querySelectorAll('#nf button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#nf button').forEach(x=>x.setAttribute('aria-pressed',x===b));
  loadNews(b.dataset.q)});

/* Selo do ENOS: lê data/enso-status.json (atualizar a cada boletim mensal da NOAA/CPC) */
const ENSO_PADRAO={fase:'el niño em atuação',txt:'Segundo a NOAA, o El Niño continua se fortalecendo e um evento forte a muito forte é provável até jan–mar de 2027 (chance acima de 79%). Niño-3.4: +2,5 °C.',data:'2026-11-12',prox:'2026-12-10',url:'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml'};
const fdata=iso=>new Date(iso+'T12:00:00').toLocaleDateString('pt-BR');
async function loadEnso(){
  let e=ENSO_PADRAO;
  try{const r=await fetch('data/enso-status.json',{cache:'no-cache'});if(r.ok)e=await r.json()}catch(_){}
  const velho=new Date()>new Date(e.prox+'T23:59:59');
  $('#enso').innerHTML='agora no pacífico<b>'+esc(e.fase)+'</b>'+esc(e.txt)+(velho?'<br><strong>Possivelmente desatualizado: a data da próxima atualização já passou. Confira a fonte.</strong>':'')+'<br><small>Boletim de '+fdata(e.data)+' · próximo em '+fdata(e.prox)+' · <a href="'+esc(e.url)+'" target="_blank" rel="noopener">fonte: NOAA</a></small>';
}
loadEnso();

/* Acessibilidade */
let tab='info',zi=1,hc=false;const ZS=[.9,1,1.15,1.3];
function applyInv(){document.body.classList.toggle('inv',!hc&&(tab==='clima'||tab==='about'))}
function applyA(){document.querySelector('.wrap').style.zoom=ZS[zi];document.body.classList.toggle('hc',hc);$('#hc').setAttribute('aria-pressed',hc);applyInv();
  try{localStorage.setItem('a11y',JSON.stringify({zi,hc}))}catch(e){}}
try{const v=JSON.parse(localStorage.getItem('a11y')||'null');if(v){zi=v.zi;hc=v.hc}}catch(e){}
$('#fm').onclick=()=>{zi=Math.max(0,zi-1);applyA()};
$('#fz').onclick=()=>{zi=1;applyA()};
$('#fp').onclick=()=>{zi=Math.min(3,zi+1);applyA()};
$('#hc').onclick=()=>{hc=!hc;applyA()};
applyA();

/* Inicialização: abre a aba indicada no endereço (#clima etc.) */
showTab(location.hash.slice(1));
