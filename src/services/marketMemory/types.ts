export type MarketSnapshot = {
  id: string
  date: string
  title: string
  summary: string
  sourceMode?: "live" | "fallback"
  lastSyncAt?: string | null
  sourceCapabilities?: string[]
  quotes?: Array<{
    symbol: string
    priceUsd: number
    volume24hUsd: number
    marketCapUsd: number
  }>
  news?: Array<{
    id: string
    title: string
    source: string
    publishedAt: string
    sentimentScore?: number
    summary?: string
  }>
  marketPulse: {
    btcDominance: number
    fearGreed: number
    marketCapUsd: number
    volume24hUsd: number
    sentimentScore: number
    newsMomentum: number
  }
  narratives: Array<{
    name: string
    strength: number
    velocity: number
    growth: number
  }>
  categories?: Array<{
    name: string
    strength: number
    rotationScore: number
  }>
  technicals?: Array<{
    symbol: string
    trend: string
    momentum: number
    volatility: number
  }>
  context: {
    historicalContext: string
    whatHappenedNext: string
  }
}

export type SimilarSnapshot = {
  snapshot: MarketSnapshot
  similarity: number
  reasoning: string
  method: "vector" | "heuristic"
}

export type SnapshotComparison = {
  a: MarketSnapshot
  b: MarketSnapshot
  delta: {
    btcDominance: number
    fearGreed: number
    marketCapUsd: number
    volume24hUsd: number
    sentimentScore: number
    newsMomentum: number
  }
}

