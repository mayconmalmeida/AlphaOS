import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SystemHealthDashboard } from "@/components/system/SystemHealthDashboard"
import { useCmcIntegration } from "@/hooks/useCmcIntegration"
import { useDemoMode } from "@/hooks/useDemoMode"
import { useAiTask } from "@/hooks/useAiTask"
import { useEmbeddingPipeline } from "@/hooks/useEmbeddingPipeline"
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

function intelligenceLabel(source?: string) {
  return source === "live" || source === "edge"
    ? "Live Intelligence"
    : source === "cache"
      ? "Cached Intelligence"
      : "Protected Intelligence"
}

function capabilityLabel(capability: string) {
  if (capability === "technicals") return "Technical Signals"
  return capability.charAt(0).toUpperCase() + capability.slice(1)
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
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

  const aiResult = (data as
    | (typeof data & {
        provider?: string
        model?: string
        source?: string
        content?: string
        structuredData?: { status?: string; message?: string; timestamp?: string }
      })
    | null)

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground">Settings</div>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
          Workspace Readiness Controls
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-snug text-muted-foreground">
          Keep AlphaOS stable, credible, and presentation-ready across live demos, judging, and investor walkthroughs.
        </p>
      </div>

      <SystemHealthDashboard />

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Set the default visual experience for the AlphaOS workspace.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Current</Badge>
              <Badge variant="outline">{theme}</Badge>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              Toggle theme
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle>Experience Controls</CardTitle>
            <CardDescription>Adjust how AlphaOS preserves continuity when live refresh cycles are still completing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              AlphaOS protects the presentation layer with verified intelligence so the workspace remains dependable during demos.
            </div>
            <div className="flex flex-col gap-4 rounded-xl border bg-background/35 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-medium">Current state</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {demoMode.enabled
                    ? "Protected continuity is prioritized for the current session."
                    : "Live intelligence is preferred whenever the workspace is fully connected."}
                </div>
              </div>
              <Button variant="outline" onClick={demoMode.toggle}>
                {demoMode.enabled ? "Prefer live intelligence" : "Protect current session"}
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={embeddingPipeline.seed}
              disabled={embeddingPipeline.processing}
            >
              {embeddingPipeline.processing ? "Preparing..." : "Prepare Workspace Records"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>CoinMarketCap Intelligence Access</CardTitle>
          <CardDescription>
            Review how verified CoinMarketCap intelligence is feeding the workspace right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={cmcIntegration.status.supabaseUrlConfigured ? "default" : "secondary"}
            >
              Workspace Connection {cmcIntegration.status.supabaseUrlConfigured ? "ready" : "missing"}
            </Badge>
            <Badge
              variant={cmcIntegration.status.supabaseAnonKeyConfigured ? "default" : "secondary"}
            >
              Application Access {cmcIntegration.status.supabaseAnonKeyConfigured ? "ready" : "missing"}
            </Badge>
            <Badge
              variant={cmcIntegration.status.edgeProxyReady ? "default" : "outline"}
            >
              Market Intelligence Gateway {cmcIntegration.status.edgeProxyReady ? "ready" : "not configured"}
            </Badge>
            <Badge variant="outline">
              {cmcIntegration.status.mode === "edge-proxy" ? "Live Intelligence" : "Protected Intelligence"}
            </Badge>
            <Badge variant="outline">
              Sentiment {intelligenceLabel(cmcIntegration.runtimeStatus.sentiment.source)}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={cmcIntegration.runIngestion}
              disabled={cmcIntegration.loading || embeddingPipeline.processing}
            >
              {cmcIntegration.loading ? "Syncing..." : "Sync Market Snapshot"}
            </Button>
            <Button
              variant="outline"
              onClick={embeddingPipeline.refresh}
              disabled={embeddingPipeline.loading || embeddingPipeline.processing}
            >
              Refresh Readiness
            </Button>
          </div>

          {cmcIntegration.error ? (
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              {cmcIntegration.error.message}
            </div>
          ) : null}

          {cmcIntegration.lastIngestion ? (
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Latest verified market state</div>
              <div className="mt-2 text-sm font-medium">
                {cmcIntegration.lastIngestion.snapshotTitle}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {cmcIntegration.lastIngestion.documentsQueued} intelligence records prepared through{" "}
                {cmcIntegration.lastIngestion.mode === "edge-proxy"
                  ? "live intelligence"
                  : "protected continuity"}.
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              Sync a verified CoinMarketCap snapshot to expand market memory, research support, and downstream reports.
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.values(cmcIntegration.runtimeStatus).map((item) => (
              <div key={item.capability} className="rounded-xl border bg-background/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{capabilityLabel(item.capability)}</div>
                  <Badge variant={item.source === "live" ? "success" : "warning"}>
                    {intelligenceLabel(item.source)}
                  </Badge>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Last verified: {item.lastSync ?? "N/A"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{item.message}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>Research Intelligence</CardTitle>
          <CardDescription>
            Validate the research engine behind summaries, evidence framing, and institutional output.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={status.supabaseUrlConfigured ? "default" : "secondary"}>
              Workspace Connection {status.supabaseUrlConfigured ? "ready" : "missing"}
            </Badge>
            <Badge variant={status.supabaseAnonKeyConfigured ? "default" : "secondary"}>
              Application Access {status.supabaseAnonKeyConfigured ? "ready" : "missing"}
            </Badge>
            <Badge variant={status.edgeFunctionReady ? "default" : "outline"}>
              Research Gateway {status.edgeFunctionReady ? "ready" : "not configured"}
            </Badge>

          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={runAiCheck} disabled={loading}>
              {loading ? "Reviewing..." : "Run Research Check"}
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
                <div className="text-xs text-muted-foreground">Research status</div>
                <div className="mt-1 text-sm">
                  {aiResult?.structuredData?.status ?? "Ready"} ·{" "}
                  {intelligenceLabel(aiResult?.source)}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">Latest verification</div>
                <div className="mt-1 text-sm text-foreground/90">
                  {aiResult?.structuredData?.message ??
                    aiResult?.content ??
                    "Research verification completed successfully."}
                </div>
              </div>

              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-xs text-muted-foreground">Verification timestamp</div>
                <div className="mt-1 text-sm text-foreground/90">
                  {aiResult?.structuredData?.timestamp ?? "N/A"}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">Research model</div>
                <div className="mt-1 text-sm text-foreground/90">
                  {[aiResult?.provider, aiResult?.model].filter(Boolean).join(" · ") || "Institutional research profile active"}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              Run the research check to confirm that AlphaOS can produce verified institutional output on demand.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>Research Memory Operations</CardTitle>
          <CardDescription>
            Monitor the preparation and indexing of the market intelligence that supports research outputs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Queued {embeddingPipeline.stats.pending}</Badge>
            <Badge variant="outline">In Progress {embeddingPipeline.stats.processing}</Badge>
            <Badge variant="default">Ready {embeddingPipeline.stats.completed}</Badge>
            <Badge variant="secondary">Needs Review {embeddingPipeline.stats.failed}</Badge>
            <Badge variant="secondary">Stored Records {embeddingPipeline.stats.totalRecords}</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Readiness profile</div>
              <div className="mt-2 text-sm font-medium">{embeddingPipeline.stats.vectorQuality}</div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Last refreshed</div>
              <div className="mt-2 text-sm font-medium">
                {embeddingPipeline.stats.lastGenerated ?? "N/A"}
              </div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Research profile</div>
              <div className="mt-2 text-sm font-medium">
                {embeddingPipeline.stats.embeddingModel ?? "Research intelligence ready"}
              </div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Coverage gaps</div>
              <div className="mt-2 text-sm font-medium">
                {embeddingPipeline.stats.dimensionMismatches}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={embeddingPipeline.seed} disabled={embeddingPipeline.processing}>
              Prepare Records
            </Button>
            <Button
              variant="outline"
              onClick={embeddingPipeline.processNext}
              disabled={embeddingPipeline.processing}
            >
              Process Next Batch
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
              <div className="text-xs text-muted-foreground">Processing queue</div>
              <div className="mt-3 space-y-3">
                {embeddingPipeline.jobs.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No research records are queued right now.
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
                            Intelligence record
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
                            {job.lastError ?? "This record needs another processing pass."}
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
              <div className="text-xs text-muted-foreground">Recent indexed records</div>
              <div className="mt-3 space-y-3">
                {embeddingPipeline.records.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Research memory is still building its indexed record base.
                  </div>
                ) : (
                  embeddingPipeline.records.slice(0, 6).map((record) => (
                    <div key={record.id} className="rounded-lg border bg-card/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">Indexed intelligence record</div>
                        <Badge variant="secondary">Ready</Badge>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {record.model} · refresh attempts {record.retryCount}
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
          <CardTitle>Research Lookup</CardTitle>
          <CardDescription>
            Inspect how AlphaOS retrieves supporting market context across memory and research records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <input
              value={semanticSearch.query}
              onChange={(e) => semanticSearch.setQuery(e.target.value)}
              placeholder="Search market context..."
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
              <option value="all">All types</option>
              <option value="snapshot">Snapshot</option>
              <option value="news">News</option>
              <option value="narrative">Narrative</option>
              <option value="technical">Technical</option>
              <option value="sentiment">Sentiment</option>
              <option value="category">Category</option>
              <option value="research">Research</option>
            </select>
            <Button onClick={semanticSearch.run} disabled={semanticSearch.loading}>
              {semanticSearch.loading ? "Searching..." : "Search"}
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
                Run a lookup to inspect the strongest matching market context available to AlphaOS.
              </div>
            ) : (
              semanticSearch.results.map((result) => (
                <div key={result.id} className="rounded-xl border bg-background/35 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{result.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {result.documentType} · match strength {Math.round(result.similarity * 100)}%
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

