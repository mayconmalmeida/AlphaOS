import { getCmcInfraStatus } from "@/lib/env"
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

export type CmcServices = {
  quotes: QuotesService
  technicals: TechnicalsService
  sentiment: SentimentService
  news: NewsService
  narratives: NarrativesService
  categories: CategoriesService
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
          message: "Supabase Edge Proxy is unavailable. AlphaOS is running in Demo Mode with fallback data.",
          retryCount: 0,
        })
      }
    )
    return mock
  }

  async function runWithFallback<T>(
    capability: CmcCapability,
    endpoint: string,
    live: () => Promise<T>,
    fallback: () => Promise<T>
  ) {
    try {
      const data = await live()
      recordCmcCapabilityStatus(capability, {
        source: "live",
        endpoint,
        lastSync: new Date().toISOString(),
        message: "Live CoinMarketCap data fetched successfully.",
        retryCount: 0,
      })
      return data
    } catch (cause) {
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
      return runWithFallback("sentiment", "marketPulse", () => real.getMarketPulse(), () => mock.getMarketPulse())
    },
    async getNarratives() {
      return runWithFallback("narratives", "narratives", () => real.getNarratives(), () => mock.getNarratives())
    },
    async getNews() {
      return runWithFallback("news", "news", () => real.getNews(), () => mock.getNews())
    },
    async getCategories() {
      return runWithFallback("categories", "categories", () => real.getCategories(), () => mock.getCategories())
    },
    async getTechnicals(symbols) {
      return runWithFallback("technicals", "technicals", () => real.getTechnicals(symbols), () => mock.getTechnicals(symbols))
    },
    async getQuotes(symbols) {
      return runWithFallback("quotes", "quotes", () => real.getQuotes(symbols), () => mock.getQuotes(symbols))
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

