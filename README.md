# El Niño em Foco

Site estático (HTML + CSS + JS puros). Sem build, sem servidor, sem chaves de API e sem dependências pagas.

## Rodar localmente
    python3 -m http.server 8000     # abra http://localhost:8000
(Abrir o index.html direto do disco não funciona: o navegador bloqueia a leitura dos JSON.)

## Manutenção de conteúdo
- `data/enso-status.json`: atualize após cada discussão mensal do CPC (alertStatusPt, issuedAt, nextUpdateAt, summaryPt, highlights, curatedAt, curatedBy). Passada a data nextUpdateAt, o selo "desatualizado" aparece sozinho.
- `data/news.json`: adicione itens reais: title, sourceName, publishedAt (ISO), url, summary (palavras próprias, até 300 caracteres), tags ["brasil","sao-paulo"]. Itens sem data ou link são descartados.
- `data/config.json`: município-alvo e centro [lon, lat].
- `data/municipio.geojson` (opcional): contorno do município; confira termos do IBGE antes de usar.
- Textos de Entenda e Impactos: em `app.js` (objeto IMPACTOS e função pageEntenda).
