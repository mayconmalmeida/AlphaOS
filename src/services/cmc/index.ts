import { getCmcInfraStatus } from "@/lib/env"
import type {
  CmcCategoryDto,
  CmcMarketPulseDto,
  CmcNarrativeDto,
  CmcNewsItemDto,
  CmcQuoteDto,
  CmcTechnicalDto,
} from "@/services/cmc/dto"
import { MemoryCache } from "@/services/cmc/cache"
import { createMockCmcProvider } from "@/services/cmc/mockProvider"
import type { CmcProvider } from "@/services/cmc/provider"
import { createRealCmcProvider } from "@/services/cmc/realProvider"
import { createCategoriesService, type CategoriesService } from "@/services/cmc/CategoriesService"
import { createNarrativesService, type NarrativesService } from "@/services/cmc/NarrativesService"
import { createNewsService, type NewsService } from "@/services/cmc/NewsService"
import { createQuotesService, type QuotesService } from "@/services/cmc/QuotesService"
import { recordCmcCapabilityStatus, type CmcCapability } from "@/services/cmc/runtime"
import { createSentimentService, type SentimentService } from "@/services/cmc/SentimentService"
import { createTechnicalsService, type TechnicalsService } from "@/services/cmc/TechnicalsService"
import { marketSnapshotsRepository } from "@/services/marketMemory/MarketSnapshotsRepository"
import type { MarketSnapshot } from "@/services/marketMemory/types"

export type CmcServices = {
  quotes: QuotesService
  technicals: TechnicalsService
  sentiment: SentimentService
  news: NewsService
  narratives: NarrativesService
  categories: CategoriesService
}

type CapabilityPayloadMap = {
  quotes: CmcQuoteDto[]
  technicals: CmcTechnicalDto[]
  sentiment: CmcMarketPulseDto
  news: CmcNewsItemDto[]
  narratives: CmcNarrativeDto[]
  categories: CmcCategoryDto[]
}

const lastKnownGood: Partial<CapabilityPayloadMap> = {}
const THEME_PATTERNS = [
  /\bai\b/i,
  /infrastructure/i,
  /\brwa\b/i,
  /real world/i,
  /depin/i,
  /layer\s?2/i,
  /\bdefi\b/i,
  /gaming/i,
  /meme/i,
  /\bnft\b/i,
  /oracle/i,
  /storage/i,
  /compute/i,
  /privacy/i,
  /payments?/i,
  /interoperab/i,
  /exchange/i,
  /stablecoin/i,
]

function isPlaceholder(label: string, prefix: string) {
  return new RegExp(`^${prefix}\\s+\\d+$`, "i").test(label.trim())
}

function looksLikeMeaningfulTheme(label: string) {
  return THEME_PATTERNS.some((pattern) => pattern.test(label))
}

function hasHealthyQuotes(data: CmcQuoteDto[]) {
  return data.length > 0 && data.every((item) => item.price_usd > 0 && item.volume_24h_usd > 0 && item.market_cap_usd > 0)
}

function hasHealthyTechnicals(data: CmcTechnicalDto[]) {
  return data.length > 0 && data.every((item) => item.momentum > 0.05 && item.volatility > 0.05)
}

function hasHealthyCategories(data: CmcCategoryDto[]) {
  return (
    data.length >= 3 &&
    data.every(
      (item) =>
        item.name.trim().length > 0 &&
        !isPlaceholder(item.name, "Category") &&
        looksLikeMeaningfulTheme(item.name) &&
        item.strength > 15 &&
        item.rotation_score > 10
    )
  )
}

function hasHealthyNarratives(data: CmcNarrativeDto[]) {
  return (
    data.length >= 3 &&
    data.every(
      (item) =>
        item.name.trim().length > 0 &&
        !isPlaceholder(item.name, "Trend") &&
        looksLikeMeaningfulTheme(item.name) &&
        item.strength > 15 &&
        item.velocity > 10 &&
        item.growth > 10
    )
  )
}

function hasHealthyNews(data: CmcNewsItemDto[]) {
  return (
    data.length >= 2 &&
    data.every(
      (item) =>
        item.title.trim().length > 12 &&
        !isPlaceholder(item.title, "CMC News") &&
        item.source.trim().length > 0
    )
  )
}

function hasHealthyMarketPulse(data: CmcMarketPulseDto) {
  return (
    data.dominance.btc_dominance > 10 &&
    data.dominance.btc_dominance < 90 &&
    data.sentiment.fear_greed > 0 &&
    data.sentiment.fear_greed <= 100 &&
    data.totals.market_cap_usd > 1e11 &&
    data.totals.volume_24h_usd > 1e9 &&
    data.news_momentum > 0.05
  )
}

function isHealthyPayload<T extends CmcCapability>(capability: T, data: CapabilityPayloadMap[T]) {
  switch (capability) {
    case "quotes":
      return hasHealthyQuotes(data as CapabilityPayloadMap["quotes"])
    case "technicals":
      return hasHealthyTechnicals(data as CapabilityPayloadMap["technicals"])
    case "categories":
      return hasHealthyCategories(data as CapabilityPayloadMap["categories"])
    case "narratives":
      return hasHealthyNarratives(data as CapabilityPayloadMap["narratives"])
    case "news":
      return hasHealthyNews(data as CapabilityPayloadMap["news"])
    case "sentiment":
      return hasHealthyMarketPulse(data as CapabilityPayloadMap["sentiment"])
  }
}

function rememberLastKnownGood<T extends CmcCapability>(capability: T, data: CapabilityPayloadMap[T]) {
  lastKnownGood[capability] = data
}

function readLastKnownGood<T extends CmcCapability>(capability: T) {
  return lastKnownGood[capability] as CapabilityPayloadMap[T] | undefined
}

async function getLatestSuccessfulSnapshot() {
  const snapshots = await marketSnapshotsRepository.list()
  return (
    snapshots
      .filter((item) => item.sourceMode === "live")
      .sort((a, b) => (b.lastSyncAt ?? b.date).localeCompare(a.lastSyncAt ?? a.date))[0] ?? null
  )
}

function snapshotToQuotes(snapshot: MarketSnapshot | null, symbols: string[]) {
  if (!snapshot?.quotes?.length) return null
  const data = snapshot.quotes
    .filter((item) => symbols.includes(item.symbol))
    .map((item) => ({
      symbol: item.symbol,
      price_usd: item.priceUsd,
      volume_24h_usd: item.volume24hUsd,
      market_cap_usd: item.marketCapUsd,
    }))
  return data.length > 0 ? data : null
}

function snapshotToTechnicals(snapshot: MarketSnapshot | null, symbols: string[]) {
  if (!snapshot?.technicals?.length) return null
  const data = snapshot.technicals
    .filter((item) => symbols.includes(item.symbol))
    .map((item) => ({
      symbol: item.symbol,
      trend: item.trend as "bullish" | "neutral" | "bearish",
      momentum: item.momentum,
      volatility: item.volatility,
    }))
  return data.length > 0 ? data : null
}

function snapshotToCategories(snapshot: MarketSnapshot | null) {
  return snapshot?.categories?.map((item) => ({
    name: item.name,
    strength: item.strength,
    rotation_score: item.rotationScore,
  })) ?? null
}

function snapshotToNarratives(snapshot: MarketSnapshot | null) {
  return snapshot?.narratives?.map((item) => ({
    name: item.name,
    strength: item.strength,
    velocity: item.velocity,
    growth: item.growth,
    rotation_score: Math.round((item.velocity + item.growth) / 2),
  })) ?? null
}

function snapshotToNews(snapshot: MarketSnapshot | null) {
  return snapshot?.news?.map((item) => ({
    id: item.id,
    title: item.title,
    source: item.source,
    published_at: item.publishedAt,
    sentiment_score: item.sentimentScore,
    summary: item.summary,
  })) ?? null
}

function snapshotToMarketPulse(snapshot: MarketSnapshot | null) {
  if (!snapshot) return null
  return {
    dominance: { btc_dominance: snapshot.marketPulse.btcDominance },
    sentiment: {
      fear_greed: snapshot.marketPulse.fearGreed,
      sentiment_score: snapshot.marketPulse.sentimentScore,
    },
    totals: {
      market_cap_usd: snapshot.marketPulse.marketCapUsd,
      volume_24h_usd: snapshot.marketPulse.volume24hUsd,
    },
    news_momentum: snapshot.marketPulse.newsMomentum,
  }
}

function createResilientProvider(): CmcProvider {
  const mock = createMockCmcProvider()
  const real = createRealCmcProvider()
  const status = getCmcInfraStatus()

  if (!status.edgeProxyReady) {
    ;(["quotes", "technicals", "news", "sentiment", "categories", "narratives"] as CmcCapability[]).forEach(
      (capability) => {
        recordCmcCapabilityStatus(capability, {
          source: "fallback",
          endpoint: "supabase-edge-proxy",
          lastSync: null,
          message: "Supabase Edge Proxy is unavailable. AlphaOS is using fallback intelligence until live connectivity is restored.",
          retryCount: 0,
        })
      }
    )
    return mock
  }

  async function runWithFallback<T extends CmcCapability>(
    capability: T,
    endpoint: string,
    live: () => Promise<CapabilityPayloadMap[T]>,
    fallback: () => Promise<CapabilityPayloadMap[T]>,
    snapshotFallback: (snapshot: MarketSnapshot | null) => CapabilityPayloadMap[T] | null
  ) {
    try {
      const data = await live()
      if (!isHealthyPayload(capability, data)) {
        throw new Error("Live data quality below AlphaOS demo threshold.")
      }
      rememberLastKnownGood(capability, data)
      recordCmcCapabilityStatus(capability, {
        source: "live",
        endpoint,
        lastSync: new Date().toISOString(),
        message: "Live CoinMarketCap data fetched successfully.",
        retryCount: 0,
      })
      return data
    } catch (cause) {
      const snapshot = await getLatestSuccessfulSnapshot()
      const snapshotData = snapshotFallback(snapshot)
      if (snapshotData && isHealthyPayload(capability, snapshotData)) {
        rememberLastKnownGood(capability, snapshotData)
        recordCmcCapabilityStatus(capability, {
          source: "fallback",
          endpoint,
          lastSync: snapshot?.lastSyncAt ?? snapshot?.date ?? null,
          message: "Using the most recent successful CoinMarketCap snapshot to protect demo credibility.",
          retryCount: 1,
        })
        return snapshotData
      }

      const cached = readLastKnownGood(capability)
      if (cached && isHealthyPayload(capability, cached)) {
        recordCmcCapabilityStatus(capability, {
          source: "cache",
          endpoint,
          lastSync: new Date().toISOString(),
          message: "Using the most recent successful in-memory intelligence payload.",
          retryCount: 1,
        })
        return cached
      }

      const data = await fallback()
      const previous = getCmcInfraStatus().edgeProxyReady ? 1 : 0
      recordCmcCapabilityStatus(capability, {
        source: "fallback",
        endpoint,
        lastSync: null,
        message:
          cause instanceof Error
            ? cause.message
            : "CoinMarketCap live fetch failed. AlphaOS fell back to demo data.",
        retryCount: previous,
      })
      return data
    }
  }

  return {
    async getMarketPulse() {
      return runWithFallback(
        "sentiment",
        "marketPulse",
        () => real.getMarketPulse(),
        () => mock.getMarketPulse(),
        (snapshot) => snapshotToMarketPulse(snapshot)
      )
    },
    async getNarratives() {
      return runWithFallback(
        "narratives",
        "narratives",
        () => real.getNarratives(),
        () => mock.getNarratives(),
        (snapshot) => snapshotToNarratives(snapshot)
      )
    },
    async getNews() {
      return runWithFallback(
        "news",
        "news",
        () => real.getNews(),
        () => mock.getNews(),
        (snapshot) => snapshotToNews(snapshot)
      )
    },
    async getCategories() {
      return runWithFallback(
        "categories",
        "categories",
        () => real.getCategories(),
        () => mock.getCategories(),
        (snapshot) => snapshotToCategories(snapshot)
      )
    },
    async getTechnicals(symbols) {
      return runWithFallback(
        "technicals",
        "technicals",
        () => real.getTechnicals(symbols),
        () => mock.getTechnicals(symbols),
        (snapshot) => snapshotToTechnicals(snapshot, symbols)
      )
    },
    async getQuotes(symbols) {
      return runWithFallback(
        "quotes",
        "quotes",
        () => real.getQuotes(symbols),
        () => mock.getQuotes(symbols),
        (snapshot) => snapshotToQuotes(snapshot, symbols)
      )
    },
  }
}

export function createCmcServices(): CmcServices {
  const cache = new MemoryCache()
  const provider = createResilientProvider()

  return {
    quotes: createQuotesService({ provider, cache }),
    technicals: createTechnicalsService({ provider, cache }),
    sentiment: createSentimentService({ provider, cache }),
    news: createNewsService({ provider, cache }),
    narratives: createNarrativesService({ provider, cache }),
    categories: createCategoriesService({ provider, cache }),
  }
}

export const cmcServices = createCmcServices()
export { ingestCurrentCmcSnapshot } from "@/services/cmc/ingestion"
export type { CmcIngestionResult } from "@/services/cmc/ingestion"

