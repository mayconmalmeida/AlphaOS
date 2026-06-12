# AlphaOS

## Vision

Build a world-class AI-native market intelligence platform called AlphaOS.

AlphaOS is not a trading bot.

AlphaOS is not a crypto dashboard.

AlphaOS is not a chatbot.

AlphaOS is a Market Intelligence Operating System that transforms CoinMarketCap data into:

* Market Memory
* Narrative Intelligence
* Alpha Discovery
* Strategy Evolution
* Explainable Research
* Institutional Reports

The platform should look and feel like a funded fintech startup rather than a hackathon project.

Design quality must be comparable to:

* Bloomberg Terminal
* Linear
* Stripe Dashboard
* Vercel
* Arc Browser

Everything must be production-grade.

---

# Core Product Philosophy

Current crypto tools focus on:

* Prices
* Indicators
* Signals

AlphaOS focuses on:

* Hypotheses
* Narratives
* Market Memory
* Evidence
* Alpha Discovery

The goal is to answer:

"What opportunities is the market not seeing yet?"

---

# Tech Stack

Frontend

* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Router
* Recharts

Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Edge Functions
* pgvector-ready architecture

AI

* OpenAI
* Embeddings
* Structured outputs

External Data

CoinMarketCap

* Quotes
* Technicals
* News
* Sentiment
* Categories
* Narratives
* Skills Marketplace
* MCP

---

# Application Structure

Create the following pages:

/landing

/dashboard

/hypotheses

/market-memory

/market-replay

/strategy-lab

/research

/settings

---

# LANDING PAGE

Headline:

The Market Intelligence Operating System

Subheadline:

Discover opportunities before they become narratives.

Primary CTA:

Explore Today's Alpha

Secondary CTA:

View Research Reports

Sections:

Hero

Market Memory

Narrative Intelligence

Alpha Discovery

Strategy Evolution

Research Engine

Testimonials Placeholder

FAQ

Footer

Design must feel premium and institutional.

No generic crypto landing page.

---

# DASHBOARD

This is the main application screen.

Create:

## Today's Alpha Opportunities

Display cards:

Opportunity Name

Confidence Score

Risk Score

Market Regime

Narrative Strength

Expected Horizon

Example:

AI Infrastructure Expansion

91% Confidence

---

## Market Regime Card

Display:

Current Regime

Confidence

Risk Level

Market Conditions

Examples:

Bull Expansion

Liquidity Rotation

Risk-Off

Narrative Driven

---

## Narrative Radar

Display narrative strength.

Examples:

AI

RWA

DePIN

Gaming

Layer 2

Memecoins

Infrastructure

Real-time radar chart.

---

## Narrative Rotation

Show capital rotation flow.

Example:

Memecoins → AI

Gaming → Infrastructure

---

## Market Pulse

Show:

BTC Dominance

Fear & Greed

Market Cap

Volume

Sentiment

News Momentum

---

# MARKET MEMORY MODULE

Core feature.

Create:

Market Memory Explorer

Purpose:

Store daily market snapshots.

Every snapshot contains:

* Market metrics
* Narratives
* Sentiment
* Technicals
* Categories
* News summaries

Create a timeline visualization.

Users must be able to:

Search historical periods.

Compare periods.

View similar periods.

Display:

Similarity Score

Historical Context

What Happened Next

---

# ALPHA TIMELINE

Premium timeline component.

Example:

2023 AI Expansion

↓

2024 Infrastructure Boom

↓

2026 Current Market

Similarity: 92%

Users must visually understand where current market fits in history.

---

# MARKET REPLAY MODULE

One of the most impressive features.

Purpose:

Replay historical market periods.

Example:

Replay March 2024

The system reconstructs:

Narratives

Sentiment

News

Market Conditions

Capital Rotation

Display playback controls.

Display progression.

Display final outcomes.

The experience should feel like Netflix for market intelligence.

---

# NARRATIVE INTELLIGENCE MODULE

Purpose:

Understand where attention and capital are moving.

Metrics:

Narrative Velocity

Narrative Strength

Narrative Growth

Narrative Rotation

Display:

Top Emerging Narratives

Top Losing Narratives

Narrative Evolution

Narrative Correlations

Create beautiful visualizations.

---

# HYPOTHESIS ENGINE

Most important feature.

AlphaOS does not generate signals.

AlphaOS generates hypotheses.

Example:

Hypothesis #214

AI Infrastructure Expansion

Confidence: 91%

Status: Open

Expected Horizon: 45 Days

Supporting Evidence:

Historical Similarity

Narrative Acceleration

Volume Expansion

Sentiment Growth

Capital Rotation

Users can open a hypothesis and view all evidence.

---

# EVIDENCE CENTER

Every hypothesis must have explainability.

Display:

Evidence Sources

Narratives

Technical Signals

Sentiment Signals

Historical Analogues

News Signals

Supporting Metrics

Each evidence receives:

Confidence

Impact Score

Reasoning

No black-box AI.

Everything must be explainable.

---

# STRATEGY EVOLUTION LAB

Purpose:

Generate multiple strategies.

Workflow:

Hypothesis

↓

Generate 50 Variations

↓

Backtest

↓

Rank

↓

Select Top Performers

Display:

Generation Progress

Strategy Comparison

Performance Metrics

Selection Process

---

# STRATEGY DETAILS

Each strategy displays:

Name

Objective

Assets

Entry Rules

Exit Rules

Position Sizing

Risk Controls

Expected Horizon

Backtest Metrics

Export JSON

---

# BACKTEST ENGINE

Display:

Total Return

Max Drawdown

Sharpe Proxy

Win Rate

Profit Factor

Benchmark Comparison

Equity Curve

Drawdown Curve

Trade Count

---

# CRITIC AGENT

Critical evaluation engine.

Evaluate:

Overfitting Risk

Liquidity Risk

Narrative Dependency

Market Dependency

Sample Size

Risk Concentration

Explain all findings.

Display:

Passed

Warning

Failed

---

# RESEARCH ENGINE

Generate institutional-grade research reports.

Create:

Research Library

Research Viewer

Generate Report Button

Example Reports:

AI Infrastructure Report

Narrative Rotation Report

Market Regime Report

Altcoin Cycle Report

---

# REPORT STRUCTURE

Executive Summary

Market Conditions

Narrative Analysis

Evidence

Opportunities

Risks

Strategy Suggestions

Appendix

Display professionally.

---

# DATABASE STRUCTURE

market_snapshots

id

date

btc_dominance

fear_greed

market_cap

volume

sentiment

narratives

technicals

categories

news_summary

raw_data

created_at

---

market_embeddings

id

snapshot_id

embedding

created_at

---

narratives

id

name

strength

velocity

growth

rotation_score

created_at

---

hypotheses

id

title

description

confidence

risk_score

status

expected_horizon

created_at

---

evidence

id

hypothesis_id

source_type

source_name

confidence

impact_score

reasoning

created_at

---

strategies

id

hypothesis_id

strategy_name

strategy_json

score

created_at

---

backtests

id

strategy_id

return

drawdown

win_rate

sharpe

profit_factor

trade_count

created_at

---

research_reports

id

title

report_type

content

created_at

---

# DESIGN REQUIREMENTS

Dark Theme

Premium Typography

Glass Effects

Subtle Animations

Responsive

Desktop First

Tablet Optimized

Mobile Optimized

No generic crypto styling.

No neon.

No meme aesthetics.

Everything should feel institutional.

---

# USER EXPERIENCE

The first screen a user sees must instantly communicate:

"We found something important in the market."

Do not prioritize charts.

Prioritize insights.

The product should feel like:

An AI analyst team working 24/7.

---

# IMPORTANT

Never position AlphaOS as:

* Trading Bot
* Signal Provider
* Crypto Chat

Always position AlphaOS as:

Market Intelligence Operating System.

Every feature must reinforce this vision.
