import type {
  CmcCategoryDto,
  CmcMarketPulseDto,
  CmcNarrativeDto,
  CmcNewsItemDto,
  CmcTechnicalDto,
  CmcQuoteDto,
} from "@/services/cmc/dto"
import type {
  CategoryMetric,
  MarketPulse,
  NarrativeMetric,
  NewsItem,
  Quote,
  TechnicalSummary,
} from "@/services/cmc/types"

export function mapMarketPulse(dto: CmcMarketPulseDto): MarketPulse {
  return {
    btcDominance: dto.dominance.btc_dominance,
    fearGreed: dto.sentiment.fear_greed,
    marketCapUsd: dto.totals.market_cap_usd,
    volume24hUsd: dto.totals.volume_24h_usd,
    sentimentScore: dto.sentiment.sentiment_score,
    newsMomentum: dto.news_momentum,
  }
}

export function mapNarrative(dto: CmcNarrativeDto): NarrativeMetric {
  return {
    name: dto.name,
    strength: dto.strength,
    velocity: dto.velocity,
    growth: dto.growth,
    rotationScore: dto.rotation_score,
  }
}

export function mapNewsItem(dto: CmcNewsItemDto): NewsItem {
  return {
    id: dto.id,
    title: dto.title,
    source: dto.source,
    publishedAt: dto.published_at,
    sentimentScore: dto.sentiment_score,
    summary: dto.summary,
  }
}

export function mapQuote(dto: CmcQuoteDto): Quote {
  return {
    symbol: dto.symbol,
    priceUsd: dto.price_usd,
    volume24hUsd: dto.volume_24h_usd,
    marketCapUsd: dto.market_cap_usd,
  }
}

export function mapCategory(dto: CmcCategoryDto): CategoryMetric {
  return {
    name: dto.name,
    strength: dto.strength,
    rotationScore: dto.rotation_score,
  }
}

export function mapTechnical(dto: CmcTechnicalDto): TechnicalSummary {
  return {
    symbol: dto.symbol,
    trend: dto.trend,
    momentum: dto.momentum,
    volatility: dto.volatility,
  }
}

