import { useCallback, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { pgvectorRepository } from "@/services/pgvector"
import type { MarketDocumentType, SemanticSearchResult } from "@/services/pgvector"

export function useSemanticSearch() {
  const [query, setQuery] = useState("AI infrastructure rotation")
  const [filterDocumentType, setFilterDocumentType] = useState<MarketDocumentType | "all">("all")
  const [results, setResults] = useState<SemanticSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [embeddingSource, setEmbeddingSource] = useState<"live" | "fallback" | null>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)

    const embeddingRes = await pgvectorRepository.generateQueryEmbedding(query)
    if (isErr(embeddingRes)) {
      setError(embeddingRes.error)
      setLoading(false)
      return
    }

    setEmbeddingSource(embeddingRes.data.source)

    const res = await pgvectorRepository.semanticSearch({
      query,
      queryEmbedding: embeddingRes.data.embedding,
      filterDocumentType: filterDocumentType === "all" ? undefined : filterDocumentType,
      matchThreshold: 0.2,
      matchCount: 5,
    })

    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return
    }

    setResults(res.data)
    setLoading(false)
  }, [filterDocumentType, query])

  return {
    query,
    setQuery,
    filterDocumentType,
    setFilterDocumentType,
    results,
    loading,
    error,
    embeddingSource,
    run,
  }
}

