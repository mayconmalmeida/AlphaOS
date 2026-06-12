import { getSupabaseClient } from "@/lib/supabase"
import { aiService } from "@/services/ai"
import { embeddingService } from "@/services/embeddings"
import { hypothesesRepository } from "@/services/hypotheses/HypothesesRepository"
import { marketSnapshotsRepository } from "@/services/marketMemory/MarketSnapshotsRepository"
import { researchRepository } from "@/services/research/ResearchRepository"
import { retrieveEvidence } from "@/services/rag"
import { strategiesRepository } from "@/services/strategies/StrategiesRepository"
import type {
  HealthState,
  IntegrationHealth,
  SystemHealthReport,
  SystemHealthSummary,
} from "@/services/systemHealth/types"

type CountProbe = {
  totalMarketSnapshots: number
  totalDocuments: number
  totalEmbeddings: number
  totalHypotheses: number
  totalStrategies: number
  totalReports: number
  lastSync: string | null
  dataSource: "supabase" | "local-cache" | "unavailable"
}

type EdgeProbeResult = {
  ok: boolean
  reason: string
  source?: string
  provider?: string
  warning?: string
  dimensions?: number
}

function nowIso() {
  return new Date().toISOString()
}

function deriveStateFromProbe(probe: EdgeProbeResult): HealthState {
  if (probe.ok) return "connected"
  if (
    probe.source === "mock" ||
    probe.reason.toLowerCase().includes("mock") ||
    probe.reason.toLowerCase().includes("fallback") ||
    probe.reason.toLowerCase().includes("zero evidence") ||
    probe.reason.toLowerCase().includes("no ingested")
  ) {
    return "warning"
  }
  return "error"
}

function missingSecretReason(secretName: string, serviceLabel: string) {
  return `Secret required: ${secretName}. ${serviceLabel} cannot run live until this secret is configured in Supabase.`
}

function buildItem(
  key: IntegrationHealth["key"],
  label: string,
  state: HealthState,
  reason: string,
  requiredFix: string,
  lastChecked: string,
  lastSync: string | null,
  details?: string[]
): IntegrationHealth {
  return { key, label, state, reason, requiredFix, lastChecked, lastSync, details }
}

function buildUnavailable(reason: string, fix: string, counts: CountProbe): SystemHealthReport {
  const lastChecked = nowIso()
  const integrations: IntegrationHealth[] = [
    buildItem("supabase", "Supabase", "warning", reason, fix, lastChecked, counts.lastSync),
    buildItem("openai", "OpenAI", "warning", "Supabase Edge Functions are not reachable from this workspace.", fix, lastChecked, counts.lastSync),
    buildItem("coinmarketcap", "CoinMarketCap API", "warning", "CoinMarketCap proxy cannot run without a configured Supabase client.", fix, lastChecked, counts.lastSync),
    buildItem("edgeFunctions", "Edge Functions", "warning", "No Supabase client is configured, so Edge Functions cannot be invoked.", fix, lastChecked, counts.lastSync),
    buildItem("pgvector", "pgvector", "warning", "Database RPC and vector tables are unreachable because Supabase is not configured.", fix, lastChecked, counts.lastSync),
    buildItem("embeddings", "Embeddings", "warning", "Real embedding generation requires Supabase and deployed Edge Functions.", fix, lastChecked, counts.lastSync),
    buildItem("rag", "RAG", "warning", "RAG cannot validate real retrieval without Supabase documents and vector search.", fix, lastChecked, counts.lastSync),
    buildItem("marketIngestion", "Market Ingestion", "warning", "Market ingestion requires the live CoinMarketCap proxy and embedding pipeline.", fix, lastChecked, counts.lastSync),
  ]

  return {
    summary: {
      connected: 0,
      warning: integrations.length,
      error: 0,
      lastSync: counts.lastSync,
      lastChecked,
      totalMarketSnapshots: counts.totalMarketSnapshots,
      totalDocuments: counts.totalDocuments,
      totalEmbeddings: counts.totalEmbeddings,
      totalHypotheses: counts.totalHypotheses,
      totalStrategies: counts.totalStrategies,
      totalReports: counts.totalReports,
      dataSource: counts.dataSource,
    },
    integrations,
  }
}

async function getLocalCounts(): Promise<CountProbe> {
  const [recordsRes, hypotheses, strategies, reports, snapshots] = await Promise.all([
    embeddingService.listRecords(),
    hypothesesRepository.listGenerated(),
    strategiesRepository.listGenerated(),
    researchRepository.listGenerated(),
    marketSnapshotsRepository.list(),
  ])

  return {
    totalMarketSnapshots: snapshots.length,
    totalDocuments: 0,
    totalEmbeddings: recordsRes.ok ? recordsRes.data.length : 0,
    totalHypotheses: hypotheses.length,
    totalStrategies: strategies.length,
    totalReports: reports.length,
    lastSync: recordsRes.ok && recordsRes.data.length > 0 ? recordsRes.data[0].updatedAt : null,
    dataSource:
      recordsRes.ok ||
      hypotheses.length > 0 ||
      strategies.length > 0 ||
      reports.length > 0 ||
      snapshots.length > 0
        ? "local-cache"
        : "unavailable",
  }
}

async function getRemoteCounts(): Promise<CountProbe> {
  const supabase = getSupabaseClient()
  if (!supabase) return getLocalCounts()

  const [snapshotsRes, documentsRes, embeddingsRes, hypothesesRes, strategiesRes, reportsRes] = await Promise.all([
    supabase.from("market_snapshots").select("updated_at", { count: "exact" }).order("updated_at", { ascending: false }).limit(1),
    supabase.from("market_documents").select("updated_at", { count: "exact" }).order("updated_at", { ascending: false }).limit(1),
    supabase.from("market_embeddings").select("updated_at", { count: "exact" }).order("updated_at", { ascending: false }).limit(1),
    supabase.from("generated_hypotheses").select("updated_at", { count: "exact" }).order("updated_at", { ascending: false }).limit(1),
    supabase.from("strategy_candidates").select("updated_at", { count: "exact" }).order("updated_at", { ascending: false }).limit(1),
    supabase.from("research_reports").select("updated_at", { count: "exact" }).order("updated_at", { ascending: false }).limit(1),
  ])

  const snapshotUpdated = snapshotsRes.data?.[0]?.updated_at ?? null
  const docUpdated = documentsRes.data?.[0]?.updated_at ?? null
  const embUpdated = embeddingsRes.data?.[0]?.updated_at ?? null
  const hypUpdated = hypothesesRes.data?.[0]?.updated_at ?? null
  const strategyUpdated = strategiesRes.data?.[0]?.updated_at ?? null
  const reportUpdated = reportsRes.data?.[0]?.updated_at ?? null
  const lastSync = [snapshotUpdated, docUpdated, embUpdated, hypUpdated, strategyUpdated, reportUpdated]
    .filter(Boolean)
    .sort()
    .at(-1) ?? null

  if (
    snapshotsRes.error ||
    documentsRes.error ||
    embeddingsRes.error ||
    hypothesesRes.error ||
    strategiesRes.error ||
    reportsRes.error
  ) {
    return getLocalCounts()
  }

  return {
    totalMarketSnapshots: snapshotsRes.count ?? 0,
    totalDocuments: documentsRes.count ?? 0,
    totalEmbeddings: embeddingsRes.count ?? 0,
    totalHypotheses: hypothesesRes.count ?? 0,
    totalStrategies: strategiesRes.count ?? 0,
    totalReports: reportsRes.count ?? 0,
    lastSync,
    dataSource: "supabase",
  }
}

async function probeAiEdge(): Promise<EdgeProbeResult> {
  const res = await aiService.generate<{ status: string }>({
    taskType: "health_check",
    input: "Return a heartbeat payload.",
    schema: {
      type: "object",
      properties: {
        status: { type: "string" },
      },
      required: ["status"],
    },
    mockFallback: false,
  })

  if (res.ok === false) {
    return { ok: false, reason: res.error.message }
  }

  return {
    ok: res.data.source === "edge" && res.data.provider === "openai",
    reason:
      res.data.source === "mock"
        ? missingSecretReason("OPENAI_API_KEY", "OpenAI generation")
        : "OpenAI edge response succeeded.",
    source: res.data.source,
    provider: res.data.provider,
  }
}

async function probeEmbeddingEdge(): Promise<EdgeProbeResult> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: false, reason: "Supabase client unavailable." }
  }

  const { data, error } = await supabase.functions.invoke<{
    embedding?: number[]
    dimensions?: number
    provider?: string
    source?: string
  }>("generate-embedding", {
    body: { input: "AlphaOS embedding health check" },
  })

  if (error) {
    return { ok: false, reason: error.message }
  }

  const dimensions = data?.dimensions ?? data?.embedding?.length ?? 0
  const source = data?.source ?? "unknown"
  const provider = data?.provider ?? "unknown"

  if (source === "mock") {
    return {
      ok: false,
      reason: missingSecretReason("OPENAI_API_KEY", "OpenAI embeddings"),
      source,
      provider,
      dimensions,
    }
  }

  if (dimensions !== 1536) {
    return {
      ok: false,
      reason: `Embedding dimension mismatch. Expected 1536, received ${dimensions}.`,
      source,
      provider,
      dimensions,
    }
  }

  return {
    ok: true,
    reason: "Embedding Edge Function returned live 1536-dimensional vectors.",
    source,
    provider,
    dimensions,
  }
}

async function probeCmcEdge(): Promise<EdgeProbeResult> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: false, reason: "Supabase client unavailable." }
  }

  const { data, error } = await supabase.functions.invoke<{
    data?: unknown
    source?: "live" | "mock"
    warning?: string
  }>("coinmarketcap-proxy", {
    body: { resource: "marketPulse" },
  })

  if (error) {
    return { ok: false, reason: error.message }
  }

  if (data?.source === "mock") {
    return {
      ok: false,
      reason: data.warning?.toLowerCase().includes("cmc_api_key")
        ? missingSecretReason("CMC_API_KEY", "CoinMarketCap intelligence")
        : (data.warning ?? "CoinMarketCap proxy returned connectivity-limited data instead of live market data."),
      source: data.source,
      warning: data.warning,
    }
  }

  return {
    ok: true,
    reason: "CoinMarketCap proxy returned live market data.",
    source: data?.source,
  }
}

async function probePgvector(): Promise<{ ok: boolean; reason: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: false, reason: "Supabase client unavailable." }
  }

  const zeroVector = Array.from({ length: 1536 }, () => 0)
  const { error } = await supabase.rpc("match_market_documents", {
    query_embedding: zeroVector,
    match_threshold: 0,
    match_count: 1,
    filter_document_type: null,
  })

  if (error) {
    return { ok: false, reason: error.message }
  }

  return { ok: true, reason: "pgvector RPC match_market_documents is reachable." }
}

async function probeMarketIngestion(counts: CountProbe): Promise<{ ok: boolean; reason: string; lastSync: string | null }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { ok: false, reason: "Supabase client unavailable.", lastSync: counts.lastSync }
  }

  const { data, error } = await supabase
    .from("market_snapshots")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)

  if (error) {
    return { ok: false, reason: error.message, lastSync: counts.lastSync }
  }

  if (!data?.length) {
    return {
      ok: false,
      reason: "No ingested market snapshots were found in market_snapshots.",
      lastSync: counts.lastSync,
    }
  }

  return {
    ok: true,
    reason: "At least one market snapshot has been ingested and persisted.",
    lastSync: data[0].updated_at ?? counts.lastSync,
  }
}

function summarize(integrations: IntegrationHealth[], counts: CountProbe): SystemHealthSummary {
  return {
    connected: integrations.filter((item) => item.state === "connected").length,
    warning: integrations.filter((item) => item.state === "warning").length,
    error: integrations.filter((item) => item.state === "error").length,
    lastSync: integrations.map((item) => item.lastSync).filter(Boolean).sort().at(-1) ?? counts.lastSync,
    lastChecked: integrations.map((item) => item.lastChecked).sort().at(-1) ?? nowIso(),
    totalMarketSnapshots: counts.totalMarketSnapshots,
    totalDocuments: counts.totalDocuments,
    totalEmbeddings: counts.totalEmbeddings,
    totalHypotheses: counts.totalHypotheses,
    totalStrategies: counts.totalStrategies,
    totalReports: counts.totalReports,
    dataSource: counts.dataSource,
  }
}

export async function auditSystemHealth(): Promise<SystemHealthReport> {
  const status = aiService.getStatus()
  const counts = await getRemoteCounts()
  const lastChecked = nowIso()

  if (!status.supabaseUrlConfigured || !status.supabaseAnonKeyConfigured) {
    const missing = [
      !status.supabaseUrlConfigured ? "VITE_SUPABASE_URL" : null,
      !status.supabaseAnonKeyConfigured ? "VITE_SUPABASE_ANON_KEY" : null,
    ]
      .filter(Boolean)
      .join(", ")

    return buildUnavailable(
      `Missing required public environment variables: ${missing}.`,
      "Create a local .env/.env.local file with valid Supabase project values, restart the app, and redeploy if needed.",
      counts
    )
  }

  const [aiProbe, embeddingProbe, cmcProbe, pgvectorProbe, ingestionProbe, ragProbe] =
    await Promise.all([
      probeAiEdge(),
      probeEmbeddingEdge(),
      probeCmcEdge(),
      probePgvector(),
      probeMarketIngestion(counts),
      retrieveEvidence("What is the current market narrative regime for BTC and AI infrastructure?"),
    ])

  const integrations: IntegrationHealth[] = []

  integrations.push(
    buildItem(
      "supabase",
      "Supabase",
      "connected",
      "Supabase public configuration is present and the client can execute probes.",
      "No action required.",
      lastChecked,
      counts.lastSync
    )
  )

  const edgeDetails = [
    `AI: ${aiProbe.ok ? "connected" : "failed"}`,
    `Embeddings: ${embeddingProbe.ok ? "connected" : "failed"}`,
    `CMC Proxy: ${cmcProbe.ok ? "connected" : "failed"}`,
  ]
  const edgeState: HealthState =
    aiProbe.ok && embeddingProbe.ok && cmcProbe.ok
      ? "connected"
      : aiProbe.ok || embeddingProbe.ok || cmcProbe.ok
        ? "warning"
        : "error"
  integrations.push(
    buildItem(
      "edgeFunctions",
      "Edge Functions",
      edgeState,
      edgeState === "connected"
        ? "All audited Edge Functions responded successfully."
        : "One or more Edge Functions are deployed but are still missing a required secret or returning connectivity-limited responses.",
      edgeState === "connected"
        ? "No action required."
        : "Deploy all Supabase functions and configure any required secrets in the Supabase project.",
      lastChecked,
      counts.lastSync,
      edgeDetails
    )
  )

  integrations.push(
    buildItem(
      "openai",
      "OpenAI",
      deriveStateFromProbe(aiProbe),
      aiProbe.reason,
      aiProbe.ok
        ? "No action required."
        : "Add OPENAI_API_KEY to Supabase secrets and refresh the health audit.",
      lastChecked,
      counts.lastSync,
      [`Provider: ${aiProbe.provider ?? "unknown"}`, `Source: ${aiProbe.source ?? "unknown"}`]
    )
  )

  integrations.push(
    buildItem(
      "coinmarketcap",
      "CoinMarketCap API",
      deriveStateFromProbe(cmcProbe),
      cmcProbe.reason,
      cmcProbe.ok
        ? "No action required."
        : "Add CMC_API_KEY to Supabase secrets, confirm proxy deployment, and refresh the health audit.",
      lastChecked,
      counts.lastSync,
      [
        `Source: ${cmcProbe.source ?? "unknown"}`,
        cmcProbe.warning ? `Warning: ${cmcProbe.warning}` : "Warning: none",
      ]
    )
  )

  integrations.push(
    buildItem(
      "pgvector",
      "pgvector",
      pgvectorProbe.ok ? "connected" : "error",
      pgvectorProbe.reason,
      pgvectorProbe.ok
        ? "No action required."
        : "Apply pgvector migration, enable the extension, create the RPC, and grant browser access as needed.",
      lastChecked,
      counts.lastSync
    )
  )

  const embeddingRecordsRes = await embeddingService.listRecords()
  const embeddingJobsRes = await embeddingService.listJobs()
  const embeddingJobCounts =
    embeddingJobsRes.ok
      ? {
          pending: embeddingJobsRes.data.filter((j) => j.status === "pending").length,
          processing: embeddingJobsRes.data.filter((j) => j.status === "processing").length,
          completed: embeddingJobsRes.data.filter((j) => j.status === "completed").length,
          failed: embeddingJobsRes.data.filter((j) => j.status === "failed").length,
          lastCompleted:
            embeddingJobsRes.data.find((j) => j.status === "completed")?.completedAt ??
            embeddingJobsRes.data.find((j) => j.status === "completed")?.updatedAt ??
            null,
          lastFailed: embeddingJobsRes.data.find((j) => j.status === "failed")?.updatedAt ?? null,
          model: embeddingJobsRes.data.find((j) => j.status === "completed")?.embeddingModel ?? null,
          dimensions: embeddingJobsRes.data.find((j) => j.status === "completed")?.vectorDimension ?? null,
        }
      : null
  integrations.push(
    buildItem(
      "embeddings",
      "Embeddings",
      deriveStateFromProbe(embeddingProbe),
      embeddingProbe.reason,
      embeddingProbe.ok
        ? "No action required."
        : "Add OPENAI_API_KEY to Supabase secrets and verify the embedding function returns live 1536-dimensional vectors.",
      lastChecked,
      counts.lastSync,
      [
        `Provider: ${embeddingProbe.provider ?? "unknown"}`,
        `Source: ${embeddingProbe.source ?? "unknown"}`,
        `Dimensions: ${embeddingProbe.dimensions ?? 0}`,
        `Stored vectors: ${embeddingRecordsRes.ok ? embeddingRecordsRes.data.length : 0}`,
        embeddingJobCounts
          ? `Jobs — pending ${embeddingJobCounts.pending}, processing ${embeddingJobCounts.processing}, completed ${embeddingJobCounts.completed}, failed ${embeddingJobCounts.failed}`
          : "Jobs — unavailable",
        embeddingJobCounts?.lastCompleted ? `Last completed job: ${embeddingJobCounts.lastCompleted}` : "Last completed job: N/A",
        embeddingJobCounts?.lastFailed ? `Last failed job: ${embeddingJobCounts.lastFailed}` : "Last failed job: N/A",
        embeddingJobCounts?.model ? `Embedding model: ${embeddingJobCounts.model}` : "Embedding model: N/A",
        typeof embeddingJobCounts?.dimensions === "number"
          ? `Vector dimension: ${embeddingJobCounts.dimensions}`
          : "Vector dimension: N/A",
      ]
    )
  )

  const ragReady =
    ragProbe.ok &&
    ragProbe.data.length > 0 &&
    pgvectorProbe.ok &&
    embeddingProbe.ok &&
    aiProbe.ok

  integrations.push(
    buildItem(
      "rag",
      "RAG",
      ragReady ? "connected" : ragProbe.ok ? "warning" : "error",
      ragProbe.ok
        ? ragProbe.data.length > 0
          ? "RAG retrieval returned evidence and prerequisites are available."
          : "RAG retrieval returned zero evidence. AlphaOS should show Insufficient evidence until indexed documents exist."
        : ragProbe.ok === false
          ? ragProbe.error.message
          : "RAG health probe failed.",
      ragReady
        ? "No action required."
        : "Ingest live market data, process embeddings, and ensure pgvector plus OpenAI are live before relying on RAG.",
      lastChecked,
      counts.lastSync,
      ragProbe.ok ? [`Retrieved evidence: ${ragProbe.data.length}`] : undefined
    )
  )

  integrations.push(
    buildItem(
      "marketIngestion",
      "Market Ingestion",
      ingestionProbe.ok && cmcProbe.ok && embeddingProbe.ok
        ? "connected"
        : ingestionProbe.ok
          ? "warning"
          : "error",
      ingestionProbe.ok
        ? "Market ingestion has persisted at least one live-ready snapshot."
        : ingestionProbe.reason,
      ingestionProbe.ok
        ? "No action required."
        : "Run the CMC ingestion flow after Supabase, CoinMarketCap, and embeddings are fully connected.",
      lastChecked,
      ingestionProbe.lastSync
    )
  )

  return {
    summary: summarize(integrations, counts),
    integrations,
  }
}

