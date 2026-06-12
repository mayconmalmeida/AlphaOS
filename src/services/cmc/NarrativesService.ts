import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import type { MemoryCache } from "@/services/cmc/cache"
import { mapNarrative } from "@/services/cmc/mappers"
import type { CmcProvider } from "@/services/cmc/provider"
import type { NarrativeMetric, NarrativeRadarPoint } from "@/services/cmc/types"

export type NarrativesService = {
  getNarratives(): Promise<ApiResult<NarrativeMetric[]>>
  getNarrativeRadar(): Promise<ApiResult<NarrativeRadarPoint[]>>
}

export function createNarrativesService(deps: {
  provider: CmcProvider
  cache: MemoryCache
}): NarrativesService {
  const ttlMs = 30_000

  async function getNarrativesInternal(): Promise<ApiResult<NarrativeMetric[]>> {
    try {
      const key = "cmc:narratives"
      const cached = deps.cache.get<NarrativeMetric[]>(key)
      if (cached) return ok(cached)

      const dtos = await deps.provider.getNarratives()
      const mapped = dtos.map(mapNarrative)
      deps.cache.set(key, mapped, ttlMs)
      return ok(mapped)
    } catch (e) {
      return err(
        e instanceof Error ? e.message : "Falha ao carregar narrativas",
        "CMC_NARRATIVES"
      )
    }
  }

  return {
    getNarratives: getNarrativesInternal,
    async getNarrativeRadar() {
      const res = await getNarrativesInternal()
      if (!res.ok) return res
      return ok(
        res.data
          .slice()
          .sort((a, b) => b.strength - a.strength)
          .slice(0, 8)
          .map((n) => ({ name: n.name, strength: n.strength }))
      )
    },
  }
}

