import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import type { MemoryCache } from "@/services/cmc/cache"
import { mapMarketPulse } from "@/services/cmc/mappers"
import type { CmcProvider } from "@/services/cmc/provider"
import type { MarketPulse } from "@/services/cmc/types"

export type SentimentService = {
  getMarketPulse(): Promise<ApiResult<MarketPulse>>
}

export function createSentimentService(deps: {
  provider: CmcProvider
  cache: MemoryCache
}): SentimentService {
  const ttlMs = 20_000

  return {
    async getMarketPulse() {
      try {
        const key = "cmc:market_pulse"
        const cached = deps.cache.get<MarketPulse>(key)
        if (cached) return ok(cached)

        const dto = await deps.provider.getMarketPulse()
        const mapped = mapMarketPulse(dto)
        deps.cache.set(key, mapped, ttlMs)
        return ok(mapped)
      } catch (e) {
        return err(
          e instanceof Error ? e.message : "Falha ao carregar market pulse",
          "CMC_MARKET_PULSE"
        )
      }
    },
  }
}

