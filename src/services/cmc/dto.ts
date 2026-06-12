export type CmcQuoteDto = {
  symbol: string
  price_usd: number
  volume_24h_usd: number
  market_cap_usd: number
}

export type CmcCategoryDto = {
  name: string
  strength: number
  rotation_score: number
}

export type CmcTechnicalDto = {
  symbol: string
  trend: "bullish" | "neutral" | "bearish"
  momentum: number
  volatility: number
}

export type CmcSentimentDto = {
  fear_greed: number
  sentiment_score: number
}

export type CmcDominanceDto = {
  btc_dominance: number
}

export type CmcNarrativeDto = {
  name: string
  strength: number
  velocity: number
  growth: number
  rotation_score: number
}

export type CmcNewsItemDto = {
  id: string
  title: string
  source: string
  published_at: string
  sentiment_score?: number
  summary?: string
}

export type CmcMarketPulseDto = {
  dominance: CmcDominanceDto
  sentiment: CmcSentimentDto
  totals: {
    market_cap_usd: number
    volume_24h_usd: number
  }
  news_momentum: number
}

