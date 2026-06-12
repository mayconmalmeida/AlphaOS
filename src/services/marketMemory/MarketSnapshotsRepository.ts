import { getSupabaseClient } from "@/lib/supabase"
import { mockSnapshots } from "@/services/marketMemory/mockData"
import { snapshotToMarketDocument } from "@/services/marketMemory/snapshotToMarketDocument"
import type { MarketSnapshot } from "@/services/marketMemory/types"
import { pgvectorRepository } from "@/services/pgvector"

const TABLE = "market_snapshots"

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
    return (data.payload as MarketSnapshot | null) ?? null
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

