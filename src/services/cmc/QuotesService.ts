import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import type { MemoryCache } from "@/services/cmc/cache"
import type { CmcProvider } from "@/services/cmc/provider"
import { mapQuote } from "@/services/cmc/mappers"
import type { Quote } from "@/services/cmc/types"

export type QuotesService = {
  getQuotes(symbols: string[]): Promise<ApiResult<Quote[]>>
}

export function createQuotesService(deps: {
  provider: CmcProvider
  cache: MemoryCache
}): QuotesService {
  const ttlMs = 30_000

  return {
    async getQuotes(symbols) {
      try {
        const key = `cmc:quotes:${symbols
          .map((s) => s.toUpperCase())
          .sort()
          .join(",")}`
        const cached = deps.cache.get<Quote[]>(key)
        if (cached) return ok(cached)

        const dtos = await deps.provider.getQuotes(symbols)
        const mapped = dtos.map(mapQuote)
        deps.cache.set(key, mapped, ttlMs)
        return ok(mapped)
      } catch (e) {
        return err(
          e instanceof Error ? e.message : "Falha ao carregar quotes",
          "CMC_QUOTES"
        )
      }
    },
  }
}

