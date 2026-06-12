import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSystemHealth } from "@/hooks/useSystemHealth"

function badgeVariant(state: "connected" | "warning" | "error") {
  if (state === "connected") return "default"
  if (state === "warning") return "secondary"
  return "outline" as const
}

export function SystemHealthDashboard() {
  const { report, loading, error, refresh } = useSystemHealth()

  return (
    <Card className="bg-card/40">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>System Health Dashboard</CardTitle>
            <CardDescription>
              Live audit of Supabase, OpenAI, CoinMarketCap, Edge Functions, pgvector, embeddings, RAG, and market ingestion.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={refresh} disabled={loading}>
            {loading ? "Auditing..." : "Refresh Audit"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
            {error.message}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Connected</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {report?.summary.connected ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Warning</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {report?.summary.warning ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Error</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {report?.summary.error ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Last Sync</div>
            <div className="mt-2 text-sm font-medium">{report?.summary.lastSync ?? "N/A"}</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Market Snapshots</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {report?.summary.totalMarketSnapshots ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Total Documents</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {report?.summary.totalDocuments ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Total Embeddings</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {report?.summary.totalEmbeddings ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Total Hypotheses</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {report?.summary.totalHypotheses ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Total Strategies</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {report?.summary.totalStrategies ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Total Reports</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {report?.summary.totalReports ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Metrics Source</div>
            <div className="mt-2 text-sm font-medium">{report?.summary.dataSource ?? "unavailable"}</div>
          </div>
        </div>

        <div className="grid gap-4">
          {report?.integrations.map((item) => (
            <div key={item.key} className="rounded-xl border bg-background/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Last Checked: {item.lastChecked}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Last Sync: {item.lastSync ?? "N/A"}</div>
                </div>
                <Badge variant={badgeVariant(item.state)}>{item.state}</Badge>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Exact Reason</div>
                  <div className="mt-2 text-sm text-foreground/90">{item.reason}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Required Fix</div>
                  <div className="mt-2 text-sm text-foreground/90">{item.requiredFix}</div>
                </div>
              </div>

              {item.details?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.details.map((detail) => (
                    <Badge key={detail} variant="outline">
                      {detail}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

