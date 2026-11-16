# El Niño em foco — Pacífico & Clima

Site educativo sobre o fenômeno El Niño e La Niña, o ODS 13 e o clima no Brasil. Projeto da disciplina de Itinerário Extensionista do curso de Engenharia de Software da UNICSUL, com o professor Valter de Sales.

**Site:** https://allanacademic.github.io/el-nino-em-foco/

## O que o site tem

- **Informação:** o que é o El Niño e a La Niña, como são medidos, países mais afetados e linha do tempo dos grandes eventos.
- **Clima:** temperatura e previsão de 5 dias de qualquer cidade (padrão: São Paulo), alertas automáticos não oficiais e mapa de calor por estado.
- **Notícias:** impactos climáticos recentes ligados ao ENOS, em português e em inglês.
- **Quem somos:** grupo, instituição, ODS e ODS 13, dicas do que fazer e organizações para apoiar.
- **Acessibilidade:** ajuste do tamanho da fonte e modo de alto contraste.
- **Status do ENOS** no cabeçalho, com base no boletim mensal da NOAA/CPC.
- Links diretos para cada aba: `#info`, `#clima`, `#news` e `#about`.

## Estrutura

O site é **um único arquivo autossuficiente** (`index.html`, com HTML, CSS e JavaScript juntos), sem dependências e sem etapa de build. Isso facilita a correção e a publicação no GitHub Pages: basta existir um `index.html` na raiz.

Dentro do arquivo, o código está dividido em blocos comentados: estilos (`<style>`), conteúdo (HTML) e lógica (`<script>`).

## Como rodar localmente

Abra o `index.html` no navegador, ou sirva a pasta com um servidor local:

```bash
python -m http.server 8000
# abra http://localhost:8000
```

## Como atualizar o status do ENOS

A NOAA publica um boletim por mês. No `index.html`, procure por `ENSO_PADRAO` e edite `fase`, `txt`, `data` e `prox` (formato AAAA-MM-DD) e `url`. Se existir o arquivo `data/enso-status.json`, ele tem prioridade sobre esses valores. Se a data de `prox` passar, o site mostra um aviso de possível desatualização.

## Fontes de dados

- Tempo e geocodificação: [Open-Meteo](https://open-meteo.com)
- Notícias: Google Notícias (RSS via rss2json), com GDELT como reserva
- Status do ENOS: [NOAA Climate Prediction Center](https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml)

Para alertas e previsões oficiais, consulte INPE, INMET, Cemaden e a Defesa Civil.

## Equipe

Allan, Eliseu, Pedro, Kayk e Vinicius.

## Declaração de uso de inteligência artificial

Este site foi desenvolvido com o auxílio de inteligência artificial generativa (Claude, da Anthropic), na estrutura do código, no design visual e na redação de textos. Textos produzidos com IA podem conter imprecisões. A responsabilidade final pelo conteúdo é do grupo autor.
