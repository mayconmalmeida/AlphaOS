export function getEnv(name: keyof ImportMetaEnv): string | undefined {
  const value = import.meta.env[name]
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function getAiInfraStatus() {
  const supabaseUrl = getEnv("VITE_SUPABASE_URL")
  const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY")

  return {
    supabaseUrlConfigured: Boolean(supabaseUrl),
    supabaseAnonKeyConfigured: Boolean(supabaseAnonKey),
    edgeFunctionReady: Boolean(supabaseUrl && supabaseAnonKey),
  }
}

export function getCmcInfraStatus() {
  const supabaseUrl = getEnv("VITE_SUPABASE_URL")
  const supabaseAnonKey = getEnv("VITE_SUPABASE_ANON_KEY")

  return {
    supabaseUrlConfigured: Boolean(supabaseUrl),
    supabaseAnonKeyConfigured: Boolean(supabaseAnonKey),
    edgeProxyReady: Boolean(supabaseUrl && supabaseAnonKey),
    mode: supabaseUrl && supabaseAnonKey ? ("edge-proxy" as const) : ("mock" as const),
  }
}

