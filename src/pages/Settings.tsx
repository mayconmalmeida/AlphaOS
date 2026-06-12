import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SystemHealthDashboard } from "@/components/system/SystemHealthDashboard"
import { useCmcIntegration } from "@/hooks/useCmcIntegration"
import { useDemoMode } from "@/hooks/useDemoMode"
import { useAiTask } from "@/hooks/useAiTask"
import { useEmbeddingPipeline } from "@/hooks/useEmbeddingPipeline"
import { useI18n } from "@/i18n/I18nProvider"
import { useSemanticSearch } from "@/hooks/useSemanticSearch"
import { useTheme } from "@/hooks/useTheme"

const heartbeatSchema = {
  type: "object",
  properties: {
    status: { type: "string" },
    message: { type: "string" },
    timestamp: { type: "string" },
  },
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const demoMode = useDemoMode()
  const cmcIntegration = useCmcIntegration()
  const embeddingPipeline = useEmbeddingPipeline()
  const semanticSearch = useSemanticSearch()
  const { data, loading, error, run, retry, status } = useAiTask<{
    status: string
    message: string
    timestamp: string
  }>()

  async function runAiCheck() {
    await run({
      taskType: "health_check",
      input: "Return a simple infrastructure heartbeat payload.",
      schema: heartbeatSchema,
      mockFallback: true,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Settings
        </div>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Preferências
        </h2>
      </div>

      <SystemHealthDashboard />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle>Tema</CardTitle>
            <CardDescription>Dark premium por padrão.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Atual</Badge>
              <Badge variant="outline">{theme}</Badge>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              Alternar tema
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle>Demo Mode</CardTitle>
            <CardDescription>Modo de demonstração persistente para apresentação e submission.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              Demo mode deixa o produto previsível para hackathon, mantendo amostras, fallback mock e disclaimer institucional.
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border bg-background/35 p-4">
              <div>
                <div className="text-sm font-medium">Estado atual</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {demoMode.enabled ? "Dados previsíveis para demo" : "Modo live-ready com fallback"}
                </div>
              </div>
              <Button variant="outline" onClick={demoMode.toggle}>
                {demoMode.enabled ? "Desativar demo" : "Ativar demo"}
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={embeddingPipeline.seed}
              disabled={embeddingPipeline.processing}
            >
              {embeddingPipeline.processing ? "Preparando..." : "Seed Sample Data"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>CoinMarketCap Real Data</CardTitle>
          <CardDescription>
            Proxy seguro via Supabase Edge Function, cache na camada de serviços e fallback explícito.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={cmcIntegration.status.supabaseUrlConfigured ? "default" : "secondary"}
            >
              SUPABASE_URL {cmcIntegration.status.supabaseUrlConfigured ? "ok" : "missing"}
            </Badge>
            <Badge
              variant={cmcIntegration.status.supabaseAnonKeyConfigured ? "default" : "secondary"}
            >
              ANON_KEY {cmcIntegration.status.supabaseAnonKeyConfigured ? "ok" : "missing"}
            </Badge>
            <Badge
              variant={cmcIntegration.status.edgeProxyReady ? "default" : "outline"}
            >
              CMC Proxy {cmcIntegration.status.edgeProxyReady ? "ready" : "fallback only"}
            </Badge>
            <Badge variant="outline">Mode {cmcIntegration.status.mode}</Badge>
            <Badge variant="outline">
              Sentiment {cmcIntegration.runtimeStatus.sentiment.source}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={cmcIntegration.runIngestion}
              disabled={cmcIntegration.loading || embeddingPipeline.processing}
            >
              {cmcIntegration.loading ? "Ingerindo..." : "Ingest CMC Snapshot"}
            </Button>
            <Button
              variant="outline"
              onClick={embeddingPipeline.refresh}
              disabled={embeddingPipeline.loading || embeddingPipeline.processing}
            >
              Refresh Pipeline
            </Button>
          </div>

          {cmcIntegration.error ? (
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              {cmcIntegration.error.message}
            </div>
          ) : null}

          {cmcIntegration.lastIngestion ? (
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Last Ingestion</div>
              <div className="mt-2 text-sm font-medium">
                {cmcIntegration.lastIngestion.snapshotTitle}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {cmcIntegration.lastIngestion.documentsQueued} documentos enfileirados via{" "}
                {cmcIntegration.lastIngestion.mode}.
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              Enfileire um snapshot CMC para alimentar{" "}
              <code>market document -&gt; embedding -&gt; RAG-ready memory</code>.
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.values(cmcIntegration.runtimeStatus).map((item) => (
              <div key={item.capability} className="rounded-xl border bg-background/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{item.capability}</div>
                  <Badge variant={item.source === "live" ? "default" : item.source === "idle" ? "outline" : "secondary"}>
                    {item.source}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Last sync: {item.lastSync ?? "N/A"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{item.message}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>AI Infrastructure</CardTitle>
          <CardDescription>
            Health check genérico para a infraestrutura reutilizável da Parte 11.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={status.supabaseUrlConfigured ? "default" : "secondary"}>
              SUPABASE_URL {status.supabaseUrlConfigured ? "ok" : "missing"}
            </Badge>
            <Badge variant={status.supabaseAnonKeyConfigured ? "default" : "secondary"}>
              ANON_KEY {status.supabaseAnonKeyConfigured ? "ok" : "missing"}
            </Badge>
            <Badge variant={status.edgeFunctionReady ? "default" : "outline"}>
              Edge Function {status.edgeFunctionReady ? "ready" : "mock fallback"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={runAiCheck} disabled={loading}>
              {loading ? "Executando..." : "Run AI Health Check"}
            </Button>
            <Button variant="outline" onClick={retry} disabled={loading || !error}>
              Retry
            </Button>
          </div>

          {error ? (
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              {error.message}
            </div>
          ) : null}

          {data ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-xs text-muted-foreground">Provider</div>
                <div className="mt-1 text-sm">
                  {data.provider} · {data.model} · {data.source}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">Content</div>
                <div className="mt-1 text-sm text-foreground/90">{data.content}</div>
              </div>

              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-xs text-muted-foreground">Structured Output</div>
                <pre className="mt-2 overflow-auto text-xs text-foreground/90">
                  {JSON.stringify(data.structuredData, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              Execute o health check para validar loading, erro, retry e JSON estruturado.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>{t("embeddings.dashboard", "Embedding Health Dashboard")}</CardTitle>
          <CardDescription>
            Validate dimensions, queue health, vector quality, and retrieval readiness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Pending {embeddingPipeline.stats.pending}</Badge>
            <Badge variant="outline">Processing {embeddingPipeline.stats.processing}</Badge>
            <Badge variant="default">Completed {embeddingPipeline.stats.completed}</Badge>
            <Badge variant="secondary">Failed {embeddingPipeline.stats.failed}</Badge>
            <Badge variant="secondary">
              Stored Records {embeddingPipeline.stats.totalRecords}
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">{t("embeddings.vectorQuality", "Vector quality")}</div>
              <div className="mt-2 text-sm font-medium">{embeddingPipeline.stats.vectorQuality}</div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">{t("embeddings.lastGenerated", "Last generated")}</div>
              <div className="mt-2 text-sm font-medium">
                {embeddingPipeline.stats.lastGenerated ?? "N/A"}
              </div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">{t("embeddings.dimensions", "Dimensions")}</div>
              <div className="mt-2 text-sm font-medium">1536 target</div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Dimension mismatches</div>
              <div className="mt-2 text-sm font-medium">
                {embeddingPipeline.stats.dimensionMismatches}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={embeddingPipeline.seed} disabled={embeddingPipeline.processing}>
              Seed Documents
            </Button>
            <Button
              variant="outline"
              onClick={embeddingPipeline.processNext}
              disabled={embeddingPipeline.processing}
            >
              Process Next
            </Button>
            <Button
              variant="outline"
              onClick={embeddingPipeline.refresh}
              disabled={embeddingPipeline.loading || embeddingPipeline.processing}
            >
              Refresh
            </Button>
          </div>

          {embeddingPipeline.error ? (
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              {embeddingPipeline.error.message}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Queue</div>
              <div className="mt-3 space-y-3">
                {embeddingPipeline.jobs.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Nenhum documento enfileirado ainda.
                  </div>
                ) : (
                  embeddingPipeline.jobs.slice(0, 6).map((job) => (
                    <div key={job.id} className="rounded-lg border bg-card/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {job.document.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {job.document.type}
                          </div>
                        </div>
                        <Badge
                          variant={
                            job.status === "completed"
                              ? "default"
                              : job.status === "failed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      {job.status === "failed" ? (
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="text-xs text-muted-foreground">
                            {job.lastError ?? "Falha de processamento"}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => embeddingPipeline.retryJob(job.id)}
                            disabled={embeddingPipeline.processing}
                          >
                            Retry
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Stored Metadata</div>
              <div className="mt-3 space-y-3">
                {embeddingPipeline.records.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Nenhum embedding persistido ainda.
                  </div>
                ) : (
                  embeddingPipeline.records.slice(0, 6).map((record) => (
                    <div key={record.id} className="rounded-lg border bg-card/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">{record.documentId}</div>
                        <Badge variant="secondary">{record.provider}</Badge>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {record.model} · {record.dimensions} dims · retries {record.retryCount}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>Semantic Retrieval</CardTitle>
          <CardDescription>
            Busca vetorial preparada para `pgvector` via RPC `match_market_documents`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <input
              value={semanticSearch.query}
              onChange={(e) => semanticSearch.setQuery(e.target.value)}
              placeholder="Pesquisar contexto de mercado..."
              className="h-9 rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <select
              value={semanticSearch.filterDocumentType}
              onChange={(e) =>
                semanticSearch.setFilterDocumentType(
                  e.target.value as
                    | "all"
                    | "snapshot"
                    | "news"
                    | "narrative"
                    | "technical"
                    | "sentiment"
                    | "category"
                    | "research"
                )
              }
              className="h-9 rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Todos os tipos</option>
              <option value="snapshot">Snapshot</option>
              <option value="news">News</option>
              <option value="narrative">Narrative</option>
              <option value="technical">Technical</option>
              <option value="sentiment">Sentiment</option>
              <option value="category">Category</option>
              <option value="research">Research</option>
            </select>
            <Button onClick={semanticSearch.run} disabled={semanticSearch.loading}>
              {semanticSearch.loading ? "Buscando..." : "Search"}
            </Button>
          </div>

          {semanticSearch.error ? (
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              {semanticSearch.error.message}
            </div>
          ) : null}

          <div className="space-y-3">
            {semanticSearch.results.length === 0 ? (
              <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                Execute uma busca para visualizar resultados semânticos.
              </div>
            ) : (
              semanticSearch.results.map((result) => (
                <div key={result.id} className="rounded-xl border bg-background/35 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{result.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {result.documentType} · similarity {Math.round(result.similarity * 100)}%
                      </div>
                    </div>
                    <Badge variant="outline">{result.documentType}</Badge>
                  </div>
                  <div className="mt-3 text-sm text-foreground/90">{result.content}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

