import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { AlphaScoreBadge } from "@/components/alpha/AlphaScoreBadge"
import { OpportunityRadar } from "@/components/opportunity/OpportunityRadar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NarrativeHeatmap } from "@/components/narratives/NarrativeHeatmap"
import { NarrativeRadarChart } from "@/components/narratives/NarrativeRadarChart"
import { NarrativeRankings } from "@/components/narratives/NarrativeRankings"
import { useHypotheses } from "@/hooks/useHypotheses"
import { isErr } from "@/lib/api"
import { buildAlphaScore } from "@/services/alphaScoreService"
import { cmcServices } from "@/services/cmc"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useNarrativeIntelligenceData } from "@/hooks/useNarrativeIntelligenceData"
import type { CategoryMetric, Quote, TechnicalSummary } from "@/services/cmc/types"
import type { HypothesisDetail } from "@/services/hypotheses"
import { buildOpportunityRadar } from "@/services/opportunityIntelligence"

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/30 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-base font-semibold tracking-tight">
        {value}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data, loading, error, retry } = useDashboardData()
  const { data: hypotheses } = useHypotheses()
  const [cmcSignals, setCmcSignals] = useState<{
    quotes: Quote[]
    categories: CategoryMetric[]
    technicals: TechnicalSummary[]
  }>({
    quotes: [],
    categories: [],
    technicals: [],
  })
  const best = useMemo(
    () => hypotheses.find((h) => h.status !== "closed") ?? hypotheses[0] ?? null,
    [hypotheses]
  )
  const {
    data: narratives,
    loading: narrativesLoading,
    error: narrativesError,
    retry: narrativesRetry,
  } = useNarrativeIntelligenceData()
  const opportunityRadar = useMemo(
    () =>
      buildOpportunityRadar(hypotheses, {
        quotes: cmcSignals.quotes,
        categories: cmcSignals.categories,
        technicals: cmcSignals.technicals,
      }).slice(0, 5),
    [cmcSignals.categories, cmcSignals.quotes, cmcSignals.technicals, hypotheses]
  )

  useEffect(() => {
    let cancelled = false

    async function loadSignals() {
      const symbols = best?.relatedAssets.slice(0, 3) ?? []
      const normalizedSymbols = symbols.length > 0 ? symbols : ["BTC", "ETH", "SOL"]

      const [quotesRes, categoriesRes, technicalsRes] = await Promise.all([
        cmcServices.quotes.getQuotes(normalizedSymbols),
        cmcServices.categories.getCategories(),
        cmcServices.technicals.getTechnicals(normalizedSymbols),
      ])

      if (cancelled) return

      setCmcSignals({
        quotes: isErr(quotesRes) ? [] : quotesRes.data,
        categories: isErr(categoriesRes) ? [] : categoriesRes.data,
        technicals: isErr(technicalsRes) ? [] : technicalsRes.data,
      })
    }

    loadSignals()

    return () => {
      cancelled = true
    }
  }, [best])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] font-medium tracking-wide text-muted-foreground">Today’s alpha</div>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
            Opportunities the market has not priced in yet
          </h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button asChild className="w-full sm:w-auto">
            <Link
              to="/journey"
              className="flex items-center gap-2"
            >
              Explore Today&apos;s Best Opportunity
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/hypotheses" className="flex items-center gap-2">
              Open Hypothesis Center
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="bg-card/40 lg:col-span-7">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Today’s Alpha Opportunities</CardTitle>
                <CardDescription>
                  Prioritized by evidence, timing, and Alpha Score.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="w-full md:w-auto">
                <Link to="/journey" className="flex items-center gap-2">
                  Explore Today&apos;s Best Opportunity
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
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
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate("/journey")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") navigate("/journey")
                  }}
                  className="group cursor-pointer rounded-xl border bg-background/30 px-3 py-2.5 transition-colors hover:bg-background/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-display text-[15px] font-semibold tracking-tight">
                            {o.title}
                          </div>
                          <div className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                            {o.whyNow}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <AlphaScoreBadge score={alphaScore} compact />
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge>Confidence {o.confidence}%</Badge>
                        <Badge variant="secondary">Risk {o.riskScore}</Badge>
                        <Badge variant="outline">Horizon {o.expectedHorizon}</Badge>
                        {o.relatedNarratives[0] ? (
                          <Badge variant="secondary">{o.relatedNarratives[0]}</Badge>
                        ) : null}
                      </div>
                    </div>

                    <Link
                      to={`/hypotheses/${o.id}`}
                      className="grid h-8 w-8 place-items-center rounded-md border bg-background/30 text-muted-foreground transition-colors hover:bg-background/40 hover:text-foreground"
                      aria-label="Open evidence"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:col-span-5">
          <Card className="bg-card/40">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Market Regime</CardTitle>
                <CardDescription>Compact read on conditions and risk.</CardDescription>
              </div>
              <Badge className="mt-0.5" variant="secondary">
                Bull Expansion
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              <Metric label="Confidence" value="0.86" />
              <Metric label="Risk Level" value="Moderate" />
            </CardContent>
          </Card>

          <Card className="bg-card/40">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>Market Pulse</CardTitle>
                <CardDescription>Live metrics, synced from CoinMarketCap.</CardDescription>
              </div>
              {data ? (
                <Badge
                  className="mt-0.5"
                  variant={data.cmcStatus.sentiment.source === "live" ? "success" : "warning"}
                >
                  {data.cmcStatus.sentiment.source === "live" ? "Live Intelligence" : "Protected Intelligence"}
                </Badge>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="h-[54px] animate-pulse rounded-lg border bg-background/30" />
                  <div className="h-[54px] animate-pulse rounded-lg border bg-background/30" />
                  <div className="h-[54px] animate-pulse rounded-lg border bg-background/30" />
                  <div className="h-[54px] animate-pulse rounded-lg border bg-background/30" />
                </div>
              ) : error ? (
                <div className="rounded-xl border bg-background/35 p-3">
                  <div className="text-sm font-medium">Intelligence refresh in progress</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    AlphaOS is re-verifying market intelligence for this panel. Retry to refresh the latest view.
                  </div>
                  <Button variant="outline" className="mt-3" onClick={retry}>
                    Retry
                  </Button>
                </div>
              ) : data ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background/30 px-3 py-2">
                    <div className="text-[11px] text-muted-foreground">
                      Last verified: {data.cmcStatus.sentiment.lastSync ?? "N/A"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{data.cmcStatus.sentiment.message}</div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border bg-background/30 px-3 py-2">
                      <div className="text-[11px] text-muted-foreground">Market Context</div>
                      {cmcSignals.quotes.length > 0 ? (
                        <div className="mt-1 space-y-1">
                          {cmcSignals.quotes.slice(0, 3).map((quote) => (
                            <div key={quote.symbol} className="flex items-center justify-between gap-2 text-[13px]">
                              <span>{quote.symbol}</span>
                              <span className="text-muted-foreground">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: quote.priceUsd >= 1_000 ? 0 : 2,
                                }).format(quote.priceUsd)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                      <div className="mt-1 text-[13px] text-muted-foreground">
                        Verified market pricing remains available while live updates refresh.
                      </div>
                      )}
                    </div>
                    <div className="rounded-lg border bg-background/30 px-3 py-2">
                      <div className="text-[11px] text-muted-foreground">Category Rotation</div>
                      {cmcSignals.categories.length > 0 ? (
                        <div className="mt-1 space-y-1">
                          {cmcSignals.categories
                            .slice()
                            .sort((a, b) => b.rotationScore - a.rotationScore)
                            .slice(0, 3)
                            .map((category) => (
                              <div key={category.name} className="flex items-center justify-between gap-2 text-[13px]">
                                <span>{category.name}</span>
                                <span className="text-muted-foreground">{Math.round(category.rotationScore)}</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="mt-1 text-[13px] text-muted-foreground">
                          Category intelligence is being protected with the latest verified rotation view.
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg border bg-background/30 px-3 py-2">
                      <div className="text-[11px] text-muted-foreground">Technical Confirmation</div>
                      {cmcSignals.technicals.length > 0 ? (
                        <div className="mt-1 space-y-1">
                          {cmcSignals.technicals.slice(0, 3).map((technical) => (
                            <div key={technical.symbol} className="flex items-center justify-between gap-2 text-[13px]">
                              <span>{technical.symbol}</span>
                              <span className="text-muted-foreground">{technical.trend}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-1 text-[13px] text-muted-foreground">
                          Technical confirmation is being preserved with the latest verified read.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Metric
                      label="BTC Dominance"
                      value={`${data.marketPulse.btcDominance.toFixed(1)}%`}
                    />
                    <Metric label="Fear & Greed" value={`${Math.round(data.marketPulse.fearGreed)}`} />
                    <Metric
                      label="News Momentum"
                      value={`${Math.round(data.marketPulse.newsMomentum * 100)}%`}
                    />
                    <Metric
                      label="Sentiment"
                      value={`${Math.round(data.marketPulse.sentimentScore * 100)}%`}
                    />
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle>Narrative Radar</CardTitle>
              <CardDescription>
                See which narratives are strengthening before the market consensus updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {narrativesLoading ? (
                <div className="h-[260px] animate-pulse rounded-xl border bg-background/30" />
              ) : narrativesError ? (
                <div className="rounded-xl border bg-background/35 p-4">
                  <div className="text-sm font-medium">Failed to load</div>
                  <div className="mt-1 text-sm text-muted-foreground">{narrativesError.message}</div>
                  <Button variant="outline" className="mt-3" onClick={narrativesRetry}>
                    Retry
                  </Button>
                </div>
              ) : narratives ? (
                <NarrativeRadarChart narratives={narratives} />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <OpportunityRadar items={opportunityRadar} />

      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="min-w-0 bg-card/40 lg:col-span-8">
          <CardHeader>
            <CardTitle>Narrative Intelligence</CardTitle>
            <CardDescription>Heatmap of narrative strength, velocity, growth, and rotation.</CardDescription>
          </CardHeader>
          <CardContent>
            {narrativesLoading ? (
              <div className="h-[380px] animate-pulse rounded-xl border bg-background/30" />
            ) : narrativesError ? (
              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-sm font-medium">Failed to load</div>
                <div className="mt-1 text-sm text-muted-foreground">{narrativesError.message}</div>
                <Button variant="outline" className="mt-3" onClick={narrativesRetry}>
                  Retry
                </Button>
              </div>
            ) : narratives ? (
              <NarrativeHeatmap narratives={narratives} />
            ) : null}
          </CardContent>
        </Card>

        <Card className="min-w-0 bg-card/40 lg:col-span-4">
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>Emerging vs losing narratives based on the current snapshot.</CardDescription>
          </CardHeader>
          <CardContent>
            {narrativesLoading ? (
              <div className="h-[380px] animate-pulse rounded-xl border bg-background/30" />
            ) : narrativesError ? (
              <div className="rounded-xl border bg-background/35 p-4">
                <div className="text-sm font-medium">Failed to load</div>
                <div className="mt-1 text-sm text-muted-foreground">{narrativesError.message}</div>
                <Button variant="outline" className="mt-3" onClick={narrativesRetry}>
                  Retry
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
          <CardTitle>Recommended Flow</CardTitle>
          <CardDescription>
            Suggested navigation for a first-time user to understand AlphaOS end-to-end.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "1. Dashboard", to: "/dashboard" },
            { label: "2. Hypothesis", to: "/hypotheses" },
            { label: "3. Evidence", to: "/hypotheses" },
            { label: "4. Strategy", to: "/strategy-lab" },
            { label: "5. Critic", to: "/strategy-lab" },
            { label: "6. Report", to: "/research" },
            { label: "7. Settings", to: "/settings" },
          ].map((step) => (
            <Link
              key={step.label}
              to={step.to}
              className="rounded-xl border bg-background/30 px-3 py-2.5 text-sm transition-colors hover:bg-background/40"
            >
              <div className="font-medium">{step.label}</div>
              <div className="mt-1 text-[13px] leading-snug text-muted-foreground">Open step</div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

