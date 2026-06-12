export type HealthState = "connected" | "warning" | "error"

export type IntegrationHealth = {
  key:
    | "supabase"
    | "openai"
    | "coinmarketcap"
    | "edgeFunctions"
    | "pgvector"
    | "embeddings"
    | "rag"
    | "marketIngestion"
  label: string
  state: HealthState
  reason: string
  requiredFix: string
  lastChecked: string
  lastSync: string | null
  details?: string[]
}

export type SystemHealthSummary = {
  connected: number
  warning: number
  error: number
  lastSync: string | null
  lastChecked: string | null
  totalMarketSnapshots: number
  totalDocuments: number
  totalEmbeddings: number
  totalHypotheses: number
  totalStrategies: number
  totalReports: number
  dataSource: "supabase" | "local-cache" | "unavailable"
}

export type SystemHealthReport = {
  summary: SystemHealthSummary
  integrations: IntegrationHealth[]
}

