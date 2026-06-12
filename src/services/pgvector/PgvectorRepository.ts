import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import { getSupabaseClient } from "@/lib/supabase"
import { buildMockEmbedding } from "@/services/embeddings/mock"
import { embeddingStorage } from "@/services/embeddings/storage"
import { toMarketDocumentRow, toSemanticSearchResult } from "@/services/pgvector/mappers"
import type {
  MarketDocumentRow,
  MarketDocumentType,
  MarketEmbeddingRow,
  SemanticSearchResult,
} from "@/services/pgvector/types"

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

function inferDocumentType(rawType: string): MarketDocumentType {
  switch (rawType) {
    case "market_snapshot":
      return "snapshot"
    case "news_summary":
      return "news"
    case "narrative_report":
      return "narrative"
    case "technical_summary":
      return "technical"
    case "sentiment_summary":
      return "sentiment"
    case "historical_context":
      return "research"
    default:
      return "research"
  }
}

export type PgvectorRepository = {
  upsertMarketDocument(input: {
    id: string
    documentType: MarketDocumentType
    title: string
    content: string
    sourceRef?: string
    metadata?: Record<string, unknown>
  }): Promise<ApiResult<MarketDocumentRow>>
  upsertMarketEmbedding(input: MarketEmbeddingRow): Promise<ApiResult<MarketEmbeddingRow>>
  semanticSearch(params: {
    query: string
    queryEmbedding: number[]
    matchThreshold?: number
    matchCount?: number
    filterDocumentType?: MarketDocumentType
  }): Promise<ApiResult<SemanticSearchResult[]>>
  getEmbeddingForDocument(documentId: string): Promise<ApiResult<{
    embedding: number[]
    dimensions: number
    provider: string
    model: string
    source: "live" | "fallback"
  } | null>>
  generateQueryEmbedding(query: string): Promise<ApiResult<{
    embedding: number[]
    dimensions: number
    provider: string
    source: "live" | "fallback"
  }>>
}

export function createPgvectorRepository(): PgvectorRepository {
  return {
    async upsertMarketDocument(input) {
      const row = toMarketDocumentRow(input)
      const supabase = getSupabaseClient()
      if (!supabase) return ok(row)

      const { data, error } = await supabase
        .from("market_documents")
        .upsert(row)
        .select("*")
        .single()

      if (error) return err(error.message, "PGVECTOR_DOCUMENT_UPSERT_FAILED")
      return ok(data as MarketDocumentRow)
    },

    async upsertMarketEmbedding(input) {
      const supabase = getSupabaseClient()
      if (!supabase) return ok(input)

      const { data, error } = await supabase
        .from("market_embeddings")
        .upsert(input)
        .select("*")
        .single()

      if (error) return err(error.message, "PGVECTOR_EMBEDDING_UPSERT_FAILED")
      return ok(data as MarketEmbeddingRow)
    },

    async semanticSearch(params) {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data, error } = await supabase.rpc("match_market_documents", {
          query_embedding: params.queryEmbedding,
          match_threshold: params.matchThreshold ?? 0.3,
          match_count: params.matchCount ?? 5,
          filter_document_type: params.filterDocumentType ?? null,
        })

        if (!error && Array.isArray(data)) {
          return ok(
            data.map((row) =>
              toSemanticSearchResult(
                row as {
                  id: string
                  document_type: SemanticSearchResult["documentType"]
                  title: string
                  content: string
                  source_ref: string | null
                  metadata: Record<string, unknown> | null
                  similarity: number
                }
              )
            )
          )
        }
      }

      const records = embeddingStorage.getRecords()
      const jobs = embeddingStorage.getJobs()
      const fallbackResults = records
        .map((record) => {
          const job = jobs.find((item) => item.document.id === record.documentId)
          if (!job || !record.embedding) return null
          const similarity = cosineSimilarity(params.queryEmbedding, record.embedding)
          return {
            id: record.documentId,
            documentType: inferDocumentType(job.document.type),
            title: job.document.title,
            content: job.document.content,
            sourceRef: job.document.sourceRef ?? null,
            metadata: job.document.metadata ?? {},
            similarity,
          } satisfies SemanticSearchResult
        })
        .filter((item): item is SemanticSearchResult => Boolean(item))
        .filter((item) =>
          params.filterDocumentType ? item.documentType === params.filterDocumentType : true
        )
        .filter((item) => item.similarity >= (params.matchThreshold ?? 0.3))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, params.matchCount ?? 5)

      return ok(fallbackResults)
    },

    async getEmbeddingForDocument(documentId) {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("market_embeddings")
          .select("embedding, dimensions, provider, model")
          .eq("document_id", documentId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!error && data?.embedding && Array.isArray(data.embedding)) {
          const dimensions = data.dimensions ?? data.embedding.length
          const provider = data.provider ?? "unknown"
          const model = data.model ?? "unknown"
          const source = provider === "mock" ? "fallback" : "live"
          return ok({
            embedding: data.embedding as number[],
            dimensions,
            provider,
            model,
            source,
          })
        }
      }

      const records = embeddingStorage.getRecords()
      const record = records.find((item) => item.documentId === documentId && Array.isArray(item.embedding))
      if (!record?.embedding) return ok(null)

      return ok({
        embedding: record.embedding,
        dimensions: record.dimensions,
        provider: record.provider,
        model: record.model,
        source: record.provider === "mock" ? "fallback" : "live",
      })
    },

    async generateQueryEmbedding(query) {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data, error } = await supabase.functions.invoke<{
          embedding?: number[]
          dimensions?: number
          provider?: string
          source?: "edge" | "mock"
        }>("generate-embedding", {
          body: {
            input: query,
            metadata: {
              query,
              type: "semantic_query",
            },
          },
        })

        if (!error && Array.isArray(data?.embedding)) {
          const dimensions = data.dimensions ?? data.embedding.length
          if (dimensions === 1536 && data.source !== "mock") {
            return ok({
              embedding: data.embedding,
              dimensions,
              provider: data.provider ?? "openai",
              source: "live",
            })
          }
        }
      }

      const fallback = buildMockEmbedding({
        id: "query",
        type: "historical_context",
        title: "Semantic Query",
        content: query,
      }).embedding

      return ok({
        embedding: fallback,
        dimensions: fallback.length,
        provider: "mock",
        source: "fallback",
      })
    },
  }
}

export const pgvectorRepository = createPgvectorRepository()

export function buildQueryEmbedding(query: string) {
  return buildMockEmbedding({
    id: "query",
    type: "historical_context",
    title: "Semantic Query",
    content: query,
  }).embedding
}

