# Environment Variables

Research and simulation only. Not financial advice.

## Frontend (`.env`)

Use `.env.local` or `.env` during desenvolvimento:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### `VITE_SUPABASE_URL`

- URL do projeto Supabase.
- Necessaria para Edge Functions, proxy CMC e RPC de busca vetorial.

### `VITE_SUPABASE_ANON_KEY`

- Chave anonima do Supabase para o frontend.
- Necessaria para invocar Edge Functions sem expor segredos sensiveis.

## Edge Function Secrets (configurar no Supabase)

Estas variaveis nao devem ir para o frontend:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
CMC_API_KEY=
CMC_API_BASE_URL=https://pro-api.coinmarketcap.com
```

### `OPENAI_API_KEY`

- Usada pelas funções `generate-ai-response` e `generate-embedding`.

### `OPENAI_MODEL`

- Modelo default para outputs estruturados.

### `OPENAI_EMBEDDING_MODEL`

- Modelo default para embeddings.

### `CMC_API_KEY`

- Chave da CoinMarketCap Pro API.
- Consumida apenas pela função `coinmarketcap-proxy`.

### `CMC_API_BASE_URL`

- Base URL da CoinMarketCap Pro API.
- Default esperado: `https://pro-api.coinmarketcap.com`

## Comportamento de Fallback

- Sem Supabase configurado:
  - frontend usa mock/fallback
- Sem `OPENAI_API_KEY`:
  - Edge Functions retornam mock estruturado
- Sem `CMC_API_KEY` ou com falha/rate limit:
  - proxy CMC retorna fallback mock

## Setup Rapido

1. Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no frontend.
2. Configurar secrets no painel do Supabase.
3. Fazer deploy das Edge Functions:
   - `generate-ai-response`
   - `generate-embedding`
   - `coinmarketcap-proxy`
4. Rodar:

```bash
npm install
npm run dev
```
