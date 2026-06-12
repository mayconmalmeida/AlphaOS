import { Activity, Database, Search } from "lucide-react"

import { SystemHealthDashboard } from "@/components/system/SystemHealthDashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEmbeddingPipeline } from "@/hooks/useEmbeddingPipeline"
import { useSemanticSearch } from "@/hooks/useSemanticSearch"

export default function SystemHealth() {
  const embeddingPipeline = useEmbeddingPipeline()
  const semanticSearch = useSemanticSearch()

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground">System Health</div>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
          Infrastructure Readiness Center
        </h2>
        <p className="mt-2 max-w-3xl text-[13px] leading-snug text-muted-foreground">
          Review the readiness of market intelligence, research support, and reporting before a customer-facing presentation.
        </p>
      </div>

      <SystemHealthDashboard />

      <div className="grid gap-3 xl:grid-cols-12">
        <Card className="bg-card/40 xl:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Research Memory Readiness
            </CardTitle>
            <CardDescription>
              Tracks how quickly AlphaOS is preparing verified research context for downstream intelligence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Queued {embeddingPipeline.stats.pending}</Badge>
              <Badge variant="outline">In Progress {embeddingPipeline.stats.processing}</Badge>
              <Badge variant="success">Ready {embeddingPipeline.stats.completed}</Badge>
              <Badge variant="danger">Needs Review {embeddingPipeline.stats.failed}</Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border bg-background/30 p-3">
                <div className="text-[11px] text-muted-foreground">Last research refresh</div>
                <div className="mt-2 text-sm font-medium">
                  {embeddingPipeline.stats.lastGenerated ?? "N/A"}
                </div>
              </div>
              <div className="rounded-xl border bg-background/30 p-3">
                <div className="text-[11px] text-muted-foreground">Coverage quality</div>
                <div className="mt-2 text-sm font-medium">
                  {embeddingPipeline.stats.vectorQuality}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Coverage gaps flagged: {embeddingPipeline.stats.dimensionMismatches}
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border bg-background/30 p-3">
                <div className="text-[11px] text-muted-foreground">Last successful refresh</div>
                <div className="mt-2 text-sm font-medium">
                  {embeddingPipeline.stats.lastSuccessfulEmbedding ?? "N/A"}
                </div>
              </div>
              <div className="rounded-xl border bg-background/30 p-3">
                <div className="text-[11px] text-muted-foreground">Last issue flagged</div>
                <div className="mt-2 text-sm font-medium">
                  {embeddingPipeline.stats.lastFailedEmbedding ?? "N/A"}
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-background/30 p-3 text-[13px] leading-snug text-muted-foreground">
              AlphaOS keeps enriching research memory in the background so evidence trails remain available during live presentations.
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
                onClick={embeddingPipeline.retryFailedJobs}
                disabled={embeddingPipeline.processing || embeddingPipeline.stats.failed === 0}
              >
                Retry Flagged Items
              </Button>
              <Button
                variant="outline"
                onClick={embeddingPipeline.refresh}
                disabled={embeddingPipeline.loading || embeddingPipeline.processing}
              >
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 xl:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Research Context Review
            </CardTitle>
            <CardDescription>
              Review how AlphaOS surfaces the most relevant market context behind each thesis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
              <input
                value={semanticSearch.query}
                onChange={(e) => semanticSearch.setQuery(e.target.value)}
                placeholder="Search market memory and research..."
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
              <Button onClick={semanticSearch.run} disabled={semanticSearch.loading} className="gap-2 w-full lg:w-auto">
                <Search className="h-4 w-4" />
                {semanticSearch.loading ? "Reviewing..." : "Review Matches"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={semanticSearch.embeddingSource === "live" ? "success" : "warning"}>
                {semanticSearch.embeddingSource === "live"
                  ? "Research Context Ready"
                  : semanticSearch.embeddingSource === "fallback"
                    ? "Research Context Protected"
                    : "Context Review Available"}
              </Badge>
            </div>

            {semanticSearch.error ? (
              <div className="rounded-xl border bg-background/30 p-3 text-sm text-muted-foreground">
                {semanticSearch.error.message}
              </div>
            ) : null}

            <div className="space-y-2">
              {semanticSearch.results.length === 0 ? (
                <div className="rounded-xl border bg-background/30 p-3 text-sm text-muted-foreground">
                  Run a context review to inspect the strongest supporting evidence AlphaOS can surface for the current market question.
                </div>
              ) : (
                semanticSearch.results.map((result) => (
                  <div key={result.id} className="rounded-xl border bg-background/30 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{result.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {result.documentType} · match strength {Math.round(result.similarity * 100)}%
                        </div>
                      </div>
                      <Badge variant="outline">{result.documentType}</Badge>
                    </div>
                    <div className="mt-3 text-[13px] leading-snug text-foreground/90">{result.content}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
