import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { getEnv } from "@/lib/env"

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client

  const url = getEnv("VITE_SUPABASE_URL")
  const anonKey = getEnv("VITE_SUPABASE_ANON_KEY")

  if (!url || !anonKey) return null

  client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return client
}

