# AlphaOS

## Project Name

AlphaOS

## Tagline

The Autonomous Market Research Agent

## One-Liner

AlphaOS transforms CoinMarketCap intelligence into explainable market hypotheses, historical analogues, strategy candidates and institutional research reports.

## Problem

Crypto markets generate too many disconnected signals: prices, sentiment, narratives, news, technicals and categories. Traders and researchers struggle to connect these signals into evidence-backed market theses.

## Solution

AlphaOS acts as an autonomous market research agent that ingests CoinMarketCap intelligence, builds market memory, detects narrative shifts, generates Alpha Opportunities, explains why they matter now, validates them with evidence, compares them against historical analogues, derives strategy candidates and produces research reports.

## Core Features

- Guided Journey
- Alpha Opportunities
- Alpha Score
- Why Now
- Evidence Graph
- Market Memory
- Market Replay
- Strategy Builder
- Critic Agent
- Research Reports
- System Health
- CoinMarketCap Intelligence Coverage

## Architecture

CoinMarketCap Data  
→ Ingestion  
→ Market Snapshots  
→ Market Documents  
→ Embeddings  
→ pgvector  
→ RAG  
→ Hypothesis Engine  
→ Strategy Builder  
→ Critic Agent  
→ Research Reports

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Edge Functions
- pgvector
- OpenAI
- CoinMarketCap API

## CoinMarketCap Usage

AlphaOS is designed around turning CoinMarketCap’s raw signals into a single, explainable research chain:

- Quotes: market context, dominance signals, and asset-level inputs.
- Technicals: confirmation signals that support or weaken a thesis.
- News: event-driven catalysts and narrative accelerants.
- Sentiment: crowd positioning and regime-level mood.
- Categories: sector intelligence and rotation context.
- Narratives: narrative velocity/strength and what’s gaining attention.
- MCP-ready architecture: ingestion + normalization + storage interfaces designed for “swap the provider, keep the product” evolution.
- Skills Marketplace readiness: clear, modular research/strategy outputs that map to composable “skills” (generate, critique, report).

## AI Architecture

- RAG: grounded answers and research outputs backed by retrieved evidence.
- Embeddings: market documents are embedded for similarity + recall across time.
- Hypothesis Generation: structured opportunities with “why now” and evidence requirements.
- Alpha Score: explainable scoring that summarizes opportunity strength and risk.
- Critic Agent: structured critique + approval gating for institutional tone/quality.
- Report Generation: converts the full chain into a shareable research artifact.

## Demo Flow

Open the app → click **Explore Today’s Best Opportunity** → continue through the 7 guided steps on `/journey`.

## Environment Variables

Frontend (Vite):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Edge Function secrets (configure in Supabase, not in Vite):

- `OPENAI_API_KEY`
- `CMC_API_KEY`

## Running Locally

```bash
npm install
npm run dev
npm run check
npm run build
```

## Disclaimer

For research and simulation only. Not financial advice.
