import type { EmbeddingDocument, EmbeddingResponse } from "@/services/embeddings/types"

function hashString(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

export function buildMockEmbedding(document: EmbeddingDocument): EmbeddingResponse {
  const seed = hashString(`${document.type}:${document.title}:${document.content}`)
  const dimensions = 1536
  const embedding = Array.from({ length: dimensions }).map((_, index) => {
    const value = ((seed + index * 97) % 1000) / 1000
    return Number((value * 2 - 1).toFixed(6))
  })

  return {
    embedding,
    dimensions,
    provider: "mock",
    model: "mock-embedding-v1",
  }
}

