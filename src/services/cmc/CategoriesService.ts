import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import type { MemoryCache } from "@/services/cmc/cache"
import { mapCategory } from "@/services/cmc/mappers"
import type { CmcProvider } from "@/services/cmc/provider"
import type { CategoryMetric } from "@/services/cmc/types"

export type CategoriesService = {
  getCategories(): Promise<ApiResult<CategoryMetric[]>>
}

export function createCategoriesService(deps: {
  provider: CmcProvider
  cache: MemoryCache
}): CategoriesService {
  const ttlMs = 60_000

  return {
    async getCategories() {
      try {
        const key = "cmc:categories"
        const cached = deps.cache.get<CategoryMetric[]>(key)
        if (cached) return ok(cached)

        const dtos = await deps.provider.getCategories()
        const mapped = dtos.map(mapCategory)
        deps.cache.set(key, mapped, ttlMs)
        return ok(mapped)
      } catch (e) {
        return err(
          e instanceof Error ? e.message : "Failed to load categories",
          "CMC_CATEGORIES"
        )
      }
    },
  }
}

