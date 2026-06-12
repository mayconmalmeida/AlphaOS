export type MarketDocumentType =
  | "snapshot"
  | "news"
  | "narrative"
  | "technical"
  | "sentiment"
  | "category"
  | "research"

export type MarketDocumentRow = {
  id: string
  document_type: MarketDocumentType
  title: string
  content: string
  source_ref: string | null
  metadata: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export type MarketEmbeddingRow = {
  id: string
  document_id: string
  embedding: number[] | null
  model: string
  provider: string
  dimensions: number
  created_at?: string
  updated_at?: string
}

export type SemanticSearchResult = {
  id: string
  documentType: MarketDocumentType
  title: string
  content: string
  sourceRef: string | null
  metadata: Record<string, unknown>
  similarity: number
}

