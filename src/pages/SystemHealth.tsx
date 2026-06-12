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
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          System Health
        </div>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Production readiness audit
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Confirms whether AlphaOS is running on live infrastructure, where fallback is still active, and whether embeddings plus RAG are production-safe.
        </p>
      </div>

      <SystemHealthDashboard />

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="bg-card/40 lg:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Embedding Health
            </CardTitle>
            <CardDescription>
              Queue state, vector dimension, retries, and last generated record.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Pending {embeddingPipeline.stats.pending}</Badge>
              <Badge variant="outline">Processing {embeddingPipeline.stats.processing}</Badge>
              <Badge>Completed {embeddingPipeline.stats.completed}</Badge>
              <Badge variant="secondary">Failed {embeddingPipeline.stats.failed}</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-xs text-muted-foreground">Last embedding generated</div>
                <div className="mt-2 text-sm font-medium">
                  {embeddingPipeline.stats.lastGenerated ?? "N/A"}
                </div>
              </div>
              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-xs text-muted-foreground">Vector dimension</div>
                <div className="mt-2 text-sm font-medium">
                  {embeddingPipeline.stats.vectorDimension ?? "N/A"} · target 1536 · mismatches{" "}
                  {embeddingPipeline.stats.dimensionMismatches}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Model: {embeddingPipeline.stats.embeddingModel ?? "N/A"}
                </div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-xs text-muted-foreground">Last successful job</div>
                <div className="mt-2 text-sm font-medium">
                  {embeddingPipeline.stats.lastSuccessfulEmbedding ?? "N/A"}
                </div>
              </div>
              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-xs text-muted-foreground">Last failed job</div>
                <div className="mt-2 text-sm font-medium">
                  {embeddingPipeline.stats.lastFailedEmbedding ?? "N/A"}
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              {embeddingPipeline.stats.vectorQuality}
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
                onClick={embeddingPipeline.retryFailedJobs}
                disabled={embeddingPipeline.processing || embeddingPipeline.stats.failed === 0}
              >
                Retry Failed Jobs
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

        <Card className="bg-card/40 lg:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              RAG Search Test
            </CardTitle>
            <CardDescription>
              Validates semantic retrieval with real query embeddings when available.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <input
                value={semanticSearch.query}
                onChange={(e) => semanticSearch.setQuery(e.target.value)}
                placeholder="Search market memory..."
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
              <Button onClick={semanticSearch.run} disabled={semanticSearch.loading} className="gap-2">
                <Search className="h-4 w-4" />
                {semanticSearch.loading ? "Testing..." : "Search Test"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={semanticSearch.embeddingSource === "live" ? "default" : "secondary"}>
                Query Embedding {semanticSearch.embeddingSource ?? "idle"}
              </Badge>
            </div>

            {semanticSearch.error ? (
              <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                {semanticSearch.error.message}
              </div>
            ) : null}

            <div className="space-y-3">
              {semanticSearch.results.length === 0 ? (
                <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                  Run Search Test to verify retrieval, relevance scoring, and document availability.
                </div>
              ) : (
                semanticSearch.results.map((result) => (
                  <div key={result.id} className="rounded-xl border bg-background/35 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{result.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {result.documentType} · relevance {Math.round(result.similarity * 100)}%
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
    </div>
  )
}
