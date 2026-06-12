import { useMemo } from "react"
import { Calendar, GitCompare, Search } from "lucide-react"

import { EvidenceGraph } from "@/components/evidence/EvidenceGraph"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useMarketMemory } from "@/hooks/useMarketMemory"
import { getSnapshotMarketRegime } from "@/services/marketMemory/snapshotToMarketDocument"

export default function MarketMemory() {
  const {
    search,
    setSearch,
    snapshots,
    selectedId,
    setSelectedId,
    compareId,
    setCompareId,
    availableCompareTargets,
    selected,
    similar,
    comparison,
    loading,
    error,
    retry,
  } = useMarketMemory()

  const compareOptions = useMemo(() => {
    return availableCompareTargets.map((s) => ({ id: s.id, label: `${s.date} — ${s.title}` }))
  }, [availableCompareTargets])

  const graph =
    selected
      ? {
          nodes: [
            {
              id: `market:${selected.id}`,
              label: "Current Market",
              kind: "market" as const,
              x: 240,
              y: 160,
              confidence: Math.round(selected.marketPulse.fearGreed),
              relevance: 100,
            },
            {
              id: `snapshot:${selected.id}`,
              label: selected.title,
              kind: "historical" as const,
              x: 500,
              y: 160,
              confidence: Math.round(selected.marketPulse.sentimentScore * 100),
              relevance: 94,
            },
            ...selected.narratives.slice(0, 4).map((item, index) => ({
              id: `narrative:${item.name}`,
              label: item.name,
              kind: "narrative" as const,
              x: 780,
              y: 70 + index * 90,
              confidence: Math.round(item.strength),
              relevance: Math.round(item.velocity),
            })),
          ],
          edges: [
            {
              id: `derived:${selected.id}`,
              from: `market:${selected.id}`,
              to: `snapshot:${selected.id}`,
              kind: "derived_from" as const,
              weight: 92,
            },
            ...selected.narratives.slice(0, 4).map((item) => ({
              id: `influenced:${item.name}`,
              from: `narrative:${item.name}`,
              to: `snapshot:${selected.id}`,
              kind: "influenced_by" as const,
              weight: Math.round(item.strength),
            })),
          ],
        }
      : null

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground">Market Memory</div>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
          Explore historical market states
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-snug text-muted-foreground">
          Review daily snapshots, compare regimes, and surface the closest historical setups with
          clear market context and verified intelligence states.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <Card className="bg-card/40 xl:col-span-4">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Select a snapshot to explore.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by date, title, or summary..."
                className="pl-9"
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-16 animate-pulse rounded-xl border bg-background/30"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-sm font-medium">Failed to load</div>
                <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
                <Button variant="outline" className="mt-3" onClick={retry}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute bottom-0 left-[9px] top-0 w-px bg-border/70" />
                <div className="space-y-2">
                  {snapshots.map((s) => {
                    const active = s.id === selectedId
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedId(s.id)}
                        className={[
                          "relative w-full rounded-xl border p-3 text-left transition-colors",
                          "bg-background/35 hover:bg-background/45",
                          active ? "border-primary/50 bg-background/55" : "border-border",
                        ].join(" ")}
                      >
                        <div className="absolute left-[3px] top-[18px] h-3 w-3 rounded-full border bg-background">
                          <div
                            className={[
                              "mx-auto mt-1 h-1.5 w-1.5 rounded-full",
                              active ? "bg-primary" : "bg-muted-foreground/50",
                            ].join(" ")}
                          />
                        </div>
                        <div className="flex items-start justify-between gap-3 pl-5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{s.date}</span>
                            </div>
                            <div className="mt-1 truncate font-display text-sm font-semibold tracking-tight">
                              {s.title}
                            </div>
                            <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {s.summary}
                            </div>
                          </div>
                          {active ? <Badge>Current</Badge> : <Badge variant="secondary">Snapshot</Badge>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:col-span-5">
          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle>Snapshot Explorer</CardTitle>
            <CardDescription>Daily metrics, narratives, and market context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selected ? (
                <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                  Select a snapshot from the timeline.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{selected.date}</Badge>
                    <Badge variant="secondary">
                      Fear &amp; Greed {Math.round(selected.marketPulse.fearGreed)}
                    </Badge>
                    <Badge variant="secondary">
                      BTC Dom {selected.marketPulse.btcDominance.toFixed(1)}%
                    </Badge>
                    <Badge variant="outline">
                      News {Math.round(selected.marketPulse.newsMomentum * 100)}%
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border bg-background/35 p-4">
                      <div className="text-xs text-muted-foreground">Market Cap</div>
                      <div className="mt-1 font-display text-lg font-semibold tracking-tight">
                        ${Math.round(selected.marketPulse.marketCapUsd / 1e9)}B
                      </div>
                    </div>
                    <div className="rounded-xl border bg-background/35 p-4">
                      <div className="text-xs text-muted-foreground">Volume 24h</div>
                      <div className="mt-1 font-display text-lg font-semibold tracking-tight">
                        ${Math.round(selected.marketPulse.volume24hUsd / 1e9)}B
                      </div>
                    </div>
                    <div className="rounded-xl border bg-background/35 p-4">
                      <div className="text-xs text-muted-foreground">Sentiment Score</div>
                      <div className="mt-1 font-display text-lg font-semibold tracking-tight">
                        {selected.marketPulse.sentimentScore.toFixed(2)}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-background/35 p-4">
                      <div className="text-xs text-muted-foreground">Summary</div>
                      <div className="mt-1 text-sm text-foreground/90">{selected.summary}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-background/35 p-4">
                    <div className="text-sm font-medium">Narratives</div>
                    <div className="mt-3 space-y-2">
                      {selected.narratives
                        .slice()
                        .sort((a, b) => b.strength - a.strength)
                        .map((n) => (
                          <div key={n.name} className="flex items-center gap-3">
                            <div className="w-28 truncate text-xs text-muted-foreground">
                              {n.name}
                            </div>
                            <div className="relative h-2 flex-1 overflow-hidden rounded-full border bg-background/30">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full bg-primary/70"
                                style={{ width: `${Math.max(0, Math.min(100, n.strength))}%` }}
                              />
                            </div>
                            <div className="w-10 text-right text-xs text-muted-foreground">
                              {Math.round(n.strength)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-primary" />
                Compare periods
              </CardTitle>
              <CardDescription>Compare metric deltas and regime context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="text-sm text-muted-foreground md:w-40">Compare with</div>
                <select
                  value={compareId ?? ""}
                  onChange={(e) => setCompareId(e.target.value || null)}
                  className="h-9 w-full rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select...</option>
                  {compareOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {!comparison ? (
                <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                  Choose a period to inspect the regime differences.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    { k: "BTC Dom", v: comparison.delta.btcDominance, fmt: (n: number) => `${n.toFixed(1)}%` },
                    { k: "Fear&Greed", v: comparison.delta.fearGreed, fmt: (n: number) => `${Math.round(n)}` },
                    { k: "Sentiment", v: comparison.delta.sentimentScore, fmt: (n: number) => n.toFixed(2) },
                    { k: "News", v: comparison.delta.newsMomentum, fmt: (n: number) => `${Math.round(n * 100)}%` },
                  ].map((row) => (
                    <div key={row.k} className="rounded-xl border bg-background/35 p-4">
                      <div className="text-xs text-muted-foreground">{row.k} (Δ)</div>
                      <div className="mt-1 font-display text-lg font-semibold tracking-tight">
                        {row.v >= 0 ? "+" : ""}
                        {row.fmt(row.v)}
                      </div>
                    </div>
                  ))}
                  <div className="rounded-xl border bg-background/35 p-4 md:col-span-3">
                    <div className="text-xs text-muted-foreground">Interpretation</div>
                    <div className="mt-1 text-sm text-foreground/90">
                      {comparison.b.context.historicalContext}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/40 xl:col-span-3">
          <CardHeader>
            <CardTitle>Similar Markets</CardTitle>
            <CardDescription>Similarity method, context, and what happened next.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selected ? (
              <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                Select a snapshot to retrieve similar markets.
              </div>
            ) : (
              <>
                {similar.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={similar[0].method === "vector" ? "default" : "secondary"}>
                      {similar[0].method === "vector" ? "Vector Search" : "Heuristic Matching"}
                    </Badge>
                    <Badge variant="outline">
                      {selected.sourceMode === "live" ? "Live Intelligence" : "Protected Intelligence"}
                    </Badge>
                  </div>
                ) : (
                  <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                    Historical comparison expands automatically as new market states are indexed.
                  </div>
                )}
                {similar[0]?.method === "heuristic" ? (
                  <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                    Similarity coverage is building from accumulated market intelligence and will deepen with every new market state.
                  </div>
                ) : null}
                {similar.map((row) => (
                  <div key={row.snapshot.id} className="rounded-xl border bg-background/35 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">{row.snapshot.date}</div>
                        <div className="mt-1 truncate font-display text-sm font-semibold tracking-tight">
                          {row.snapshot.title}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{getSnapshotMarketRegime(row.snapshot)}</Badge>
                          <Badge variant="outline">
                            {row.snapshot.sourceMode === "live" ? "Live Intelligence" : "Protected Intelligence"}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {Math.round(row.similarity * 100)}%
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={row.method === "vector" ? "default" : "secondary"}>
                        {row.method === "vector" ? "Vector" : "Heuristic"}
                      </Badge>
                      {row.snapshot.narratives.slice(0, 2).map((n) => (
                        <Badge key={n.name} variant="outline">
                          {n.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">{row.reasoning}</div>
                    <Separator className="my-3" />
                    <div className="text-xs text-muted-foreground">What happened next</div>
                    <div className="mt-1 text-sm text-foreground/90">
                      {row.snapshot.context.whatHappenedNext}
                    </div>
                    <Button
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() => setSelectedId(row.snapshot.id)}
                    >
                      Open snapshot
                    </Button>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {graph ? (
        <EvidenceGraph
          title="Market Memory Evidence Graph"
          description="Connects current market state, the selected snapshot, and the strongest narratives behind the regime."
          nodes={graph.nodes}
          edges={graph.edges}
        />
      ) : null}
    </div>
  )
}

