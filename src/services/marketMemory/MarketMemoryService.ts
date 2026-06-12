import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import { mockSnapshots } from "@/services/marketMemory/mockData"
import { marketSnapshotsRepository } from "@/services/marketMemory/MarketSnapshotsRepository"
import { cosineSimilarity, mockEmbeddingVector } from "@/services/marketMemory/similarity"
import { snapshotToMarketDocument } from "@/services/marketMemory/snapshotToMarketDocument"
import type { MarketSnapshot, SimilarSnapshot, SnapshotComparison } from "@/services/marketMemory/types"
import { pgvectorRepository } from "@/services/pgvector"

export type MarketMemoryService = {
  listSnapshots(query?: { search?: string }): Promise<ApiResult<MarketSnapshot[]>>
  getSnapshot(id: string): Promise<ApiResult<MarketSnapshot>>
  findSimilarSnapshots(id: string): Promise<ApiResult<SimilarSnapshot[]>>
  compare(aId: string, bId: string): Promise<ApiResult<SnapshotComparison>>
}

export function createMarketMemoryService(): MarketMemoryService {
  async function listSnapshots(query?: { search?: string }) {
    const search = query?.search?.trim().toLowerCase()
    const source = await marketSnapshotsRepository.list()
    const dataset = source.length > 0 ? source : mockSnapshots
    const data = !search
      ? dataset
      : dataset.filter((s) => {
          const hay = `${s.date} ${s.title} ${s.summary}`.toLowerCase()
          return hay.includes(search)
        })
    return ok(data.slice().sort((a, b) => b.date.localeCompare(a.date)))
  }

  async function getSnapshot(id: string) {
    const snap = await marketSnapshotsRepository.getById(id)
    if (!snap) return err("Snapshot não encontrado", "MM_NOT_FOUND")
    await pgvectorRepository.upsertMarketDocument(snapshotToMarketDocument(snap))
    return ok(snap)
  }

  async function findSimilarSnapshots(id: string) {
    const snapshots = await marketSnapshotsRepository.list()
    const dataset = snapshots.length > 0 ? snapshots : mockSnapshots
    const base = dataset.find((s) => s.id === id)
    if (!base) return err("Snapshot não encontrado", "MM_NOT_FOUND")

    const baseEmbeddingRes = await pgvectorRepository.getEmbeddingForDocument(base.id)
    if (baseEmbeddingRes.ok && baseEmbeddingRes.data?.source === "live") {
      const vectorRes = await pgvectorRepository.semanticSearch({
        query: `similar snapshots for ${base.title}`,
        queryEmbedding: baseEmbeddingRes.data.embedding,
        matchThreshold: 0.2,
        matchCount: 6,
        filterDocumentType: "snapshot",
      })

      if (vectorRes.ok && vectorRes.data.length > 0) {
        const ranked: SimilarSnapshot[] = vectorRes.data
          .filter((item) => item.id !== base.id)
          .map((item) => {
            const snap = dataset.find((s) => s.id === item.id)
            if (!snap) return null
            const sim = item.similarity
            const reasoning =
              sim > 0.85
                ? "Vector match indicates a highly similar regime signature across narratives and sentiment."
                : sim > 0.75
                  ? "Vector match shows a related setup with differences in momentum/liquidity."
                  : "Vector match is weaker but still within the similarity threshold."
            return { snapshot: snap, similarity: sim, reasoning, method: "vector" as const }
          })
          .filter((item) => Boolean(item))
          .slice(0, 5) as SimilarSnapshot[]

        if (ranked.length > 0) return ok(ranked)
      }
    }

    const baseEmb = mockEmbeddingVector(base.id)

    const ranked: SimilarSnapshot[] = dataset
      .filter((s) => s.id !== base.id)
      .map((s) => {
        const sim = cosineSimilarity(baseEmb, mockEmbeddingVector(s.id))
        const reasoning =
          sim > 0.85
            ? "Alta coincidência de regime e dispersão."
            : sim > 0.75
              ? "Padrões similares com diferenças em risco/volatilidade."
              : "Similaridade parcial em narrativas, mas condições divergentes."
        return { snapshot: s, similarity: sim, reasoning, method: "heuristic" as const }
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)

    return ok(ranked)
  }

  async function compare(aId: string, bId: string) {
    const snapshots = await marketSnapshotsRepository.list()
    const dataset = snapshots.length > 0 ? snapshots : mockSnapshots
    const a = dataset.find((s) => s.id === aId)
    const b = dataset.find((s) => s.id === bId)
    if (!a || !b) return err("Snapshot não encontrado", "MM_NOT_FOUND")

    const delta = {
      btcDominance: b.marketPulse.btcDominance - a.marketPulse.btcDominance,
      fearGreed: b.marketPulse.fearGreed - a.marketPulse.fearGreed,
      marketCapUsd: b.marketPulse.marketCapUsd - a.marketPulse.marketCapUsd,
      volume24hUsd: b.marketPulse.volume24hUsd - a.marketPulse.volume24hUsd,
      sentimentScore: b.marketPulse.sentimentScore - a.marketPulse.sentimentScore,
      newsMomentum: b.marketPulse.newsMomentum - a.marketPulse.newsMomentum,
    }

    return ok({ a, b, delta })
  }

  return { listSnapshots, getSnapshot, findSimilarSnapshots, compare }
}

export const marketMemoryService = createMarketMemoryService()

