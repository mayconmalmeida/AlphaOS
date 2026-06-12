## 1. Desenho de Arquitetura

```mermaid
flowchart LR
  U["Usuário (Browser)"] --> FE["Frontend (React + Vite)"]
  FE --> ROUTER["React Router"]
  FE --> UI["UI System (Tailwind + shadcn/ui)"]
  FE --> CHARTS["Charts (Recharts)"]
  FE --> STATE["State (Zustand)"]
  FE --> DATA["Camada de Dados (Services/Repositories)"]

  DATA --> MOCKS["Mock Providers (Fase 1)"]
  DATA --> SB["Supabase (Fase 2+)"]
  SB --> DB["PostgreSQL"]
  SB --> AUTH["Supabase Auth"]
  SB --> EDGE["Edge Functions (IA/CMC)"]

  EDGE --> EXT["Serviços Externos (CoinMarketCap, OpenAI)"]
```

## 2. Descrição de Tecnologias
- Frontend: React@18 + TypeScript + Vite
- Roteamento: react-router-dom
- UI: Tailwind CSS + shadcn/ui (Radix)
- Charts: Recharts
- State: Zustand
- Backend (Fase 2+): Supabase (PostgreSQL + Auth + Edge Functions)
- IA (Fase 3+): OpenAI via Edge Functions, com fallback mock se não houver chave
- Dados Externos (Fase 3+): CoinMarketCap via Edge Functions, com cache e mocks

## 3. Definições de Rotas
| Rota | Propósito |
|------|-----------|
| / | Redirecionar para /landing (ou abrir /dashboard quando autenticado) |
| /landing | Página institucional do produto |
| /dashboard | Tela principal com oportunidades e painéis de mercado |
| /hypotheses | Central de hipóteses |
| /hypotheses/:id | Detalhe de hipótese com evidências |
| /market-memory | Explorer e timeline de memória de mercado |
| /market-replay | Player de replay histórico |
| /strategy-lab | Laboratório de evolução de estratégias |
| /research | Biblioteca e viewer de relatórios |
| /settings | Preferências e conta |

## 4. Definições de APIs (quando houver backend)
As interações entre UI e dados seguem abstrações estáveis para permitir mock → real sem quebrar páginas.

### 4.1 Contratos (TypeScript)
```ts
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; code?: string } }
```

## 5. Diagrama de Camadas do Servidor (Fase 2+)

```mermaid
flowchart TD
  UIX["UI (Pages/Components)"] --> HOOKS["Hooks"]
  HOOKS --> SERVICES["Services"]
  SERVICES --> REPOS["Repositories"]
  REPOS --> SBCLIENT["Supabase Client"]
  SBCLIENT --> DBX["PostgreSQL"]
```

## 6. Modelo de Dados (planejado)

### 6.1 ER (alto nível)
```mermaid
erDiagram
  market_snapshots ||--o{ market_embeddings : "snapshot_id"
  hypotheses ||--o{ evidence : "hypothesis_id"
  hypotheses ||--o{ strategies : "hypothesis_id"
  strategies ||--o{ backtests : "strategy_id"

  market_snapshots {
    uuid id
    date date
    float btc_dominance
    float fear_greed
    float market_cap
    float volume
    float sentiment
    jsonb narratives
    jsonb technicals
    jsonb categories
    text news_summary
    jsonb raw_data
    timestamp created_at
  }

  market_embeddings {
    uuid id
    uuid snapshot_id
    vector embedding
    timestamp created_at
  }

  narratives {
    uuid id
    text name
    float strength
    float velocity
    float growth
    float rotation_score
    timestamp created_at
  }

  hypotheses {
    uuid id
    text title
    text description
    float confidence
    float risk_score
    text status
    text expected_horizon
    timestamp created_at
  }

  evidence {
    uuid id
    uuid hypothesis_id
    text source_type
    text source_name
    float confidence
    float impact_score
    text reasoning
    timestamp created_at
  }

  strategies {
    uuid id
    uuid hypothesis_id
    text strategy_name
    jsonb strategy_json
    float score
    timestamp created_at
  }

  backtests {
    uuid id
    uuid strategy_id
    float return
    float drawdown
    float win_rate
    float sharpe
    float profit_factor
    int trade_count
    timestamp created_at
  }

  research_reports {
    uuid id
    text title
    text report_type
    text content
    timestamp created_at
  }
```

### 6.2 DDL (será implementado na Fase 2)
A definição exata de tabelas, grants e RLS será criada junto da integração do Supabase, mantendo chaves sensíveis apenas em ambiente server-side (Edge Functions).

