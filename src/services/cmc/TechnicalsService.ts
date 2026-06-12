import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import type { MemoryCache } from "@/services/cmc/cache"
import { mapTechnical } from "@/services/cmc/mappers"
import type { CmcProvider } from "@/services/cmc/provider"
import type { TechnicalSummary } from "@/services/cmc/types"

export type TechnicalsService = {
  getTechnicals(symbols: string[]): Promise<ApiResult<TechnicalSummary[]>>
}

export function createTechnicalsService(deps: {
  provider: CmcProvider
  cache: MemoryCache
}): TechnicalsService {
  const ttlMs = 45_000

  return {
    async getTechnicals(symbols) {
      try {
        const key = `cmc:technicals:${symbols
          .map((s) => s.toUpperCase())
          .sort()
          .join(",")}`
        const cached = deps.cache.get<TechnicalSummary[]>(key)
        if (cached) return ok(cached)

        const dtos = await deps.provider.getTechnicals(symbols)
        const mapped = dtos.map(mapTechnical)
        deps.cache.set(key, mapped, ttlMs)
        return ok(mapped)
      } catch (e) {
        return err(
          e instanceof Error ? e.message : "Falha ao carregar technicals",
          "CMC_TECHNICALS"
        )
      }
    },
  }
}

