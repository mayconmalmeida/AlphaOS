Cada prompt deve terminar com:

"Não implemente funcionalidades futuras. Apenas prepare a arquitetura para elas."

Assim evitamos retrabalho.

PROMPT 01 — FOUNDATION

Objetivo:
Criar a fundação do AlphaOS.

O que deve fazer
Criar projeto AlphaOS
Configurar React
Configurar TypeScript
Configurar Tailwind
Configurar shadcn
Configurar React Router
Criar layout principal
Criar sidebar
Criar topbar
Criar sistema de navegação
Criar tema dark premium
Criar design system
Criar componentes reutilizáveis

Rotas:

/
dashboard
hypotheses
market-memory
market-replay
strategy-lab
research
settings

Não criar nenhuma lógica de negócio.

Somente:

Estrutura
Navegação
Responsividade
Layout

Inspirar em:

Linear
Stripe
Vercel
PROMPT 02 — DATABASE & SUPABASE

Objetivo:
Criar toda a estrutura de banco.

Criar

Tabelas:

market_snapshots
market_embeddings
narratives
hypotheses
evidence
strategies
backtests
research_reports

Criar:

Types
Services
Repositories
Hooks

Tudo preparado para Supabase.

Não implementar IA.

Não implementar CMC.

Somente persistência.

PROMPT 03 — CMC DATA LAYER

Objetivo:
Criar a camada de integração CoinMarketCap.

Criar

Services:

QuotesService
TechnicalsService
SentimentService
NewsService
NarrativesService
CategoriesService

Criar:

DTOs
Mappers
Cache Layer

Criar mocks.

Não conectar API real ainda.

Toda UI deve consumir abstrações.

PROMPT 04 — MARKET MEMORY ENGINE

Objetivo:
Criar o Market Memory.

Implementar

Tela:

Market Memory

Funcionalidades:

Timeline
Snapshot Explorer
Similar Markets
Historical Comparisons

Mockar embeddings.

Mockar similarity score.

Criar UX completa.

Não conectar IA.

PROMPT 05 — NARRATIVE INTELLIGENCE

Objetivo:
Criar módulo Narrative Intelligence.

Implementar

Narrative Radar

Narrative Velocity

Narrative Strength

Narrative Rotation

Visualizações:

Radar
Heatmap
Rankings

Criar dashboard extremamente bonito.

Utilizar mock data.

PROMPT 06 — HYPOTHESIS ENGINE

Objetivo:
Criar principal diferencial.

Tela

Hypothesis Center

Criar:

Hypothesis Cards

Campos:

Confidence
Risk
Evidence Count
Horizon
Status

Criar:

Hypothesis Detail Page

Mostrar:

Evidence
Narrative Signals
Historical Analogues

Tudo mockado.

Não usar IA ainda.

PROMPT 07 — STRATEGY EVOLUTION LAB

Objetivo:
Criar laboratório de estratégias.

Implementar

Pipeline visual:

Hypothesis

↓

Generate

↓

Backtest

↓

Critic

↓

Approved

Mostrar:

50 estratégias mockadas.

Comparações.

Rankings.

Tabela.

Cards.

UX premium.

PROMPT 08 — CRITIC AGENT

Objetivo:
Criar experiência do Critic.

Avaliações

Overfitting

Liquidity

Narrative Dependency

Market Dependency

Risk Concentration

Sample Size

Criar:

Painel tipo auditoria.

Estilo:

Security Center.

PROMPT 09 — MARKET REPLAY

Objetivo:
Criar funcionalidade WOW.

Implementar

Player

Timeline

Speed

Pause

Replay

Eventos históricos

Narrativas históricas

Sentimento histórico

Criar UX parecida com:

Netflix + TradingView

Tudo mockado.

PROMPT 10 — RESEARCH CENTER

Objetivo:
Criar módulo institucional.

Criar

Research Library

Research Viewer

Generate Report

Template profissional.

Seções:

Executive Summary
Evidence
Narratives
Opportunities
Risks

Visual estilo:

Goldman Sachs
Bloomberg Research

PROMPT 11 — OpenAI Integration

Objetivo: conectar a IA de forma segura e escalável.

Implement OpenAI integration for AlphaOS.

Create a clean AI service layer prepared for:
- text generation
- structured JSON outputs
- strategy generation
- hypothesis generation
- critic agent
- report generation

Requirements:
- Never expose API keys on frontend
- Use Supabase Edge Functions for AI calls
- Create aiService.ts on frontend
- Create Supabase Edge Function: generate-ai-response
- Support structured outputs
- Add loading, error and retry states
- Add mock fallback if API key is missing

Do not implement business-specific prompts yet.
Only create the reusable AI infrastructure.
PROMPT 12 — Embeddings

Objetivo: transformar dados de mercado em memória vetorial.

Implement embeddings infrastructure for AlphaOS Market Memory.

Create service to generate embeddings for:
- market snapshots
- news summaries
- narrative reports
- technical summaries
- sentiment summaries
- historical market contexts

Requirements:
- Use Supabase Edge Function: generate-embedding
- Store embedding metadata
- Create embedding queue logic
- Add status fields: pending, processing, completed, failed
- Add retry mechanism
- Keep architecture compatible with pgvector

Do not implement RAG yet.
Only prepare embedding generation and storage.
PROMPT 13 — pgvector

Objetivo: ativar busca semântica no Supabase.

Implement pgvector support for AlphaOS.

Update Supabase schema to support vector search.

Create:
- market_documents table
- market_embeddings table
- similarity search function
- RPC function for semantic search
- indexes for vector similarity

Documents must support:
- snapshot
- news
- narrative
- technical
- sentiment
- category
- research

Create TypeScript types and repository methods.

Do not implement RAG response generation yet.
Only implement vector storage and retrieval.
PROMPT 14 — RAG

Objetivo: fazer a IA responder com evidências reais.

Implement RAG Evidence Engine for AlphaOS.

The goal is to retrieve relevant market evidence before generating any hypothesis or strategy.

Workflow:
1. User asks a market question
2. System embeds the question
3. System searches similar market documents
4. System ranks evidence
5. System sends retrieved evidence to the LLM
6. LLM answers using only retrieved context

Create:
- ragService.ts
- retrieveEvidence()
- rankEvidence()
- buildContextPrompt()
- EvidencePanel UI
- citations/evidence cards

Every AI answer must include:
- evidence used
- source type
- relevance score
- reasoning

Do not allow unsupported claims.
PROMPT 15 — Hypothesis Generation

Objetivo: criar o coração do AlphaOS.

Implement AlphaOS Hypothesis Generation Engine.

The system must generate market hypotheses, not trading signals.

Input:
- current market snapshot
- retrieved RAG evidence
- narrative data
- technical data
- sentiment data
- category data
- news data

Output structured JSON:
{
  "title": "",
  "description": "",
  "confidence": 0,
  "risk_score": 0,
  "expected_horizon": "",
  "market_regime": "",
  "related_assets": [],
  "related_narratives": [],
  "supporting_evidence": [],
  "invalidating_conditions": [],
  "why_now": "",
  "status": "open"
}

Create:
- Generate Hypothesis button
- Hypothesis detail page
- Evidence explanation
- Confidence score
- Risk score
- Invalidating conditions

Positioning:
AlphaOS generates explainable market hypotheses, not financial advice.
PROMPT 16 — Strategy Generation

Objetivo: transformar hipótese em estratégia backtestável.

Implement Strategy Generation Engine for AlphaOS.

For each hypothesis, generate multiple backtestable strategy specs.

Input:
- selected hypothesis
- evidence
- related assets
- market regime
- risk constraints

Generate 10 to 50 strategy variations.

Each strategy must include:
{
  "strategy_name": "",
  "objective": "",
  "universe": [],
  "entry_rules": [],
  "exit_rules": [],
  "position_sizing": "",
  "rebalance_frequency": "",
  "risk_controls": [],
  "stop_conditions": [],
  "benchmark": "",
  "time_horizon": ""
}

Create UI:
- Strategy Evolution pipeline
- Strategy cards
- Ranking table
- Export JSON button
- Compare strategies view

Do not execute real trades.
This is research and simulation only.
PROMPT 17 — Critic Agent

Objetivo: parecer produto institucional.

Implement Critic Agent for AlphaOS.

The Critic Agent reviews every generated strategy before approval.

Evaluate:
- overfitting risk
- liquidity risk
- drawdown risk
- narrative dependency
- market regime dependency
- sample size weakness
- concentration risk
- rule clarity
- backtest reliability

Output:
{
  "overall_status": "approved | warning | rejected",
  "score": 0,
  "findings": [],
  "warnings": [],
  "failure_reasons": [],
  "recommended_adjustments": []
}

Create UI:
- Critic Report panel
- Passed / Warning / Failed badges
- Final strategy approval score
- Explanation per risk item

The system must feel like an institutional audit layer.
PROMPT 18 — Report Generation

Objetivo: gerar material que parece de fundo/institucional.

Implement Research Report Generator for AlphaOS.

Users can generate institutional-grade research reports from:
- hypothesis
- evidence
- market memory
- narrative intelligence
- strategy results
- critic report

Report structure:
1. Executive Summary
2. Market Regime
3. Narrative Intelligence
4. Supporting Evidence
5. Historical Analogues
6. Alpha Hypothesis
7. Strategy Candidates
8. Risk Review
9. Invalidating Conditions
10. Appendix

Create:
- Generate Report button
- Research Report viewer
- Research Library
- Export as PDF-ready layout
- Shareable report page

Style:
Bloomberg Research + Goldman Sachs style.
Professional, clean, institutional.
PROMPT 19 — CoinMarketCap Real Data

Objetivo: sair do mock e usar dados reais.

Replace mock data with real CoinMarketCap data integration.

Use CoinMarketCap capabilities for:
- Quotes
- Technicals
- News
- Sentiment
- Categories
- Narratives
- Skills Marketplace
- MCP-ready architecture

Requirements:
- Create CMC API service layer
- Use Supabase Edge Functions to protect API keys
- Add caching
- Add rate limit handling
- Add fallback mock data if API fails
- Normalize all CMC responses into internal AlphaOS format

Create ingestion flow:
CMC data → normalized market snapshot → market document → embedding → RAG-ready memory.

Do not break existing UI.
PROMPT 20 — Performance + Production

Objetivo: deixar com cara de produto real.

Prepare AlphaOS for production and hackathon submission.

Optimize:
- loading states
- empty states
- error states
- mobile responsiveness
- dashboard performance
- route transitions
- API error handling
- caching
- code organization

Add:
- README-ready architecture summary
- environment variables documentation
- demo mode
- sample data seed
- disclaimer: Research and simulation only. Not financial advice.
- submission polish

Create a final demo flow:
1. Open dashboard
2. View today's alpha opportunities
3. Open hypothesis
4. View evidence
5. Generate strategy
6. Run critic agent
7. Generate report

The final product must feel like CoinMarketCap acquired AlphaOS and integrated it as a premium intelligence product.

Essa Fase 2 é a que transforma o projeto em algo competitivo de verdade: dados reais + RAG + hipóteses + estratégias + auditoria + relatório institucional.