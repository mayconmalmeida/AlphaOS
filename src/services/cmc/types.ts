export type MarketPulse = {
  btcDominance: number
  fearGreed: number
  marketCapUsd: number
  volume24hUsd: number
  sentimentScore: number
  newsMomentum: number
}

export type NarrativeMetric = {
  name: string
  strength: number
  velocity: number
  growth: number
  rotationScore: number
}

export type NarrativeRadarPoint = {
  name: string
  strength: number
}

export type MarketRegime = {
  name: string
  confidence: number
  riskLevel: "low" | "moderate" | "high"
  conditions: string[]
}

export type AlphaOpportunity = {
  title: string
  confidence: number
  riskScore: number
  marketRegime: string
  narrativeStrength: string
  expectedHorizon: string
}

export type NewsItem = {
  id: string
  title: string
  source: string
  publishedAt: string
  sentimentScore?: number
  summary?: string
}

export type TechnicalSummary = {
  symbol: string
  trend: "bullish" | "neutral" | "bearish"
  momentum: number
  volatility: number
}

export type CategoryMetric = {
  name: string
  strength: number
  rotationScore: number
}

export type Quote = {
  symbol: string
  priceUsd: number
  volume24hUsd: number
  marketCapUsd: number
}

