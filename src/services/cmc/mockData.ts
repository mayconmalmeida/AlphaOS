import type {
  CmcCategoryDto,
  CmcMarketPulseDto,
  CmcNarrativeDto,
  CmcNewsItemDto,
  CmcQuoteDto,
  CmcTechnicalDto,
} from "@/services/cmc/dto"

export const mockMarketPulse: CmcMarketPulseDto = {
  dominance: { btc_dominance: 53.2 },
  sentiment: { fear_greed: 62, sentiment_score: 0.58 },
  totals: { market_cap_usd: 2.78e12, volume_24h_usd: 1.12e11 },
  news_momentum: 0.64,
}

export const mockNarratives: CmcNarrativeDto[] = [
  { name: "AI", strength: 86, velocity: 72, growth: 61, rotation_score: 68 },
  { name: "RWA", strength: 64, velocity: 58, growth: 52, rotation_score: 49 },
  { name: "DePIN", strength: 58, velocity: 55, growth: 48, rotation_score: 44 },
  { name: "Gaming", strength: 42, velocity: 41, growth: 36, rotation_score: 31 },
  { name: "Layer 2", strength: 55, velocity: 49, growth: 44, rotation_score: 46 },
  { name: "Memecoins", strength: 51, velocity: 39, growth: 33, rotation_score: 57 },
]

export const mockNews: CmcNewsItemDto[] = [
  {
    id: "n1",
    title: "Infra stacks see renewed interest as narratives consolidate",
    source: "Market Desk",
    published_at: "2026-06-11T12:40:00Z",
    sentiment_score: 0.18,
    summary: "Flow is concentrating in infrastructure, dispersion is tightening, and liquidity is improving in category leaders.",
  },
  {
    id: "n2",
    title: "RWA projects gain mindshare after regulatory clarity headlines",
    source: "Wire",
    published_at: "2026-06-11T09:10:00Z",
    sentiment_score: 0.12,
    summary: "Headlines are strengthening the narrative, but short-term overextension risk is rising.",
  },
  {
    id: "n3",
    title: "Rotation watch: memecoins cooling off, AI remains sticky",
    source: "Signals (Editorial)",
    published_at: "2026-06-10T22:20:00Z",
    sentiment_score: -0.04,
    summary: "Flow is leaving high beta and concentrating in productivity and infrastructure narratives.",
  },
]

export const mockQuotes: CmcQuoteDto[] = [
  { symbol: "BTC", price_usd: 106420, volume_24h_usd: 2.3e10, market_cap_usd: 2.1e12 },
  { symbol: "ETH", price_usd: 5890, volume_24h_usd: 1.2e10, market_cap_usd: 7.1e11 },
  { symbol: "SOL", price_usd: 342, volume_24h_usd: 3.2e9, market_cap_usd: 1.8e11 },
]

export const mockCategories: CmcCategoryDto[] = [
  { name: "Infrastructure", strength: 74, rotation_score: 61 },
  { name: "AI", strength: 71, rotation_score: 58 },
  { name: "RWA", strength: 62, rotation_score: 49 },
  { name: "DePIN", strength: 57, rotation_score: 44 },
  { name: "Gaming", strength: 41, rotation_score: 29 },
]

export const mockTechnicals: CmcTechnicalDto[] = [
  { symbol: "BTC", trend: "bullish", momentum: 0.68, volatility: 0.39 },
  { symbol: "ETH", trend: "bullish", momentum: 0.66, volatility: 0.41 },
  { symbol: "SOL", trend: "neutral", momentum: 0.59, volatility: 0.53 },
  { symbol: "BNB", trend: "neutral", momentum: 0.55, volatility: 0.33 },
  { symbol: "XRP", trend: "bearish", momentum: 0.44, volatility: 0.48 },
]

