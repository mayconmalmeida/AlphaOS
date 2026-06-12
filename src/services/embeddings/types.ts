export type EmbeddingDocumentType =
  | "market_snapshot"
  | "news_summary"
  | "narrative_report"
  | "category_summary"
  | "technical_summary"
  | "sentiment_summary"
  | "historical_context"

export type EmbeddingStatus = "pending" | "processing" | "completed" | "failed"

export type EmbeddingDocument = {
  id: string
  type: EmbeddingDocumentType
  title: string
  content: string
  sourceRef?: string
  metadata?: Record<string, unknown>
}

export type EmbeddingVectorRecord = {
  id: string
  documentId: string
  status: EmbeddingStatus
  embedding: number[] | null
  dimensions: number
  provider: "mock" | "openai"
  model: string
  retryCount: number
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export type EmbeddingJob = {
  id: string
  document: EmbeddingDocument
  status: EmbeddingStatus
  retryCount: number
  lastError?: string
  attempts?: number
  embeddingModel?: string
  vectorDimension?: number
  sourceMode?: "live" | "fallback"
  createdAt: string
  updatedAt: string
  completedAt?: string | null
  vectorRecordId?: string
}

export type EmbeddingResponse = {
  embedding: number[]
  dimensions: number
  provider: "mock" | "openai"
  model: string
}

