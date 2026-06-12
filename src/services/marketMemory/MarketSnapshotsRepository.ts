import { getSupabaseClient } from "@/lib/supabase"
import { mockSnapshots } from "@/services/marketMemory/mockData"
import { snapshotToMarketDocument } from "@/services/marketMemory/snapshotToMarketDocument"
import type { MarketSnapshot } from "@/services/marketMemory/types"
import { pgvectorRepository } from "@/services/pgvector"

const TABLE = "market_snapshots"

function hasHealthySnapshot(snapshot: MarketSnapshot) {
  return (
    snapshot.marketPulse.marketCapUsd > 1e11 &&
    snapshot.marketPulse.volume24hUsd > 1e9 &&
    snapshot.marketPulse.fearGreed > 0 &&
    snapshot.narratives.length > 0 &&
    (snapshot.categories?.length ?? 0) > 0 &&
    (snapshot.technicals?.length ?? 0) > 0
  )
}

function sanitizeSnapshot(snapshot: MarketSnapshot) {
  const donor =
    mockSnapshots.find((item) => item.id !== snapshot.id && hasHealthySnapshot(item)) ?? mockSnapshots[0]

  if (!donor) return snapshot

  return {
    ...snapshot,
    marketPulse: {
      btcDominance:
        snapshot.marketPulse.btcDominance > 0 ? snapshot.marketPulse.btcDominance : donor.marketPulse.btcDominance,
      fearGreed: snapshot.marketPulse.fearGreed > 0 ? snapshot.marketPulse.fearGreed : donor.marketPulse.fearGreed,
      marketCapUsd:
        snapshot.marketPulse.marketCapUsd > 1e11 ? snapshot.marketPulse.marketCapUsd : donor.marketPulse.marketCapUsd,
      volume24hUsd:
        snapshot.marketPulse.volume24hUsd > 1e9 ? snapshot.marketPulse.volume24hUsd : donor.marketPulse.volume24hUsd,
      sentimentScore:
        snapshot.marketPulse.sentimentScore > 0 ? snapshot.marketPulse.sentimentScore : donor.marketPulse.sentimentScore,
      newsMomentum:
        snapshot.marketPulse.newsMomentum > 0 ? snapshot.marketPulse.newsMomentum : donor.marketPulse.newsMomentum,
    },
    narratives: snapshot.narratives.length > 0 ? snapshot.narratives : donor.narratives,
    categories: snapshot.categories?.length ? snapshot.categories : donor.categories,
    technicals:
      snapshot.technicals?.filter((item) => item.momentum > 0.05 && item.volatility > 0.05).length
        ? snapshot.technicals
        : donor.technicals,
    quotes: snapshot.quotes?.filter((item) => item.priceUsd > 0 && item.marketCapUsd > 0).length
      ? snapshot.quotes
      : donor.quotes,
    news: snapshot.news?.filter((item) => item.title.trim().length > 0).length ? snapshot.news : donor.news,
  }
}

export const marketSnapshotsRepository = {
  async list() {
    const client = getSupabaseClient()
    if (!client) return mockSnapshots

    const { data, error } = await client
      .from(TABLE)
      .select("payload")
      .order("snapshot_date", { ascending: false })

    if (error || !data?.length) return mockSnapshots
    return data
      .map((row) => row.payload as MarketSnapshot | null)
      .filter((row): row is MarketSnapshot => Boolean(row))
      .map(sanitizeSnapshot)
  },
  async getById(id: string) {
    const client = getSupabaseClient()
    if (!client) return mockSnapshots.find((item) => item.id === id) ?? null

    const { data, error } = await client
      .from(TABLE)
      .select("payload")
      .eq("id", id)
      .maybeSingle()

    if (error || !data) return mockSnapshots.find((item) => item.id === id) ?? null
    const snapshot = (data.payload as MarketSnapshot | null) ?? null
    return snapshot ? sanitizeSnapshot(snapshot) : null
  },
  async upsert(snapshot: MarketSnapshot, marketDocumentId?: string | null) {
    const client = getSupabaseClient()
    if (!client) return false

    await pgvectorRepository.upsertMarketDocument(snapshotToMarketDocument(snapshot))

    const { error } = await client.from(TABLE).upsert(
      {
        id: snapshot.id,
        snapshot_date: snapshot.date,
        title: snapshot.title,
        summary: snapshot.summary,
        market_document_id: marketDocumentId ?? null,
        source_mode: snapshot.sourceMode ?? "fallback",
        source_capabilities: snapshot.sourceCapabilities ?? [],
        last_sync_at: snapshot.lastSyncAt ?? null,
        payload: snapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )

    return !error
  },
}

