import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import type { MemoryCache } from "@/services/cmc/cache"
import { mapNewsItem } from "@/services/cmc/mappers"
import type { CmcProvider } from "@/services/cmc/provider"
import type { NewsItem } from "@/services/cmc/types"

export type NewsService = {
  getLatestNews(): Promise<ApiResult<NewsItem[]>>
}

export function createNewsService(deps: {
  provider: CmcProvider
  cache: MemoryCache
}): NewsService {
  const ttlMs = 45_000

  return {
    async getLatestNews() {
      try {
        const key = "cmc:news"
        const cached = deps.cache.get<NewsItem[]>(key)
        if (cached) return ok(cached)

        const dtos = await deps.provider.getNews()
        const mapped = dtos.map(mapNewsItem)
        deps.cache.set(key, mapped, ttlMs)
        return ok(mapped)
      } catch (e) {
        return err(
          e instanceof Error ? e.message : "Falha ao carregar news",
          "CMC_NEWS"
        )
      }
    },
  }
}

