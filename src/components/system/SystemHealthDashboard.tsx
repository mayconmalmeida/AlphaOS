import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSystemHealth } from "@/hooks/useSystemHealth"

function badgeVariant(state: "connected" | "warning" | "error") {
  if (state === "connected") return "success"
  if (state === "warning") return "warning"
  return "danger"
}

function combineStates(states: Array<"connected" | "warning" | "error" | undefined>) {
  if (states.some((state) => state === "error")) return "error" as const
  if (states.some((state) => state === "warning" || state === undefined)) return "warning" as const
  return "connected" as const
}

function readinessLabel(state: "connected" | "warning" | "error") {
  if (state === "connected") return "Ready"
  if (state === "warning") return "Protected"
  return "Attention Required"
}

export function SystemHealthDashboard() {
  const { report, loading, error, refresh } = useSystemHealth()
  const byKey = new Map(report?.integrations.map((item) => [item.key, item]) ?? [])
  const intelligenceConnected = combineStates([
    byKey.get("supabase")?.state,
    byKey.get("edgeFunctions")?.state,
    byKey.get("coinmarketcap")?.state,
  ])
  const researchReady = combineStates([
    byKey.get("openai")?.state,
    byKey.get("embeddings")?.state,
    byKey.get("rag")?.state,
  ])
  const marketDataReady = combineStates([
    byKey.get("coinmarketcap")?.state,
    byKey.get("marketIngestion")?.state,
  ])
  const strategyEngineReady =
    (report?.summary.totalStrategies ?? 0) > 0
      ? combineStates([byKey.get("openai")?.state, byKey.get("coinmarketcap")?.state])
      : byKey.get("openai")?.state === "error"
        ? "error"
        : "warning"
  const reportsReady =
    (report?.summary.totalReports ?? 0) > 0
      ? combineStates([byKey.get("openai")?.state, byKey.get("rag")?.state])
      : byKey.get("openai")?.state === "error"
        ? "error"
        : "warning"

  const readiness = [
    {
      label: "Intelligence Connected",
      state: intelligenceConnected,
      description: "Market intelligence is flowing through AlphaOS and staying presentation-ready.",
    },
    {
      label: "Research Ready",
      state: researchReady,
      description: "Research context and supporting evidence are available for analyst-grade output.",
    },
    {
      label: "Market Data Ready",
      state: marketDataReady,
      description: "CoinMarketCap signals are available for quotes, narratives, and market context.",
    },
    {
      label: "Strategy Engine Ready",
      state: strategyEngineReady,
      description: "Opportunity framing can translate intelligence into strategy pathways.",
    },
    {
      label: "Reports Ready",
      state: reportsReady,
      description: "Research reports can be produced from the current intelligence base.",
    },
  ]

  return (
    <Card className="bg-card/40">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Infrastructure Readiness</CardTitle>
            <CardDescription>
              Executive readiness view for the intelligence, research, and reporting capabilities shown during the demo.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={refresh} disabled={loading} className="w-full sm:w-auto">
            {loading ? "Refreshing..." : "Refresh Readiness"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {error ? (
          <div className="rounded-xl border bg-background/30 p-3 text-sm text-muted-foreground">
            AlphaOS could not refresh readiness right now. The most recent verified state remains in place.
          </div>
        ) : null}

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          {readiness.map((item) => (
            <div key={item.label} className="rounded-xl border bg-background/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] text-muted-foreground">{item.label}</div>
                <Badge variant={badgeVariant(item.state)}>{readinessLabel(item.state)}</Badge>
              </div>
              <div className="mt-2 text-[13px] leading-snug text-foreground/90">{item.description}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="rounded-xl border bg-background/30 p-3">
            <div className="text-[11px] text-muted-foreground">Market States Indexed</div>
            <div className="mt-1 font-display text-xl font-semibold tracking-tight">
              {report?.summary.totalMarketSnapshots ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/30 p-3">
            <div className="text-[11px] text-muted-foreground">Intelligence Records</div>
            <div className="mt-1 font-display text-xl font-semibold tracking-tight">
              {report?.summary.totalDocuments ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/30 p-3">
            <div className="text-[11px] text-muted-foreground">Opportunity Briefs</div>
            <div className="mt-1 font-display text-xl font-semibold tracking-tight">
              {report?.summary.totalHypotheses ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/30 p-3">
            <div className="text-[11px] text-muted-foreground">Strategy Pathways</div>
            <div className="mt-1 font-display text-xl font-semibold tracking-tight">
              {report?.summary.totalStrategies ?? 0}
            </div>
          </div>
          <div className="rounded-xl border bg-background/30 p-3">
            <div className="text-[11px] text-muted-foreground">Research Reports</div>
            <div className="mt-1 font-display text-xl font-semibold tracking-tight">
              {report?.summary.totalReports ?? 0}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-background/30 p-3 text-[13px] leading-snug text-muted-foreground">
          Last verified: {report?.summary.lastSync ?? "N/A"}. AlphaOS keeps market intelligence available for the demo with live connectivity where possible and protected continuity where refresh cycles are still completing.
        </div>
      </CardContent>
    </Card>
  )
}

