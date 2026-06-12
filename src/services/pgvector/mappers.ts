import type { MarketDocumentRow, SemanticSearchResult } from "@/services/pgvector/types"

export function toMarketDocumentRow(input: {
  id: string
  documentType: MarketDocumentRow["document_type"]
  title: string
  content: string
  sourceRef?: string
  metadata?: Record<string, unknown>
}): MarketDocumentRow {
  return {
    id: input.id,
    document_type: input.documentType,
    title: input.title,
    content: input.content,
    source_ref: input.sourceRef ?? null,
    metadata: input.metadata ?? {},
  }
}

export function toSemanticSearchResult(row: {
  id: string
  document_type: SemanticSearchResult["documentType"]
  title: string
  content: string
  source_ref: string | null
  metadata: Record<string, unknown> | null
  similarity: number
}): SemanticSearchResult {
  return {
    id: row.id,
    documentType: row.document_type,
    title: row.title,
    content: row.content,
    sourceRef: row.source_ref,
    metadata: row.metadata ?? {},
    similarity: row.similarity,
  }
}

