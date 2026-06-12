import { getSupabaseClient } from "@/lib/supabase"

export async function listJsonPayloads<T>(table: string): Promise<T[] | null> {
  const client = getSupabaseClient()
  if (!client) return null

  const { data, error } = await client
    .from(table)
    .select("payload")
    .order("updated_at", { ascending: false })

  if (error) return null
  return (data ?? [])
    .map((row) => row.payload as T | null)
    .filter((row): row is T => Boolean(row))
}

export async function getJsonPayloadById<T>(
  table: string,
  idColumn: string,
  id: string
): Promise<T | null> {
  const client = getSupabaseClient()
  if (!client) return null

  const { data, error } = await client
    .from(table)
    .select("payload")
    .eq(idColumn, id)
    .maybeSingle()

  if (error || !data) return null
  return (data.payload as T | null) ?? null
}

export async function upsertJsonPayload<T extends { id?: string }>(
  table: string,
  payload: T,
  extras?: Record<string, unknown>
) {
  const client = getSupabaseClient()
  if (!client) return false

  const { error } = await client.from(table).upsert(
    {
      id: payload.id,
      payload,
      updated_at: new Date().toISOString(),
      ...extras,
    },
    { onConflict: "id" }
  )

  return !error
}

export async function replaceJsonPayloadsForKey<T extends { id?: string }>(
  table: string,
  keyColumn: string,
  keyValue: string,
  items: T[],
  mapExtras?: (item: T) => Record<string, unknown>
) {
  const client = getSupabaseClient()
  if (!client) return false

  const { error: deleteError } = await client.from(table).delete().eq(keyColumn, keyValue)
  if (deleteError) return false

  if (items.length === 0) return true

  const rows = items.map((item) => ({
    id: item.id,
    payload: item,
    updated_at: new Date().toISOString(),
    ...(mapExtras ? mapExtras(item) : {}),
  }))

  const { error } = await client.from(table).insert(rows)
  return !error
}

