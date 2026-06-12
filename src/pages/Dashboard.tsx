import { ArrowUpRight, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

import { AlphaScoreBadge } from "@/components/alpha/AlphaScoreBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NarrativeHeatmap } from "@/components/narratives/NarrativeHeatmap"
import { NarrativeRadarChart } from "@/components/narratives/NarrativeRadarChart"
import { NarrativeRankings } from "@/components/narratives/NarrativeRankings"
import { useHypotheses } from "@/hooks/useHypotheses"
import { buildAlphaScore } from "@/services/alphaScoreService"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useNarrativeIntelligenceData } from "@/hooks/useNarrativeIntelligenceData"
import type { HypothesisDetail } from "@/services/hypotheses"

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold tracking-tight">
        {value}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data, loading, error, retry } = useDashboardData()
  const { data: hypotheses } = useHypotheses()
  const {
    data: narratives,
    loading: narrativesLoading,
    error: narrativesError,
    retry: narrativesRetry,
  } = useNarrativeIntelligenceData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Today’s alpha
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Oportunidades que ainda não viraram consenso
          </h2>
        </div>
        <Button asChild variant="outline">
          <Link to="/hypotheses" className="flex items-center gap-2">
            Abrir Hypothesis Center
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="bg-card/40 lg:col-span-7">
          <CardHeader>
            <CardTitle>Today’s Alpha Opportunities</CardTitle>
            <CardDescription>Live-ready hypothesis stream with explicit Alpha Score and provenance-first positioning.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {hypotheses.slice(0, 3).map((o) => {
              const alphaScore = buildAlphaScore({
                ...(o as HypothesisDetail),
                evidence: [],
                narrativeSignals: [],
                historicalAnalogues: [],
              })

              return (
              <div
                key={o.title}
                className="group rounded-xl border bg-background/35 p-4 transition-colors hover:bg-background/45"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-display text-base font-semibold tracking-tight">
                      {o.title}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {o.whyNow}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge>Confidence {o.confidence}%</Badge>
                      <AlphaScoreBadge score={alphaScore} compact />
                      <Badge variant="secondary">Risk {o.riskScore}</Badge>
                      <Badge variant="secondary">{o.marketRegime}</Badge>
                      {o.relatedNarratives[0] ? (
                        <Badge variant="secondary">{o.relatedNarratives[0]}</Badge>
                      ) : null}
                      <Badge variant="outline">Horizon {o.expectedHorizon}</Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card/50 p-2 opacity-70 transition-opacity group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:col-span-5">
          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle>Market Regime</CardTitle>
              <CardDescription>Leitura macro em linguagem operacional.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              <Metric label="Regime" value="Bull Expansion" />
              <Metric label="Confidence" value="0.86" />
              <Metric label="Risk Level" value="Moderate" />
            </CardContent>
          </Card>

          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle>Market Pulse</CardTitle>
              <CardDescription>
                Live CoinMarketCap state with explicit fallback signaling, sync time, and retry path.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              {loading ? (
                <>
                  <div className="h-[70px] animate-pulse rounded-lg border bg-background/30" />
                  <div className="h-[70px] animate-pulse rounded-lg border bg-background/30" />
                  <div className="h-[70px] animate-pulse rounded-lg border bg-background/30" />
                </>
              ) : error ? (
                <div className="rounded-xl border bg-background/35 p-4">
                  <div className="text-sm font-medium">Falha ao carregar</div>
                  <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
                  <Button variant="outline" className="mt-3" onClick={retry}>
                    Tentar novamente
                  </Button>
                </div>
              ) : data ? (
                <>
                  <div className="rounded-lg border bg-background/40 p-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={data.cmcStatus.sentiment.source === "live" ? "default" : "secondary"}>
                        {data.cmcStatus.sentiment.source === "live" ? "Live CMC Data" : "Demo Mode"}
                      </Badge>
                      <Badge variant="outline">
                        {data.cmcStatus.sentiment.source === "live" ? "Market Pulse" : "Fallback data"}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last sync: {data.cmcStatus.sentiment.lastSync ?? "N/A"} · {data.cmcStatus.sentiment.message}
                    </div>
                  </div>
                  <Metric label="BTC Dominance" value={`${data.marketPulse.btcDominance.toFixed(1)}%`} />
                  <Metric label="Fear & Greed" value={`${Math.round(data.marketPulse.fearGreed)}`} />
                  <Metric label="News Momentum" value={`${Math.round(data.marketPulse.newsMomentum * 100)}%`} />
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle>Narrative Radar</CardTitle>
              <CardDescription>Radar chart entra na fase de Narrative Intelligence.</CardDescription>
            </CardHeader>
            <CardContent>
              {narrativesLoading ? (
                <div className="h-[260px] animate-pulse rounded-xl border bg-background/30" />
              ) : narrativesError ? (
                <div className="rounded-xl border bg-background/35 p-4">
                  <div className="text-sm font-medium">Falha ao carregar</div>
                  <div className="mt-1 text-sm text-muted-foreground">{narrativesError.message}</div>
                  <Button variant="outline" className="mt-3" onClick={narrativesRetry}>
                    Tentar novamente
                  </Button>
                </div>
              ) : narratives ? (
                <NarrativeRadarChart narratives={narratives} />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="bg-card/40 lg:col-span-8">
          <CardHeader>
            <CardTitle>Narrative Intelligence</CardTitle>
            <CardDescription>Heatmap de strength/velocity/growth/rotation.</CardDescription>
          </CardHeader>
          <CardContent>
            {narrativesLoading ? (
              <div className="h-[380px] animate-pulse rounded-xl border bg-background/30" />
            ) : narrativesError ? (
              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-sm font-medium">Falha ao carregar</div>
                <div className="mt-1 text-sm text-muted-foreground">{narrativesError.message}</div>
                <Button variant="outline" className="mt-3" onClick={narrativesRetry}>
                  Tentar novamente
                </Button>
              </div>
            ) : narratives ? (
              <NarrativeHeatmap narratives={narratives} />
            ) : null}
          </CardContent>
        </Card>

        <Card className="bg-card/40 lg:col-span-4">
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>Emerging vs losing (mock).</CardDescription>
          </CardHeader>
          <CardContent>
            {narrativesLoading ? (
              <div className="h-[380px] animate-pulse rounded-xl border bg-background/30" />
            ) : narrativesError ? (
              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-sm font-medium">Falha ao carregar</div>
                <div className="mt-1 text-sm text-muted-foreground">{narrativesError.message}</div>
                <Button variant="outline" className="mt-3" onClick={narrativesRetry}>
                  Tentar novamente
                </Button>
              </div>
            ) : narratives ? (
              <NarrativeRankings narratives={narratives} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>Final Demo Flow</CardTitle>
          <CardDescription>
            Caminho recomendado para demo de hackathon e apresentação institucional.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "1. Dashboard", to: "/dashboard" },
            { label: "2. Hypothesis", to: "/hypotheses" },
            { label: "3. Evidence", to: "/hypotheses/214" },
            { label: "4. Strategy", to: "/strategy-lab" },
            { label: "5. Critic", to: "/strategy-lab" },
            { label: "6. Report", to: "/research" },
            { label: "7. Settings", to: "/settings" },
          ].map((step) => (
            <Link
              key={step.label}
              to={step.to}
              className="rounded-xl border bg-background/35 p-4 text-sm transition-colors hover:bg-background/45"
            >
              <div className="font-medium">{step.label}</div>
              <div className="mt-1 text-muted-foreground">Abrir etapa</div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

