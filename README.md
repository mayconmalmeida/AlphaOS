# AlphaOS

AlphaOS e um agente autonomo de pesquisa de mercado com interface premium, pipeline de evidencias, geracao de hipoteses, laboratorio de estrategias, auditoria institucional e relatorios prontos para demo/hackathon.

Research and simulation only. Not financial advice.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + componentes utilitarios
- React Router
- Recharts
- Supabase Edge Functions
- OpenAI infrastructure layer
- CoinMarketCap proxy architecture
- pgvector-ready semantic retrieval

## Arquitetura

- `src/pages`
  - Telas principais: Dashboard, Hypotheses, Strategy Lab, Research e Settings.
- `src/components`
  - Shell da aplicacao, layouts e visualizacoes reutilizaveis.
- `src/hooks`
  - Orquestracao de loading, erro, retry, demo mode e acoes de produto.
- `src/services/cmc`
  - Camada CoinMarketCap com provider resiliente: `edge-proxy -> fallback mock`.
- `src/services/hypotheses`
  - Hypothesis Generation Engine + persistencia local.
- `src/services/strategies`
  - Strategy Generation Engine + ranking + comparacao + export.
- `src/services/critic`
  - Critic Agent com output estruturado e gate de aprovacao.
- `src/services/research`
  - Report Generation + biblioteca + viewer + pagina compartilhavel.
- `src/services/embeddings`
  - Fila de embeddings, retry e persistencia local.
- `src/services/pgvector`
  - Repositorio pronto para Supabase RPC e busca vetorial.
- `supabase/functions`
  - Edge Functions para IA, embeddings e CoinMarketCap proxy.

## Fluxo do Produto

1. Dashboard mostra oportunidades e regime.
2. Hypothesis Center explica a tese e suas evidencias.
3. Strategy Lab gera estrategias backtestaveis.
4. Critic Agent revisa e marca aprovacao institucional.
5. Research Center gera relatorio institucional compartilhavel.
6. Settings opera infraestrutura, ingestao e demo mode.

## Demo Flow Final

1. Abrir `/dashboard`
2. Abrir uma hipotese em `/hypotheses`
3. Explorar evidencia e invalidating conditions
4. Gerar estrategias em `/strategy-lab`
5. Revisar critic report
6. Gerar relatorio em `/research`

## Dados Reais

- A integracao CMC usa `Supabase Edge Function` para proteger `CMC_API_KEY`.
- Quando a infra nao esta pronta ou algum endpoint falha, o app cai para mock sem quebrar a UX.
- O ingestion flow atual:
  - `CMC data -> normalized market snapshot -> embedding queue -> RAG-ready memory`

## Demo Mode e Sample Seed

- `Demo Mode` fica persistido em `localStorage`.
- `Settings` oferece `Seed Sample Data` para preparar a fila de embeddings.
- `Ingest CMC Snapshot` enfileira documentos normalizados do snapshot atual.

## Ambiente

- Veja `ENVIRONMENT.md` para configurar variaveis e segredos.

## Scripts

```bash
npm install
npm run dev
npm run check
npm run build
```
