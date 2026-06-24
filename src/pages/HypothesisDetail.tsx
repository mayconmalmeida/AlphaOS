import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ChevronLeft, ShieldAlert, Sparkles, TrendingUp } from "lucide-react"

import { AlphaScoreBadge } from "@/components/alpha/AlphaScoreBadge"
import { AlphaScoreBreakdown } from "@/components/alpha/AlphaScoreBreakdown"
import { EvidenceGraph } from "@/components/evidence/EvidenceGraph"
import { ProvenancePanel } from "@/components/evidence/ProvenancePanel"
import { OpportunityIntelligencePanel } from "@/components/opportunity/OpportunityIntelligencePanel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useHypothesisDetail } from "@/hooks/useHypothesisDetail"
import { isErr } from "@/lib/api"
import { buildAlphaScore } from "@/services/alphaScoreService"
import { cmcServices } from "@/services/cmc"
import { getCmcRuntimeStatus } from "@/services/cmc/runtime"
import type { CategoryMetric, Quote, TechnicalSummary } from "@/services/cmc/types"
import {
  buildHypothesisEvidenceGraph,
  buildProvenanceSummary,
} from "@/services/evidence/evidenceGraph"
import { buildOpportunityIntelligence } from "@/services/opportunityIntelligence"

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1_000 ? 0 : 2,
  }).format(value)
}

function intelligenceLabel(source?: "live" | "fallback" | "cache" | "idle") {
  if (source === "live") return "Live Intelligence"
  if (source === "idle") return "Intelligence Ready"
  return "Verified Market Context"
}

function provenanceMode(source?: "live" | "fallback" | "cache" | "idle") {
  if (source === "live" || source === "fallback" || source === "cache") return source
  return "unknown" as const
}

export default function HypothesisDetail() {
  const { id } = useParams()
  const { data, loading, error, retry } = useHypothesisDetail(id)
  const alphaScore = data ? buildAlphaScore(data) : null
  const evidenceGraph = data ? buildHypothesisEvidenceGraph(data) : null
  const [cmcSignals, setCmcSignals] = useState<{
    quotes: Quote[]
    categories: CategoryMetric[]
    technicals: TechnicalSummary[]
  }>({
    quotes: [],
    categories: [],
    technicals: [],
  })
  const [cmcLoading, setCmcLoading] = useState(false)
  const runtime = getCmcRuntimeStatus()
  const opportunityIntelligence = useMemo(() => {
    if (!data || !alphaScore) return null
    return buildOpportunityIntelligence(data, {
      alphaScore,
      quotes: cmcSignals.quotes,
      categories: cmcSignals.categories,
      technicals: cmcSignals.technicals,
    })
  }, [alphaScore, cmcSignals.categories, cmcSignals.quotes, cmcSignals.technicals, data])
  const provenance = data
    ? buildProvenanceSummary({
        title: data.title,
        lastUpdated: new Date().toISOString(),
        evidenceCount: data.evidence.length,
        confidence: data.confidence,
        relevance:
          data.evidence.length > 0
            ? Math.round(
                (data.evidence.reduce((acc, item) => acc + item.impactScore, 0) / data.evidence.length) *
                  100
              )
            : 0,
        quality: data.evidence.length >= 6 ? "Institutional grade" : "Emerging",
        historicalAnalogues: data.historicalAnalogues.map((item) => item.label),
        sources: [
          {
            label: "Quotes",
            used: data.relatedAssets.length > 0,
            freshness: runtime.quotes.lastSync ?? "Unavailable",
            reliability: "High",
            sourceType: "market",
            mode: provenanceMode(runtime.quotes.source),
            timestamp: runtime.quotes.lastSync ?? undefined,
            relevanceScore: data.confidence,
            confidenceScore: data.confidence,
            capability: "Quotes",
          },
          {
            label: "Technicals",
            used: data.evidence.some((item) => item.sourceType === "technicals"),
            freshness: runtime.technicals.lastSync ?? "Unavailable",
            reliability: "High",
            sourceType: "technical",
            mode: provenanceMode(runtime.technicals.source),
            timestamp: runtime.technicals.lastSync ?? undefined,
            relevanceScore: alphaScore?.breakdown.technicalConfirmation ?? 0,
            confidenceScore: alphaScore?.breakdown.technicalConfirmation ?? 0,
            capability: "Technicals",
          },
          {
            label: "News",
            used: data.evidence.some((item) => item.sourceType === "news"),
            freshness: runtime.news.lastSync ?? "Unavailable",
            reliability: "Medium",
            sourceType: "news",
            mode: provenanceMode(runtime.news.source),
            timestamp: runtime.news.lastSync ?? undefined,
            relevanceScore:
              data.evidence.length > 0
                ? Math.round(
                    (data.evidence.reduce((acc, item) => acc + item.impactScore, 0) / data.evidence.length) *
                      100
                  )
                : 0,
            confidenceScore: data.confidence,
            capability: "News",
          },
          {
            label: "Sentiment",
            used: data.evidence.some((item) => item.sourceType === "sentiment"),
            freshness: runtime.sentiment.lastSync ?? "Unavailable",
            reliability: "Medium",
            sourceType: "sentiment",
            mode: provenanceMode(runtime.sentiment.source),
            timestamp: runtime.sentiment.lastSync ?? undefined,
            relevanceScore: alphaScore?.breakdown.sentimentAlignment ?? 0,
            confidenceScore: alphaScore?.breakdown.sentimentAlignment ?? 0,
            capability: "Sentiment",
          },
          {
            label: "Narratives",
            used: data.relatedNarratives.length > 0,
            freshness: runtime.narratives.lastSync ?? "Unavailable",
            reliability: "High",
            sourceType: "narrative",
            mode: provenanceMode(runtime.narratives.source),
            timestamp: runtime.narratives.lastSync ?? undefined,
            relevanceScore: alphaScore?.breakdown.narrativeStrength ?? 0,
            confidenceScore: alphaScore?.breakdown.narrativeStrength ?? 0,
            capability: "Narratives",
          },
          {
            label: "Historical Analogues",
            used: data.historicalAnalogues.length > 0,
            freshness: "Daily",
            reliability: "High",
            sourceType: "historical",
            mode: "cache",
            timestamp: new Date().toISOString(),
            relevanceScore: alphaScore?.breakdown.historicalSimilarity ?? 0,
            confidenceScore: alphaScore?.breakdown.historicalSimilarity ?? 0,
            capability: "MCP readiness",
          },
        ],
      })
    : null

  useEffect(() => {
    let cancelled = false

    async function loadSignals() {
      if (!data) {
        setCmcSignals({ quotes: [], categories: [], technicals: [] })
        return
      }

      const symbols = data.relatedAssets.slice(0, 3)
      const normalizedSymbols = symbols.length > 0 ? symbols : ["BTC", "ETH", "SOL"]
      setCmcLoading(true)

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
      setCmcLoading(false)
    }

    loadSignals()

    return () => {
      cancelled = true
    }
  }, [data])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/hypotheses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <Badge variant={data?.origin === "mock" ? "secondary" : "success"}>
          {data?.origin === "mock" ? "Verified Market Context" : "Live Intelligence"}
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-4">
          <div className="h-[140px] animate-pulse rounded-xl border bg-background/30" />
          <div className="h-[220px] animate-pulse rounded-xl border bg-background/30" />
          <div className="h-[260px] animate-pulse rounded-xl border bg-background/30" />
        </div>
      ) : error ? (
        <Card className="bg-card/40">
          <CardContent className="p-5">
            <div className="text-sm font-medium">Failed to load hypothesis</div>
            <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
            <Button variant="outline" className="mt-3" onClick={retry}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <div>
            <div className="text-[11px] font-medium tracking-wide text-muted-foreground">
              Hypothesis #{data.id}
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
              {data.title}
            </h2>
            <p className="mt-2 max-w-3xl text-[13px] leading-snug text-muted-foreground">
              {data.description}
            </p>
          </div>

          <div className="grid gap-3 xl:grid-cols-12">
            <Card className="bg-card/40 xl:col-span-8">
              <CardHeader>
                <CardTitle>Thesis</CardTitle>
                <CardDescription>
                  Core thesis, market regime, and why the opportunity exists now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Confidence {data.confidence}%</Badge>
                  {alphaScore ? <AlphaScoreBadge score={alphaScore} /> : null}
                  <Badge variant="secondary">Risk {data.riskScore}</Badge>
                  <Badge variant="outline">Evidence {data.evidence.length}</Badge>
                  <Badge variant="secondary">{data.status}</Badge>
                  <Badge variant="outline">{data.expectedHorizon}</Badge>
                  <Badge variant="outline">{data.marketRegime}</Badge>
                </div>
                <div id="journey-why-now" className="rounded-xl border bg-background/35 p-4">
                  <div className="text-xs text-muted-foreground">Why now</div>
                  <div className="mt-1 text-sm text-foreground/90">{data.whyNow}</div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border bg-background/35 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">Market Context</div>
                      <Badge variant={runtime.quotes.source === "live" ? "success" : "secondary"}>
                        {intelligenceLabel(runtime.quotes.source)}
                      </Badge>
                    </div>
                    {cmcLoading ? (
                      <div className="mt-3 h-14 animate-pulse rounded-lg border bg-background/40" />
                    ) : cmcSignals.quotes.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {cmcSignals.quotes.slice(0, 3).map((quote) => (
                          <div key={quote.symbol} className="flex items-center justify-between gap-3 text-[13px]">
                            <span>{quote.symbol}</span>
                            <span className="text-muted-foreground">{currency(quote.priceUsd)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-[13px] leading-snug text-muted-foreground">
                        Verified market context remains available while live pricing refreshes.
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border bg-background/35 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">Category Rotation</div>
                      <Badge variant={runtime.categories.source === "live" ? "success" : "secondary"}>
                        {intelligenceLabel(runtime.categories.source)}
                      </Badge>
                    </div>
                    {cmcLoading ? (
                      <div className="mt-3 h-14 animate-pulse rounded-lg border bg-background/40" />
                    ) : cmcSignals.categories.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {cmcSignals.categories
                          .slice()
                          .sort((a, b) => b.rotationScore - a.rotationScore)
                          .slice(0, 3)
                          .map((category) => (
                            <div key={category.name} className="flex items-center justify-between gap-3 text-[13px]">
                              <span>{category.name}</span>
                              <span className="text-muted-foreground">Rotation {Math.round(category.rotationScore)}</span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-[13px] leading-snug text-muted-foreground">
                        Verified category rotation remains available for this thesis.
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl border bg-background/35 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-muted-foreground">Technical Confirmation</div>
                      <Badge variant={runtime.technicals.source === "live" ? "success" : "secondary"}>
                        {intelligenceLabel(runtime.technicals.source)}
                      </Badge>
                    </div>
                    {cmcLoading ? (
                      <div className="mt-3 h-14 animate-pulse rounded-lg border bg-background/40" />
                    ) : cmcSignals.technicals.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {cmcSignals.technicals.slice(0, 3).map((technical) => (
                          <div key={technical.symbol} className="flex items-center justify-between gap-3 text-[13px]">
                            <span>{technical.symbol}</span>
                            <span className="text-muted-foreground">
                              {technical.trend} · momentum {Math.round(technical.momentum * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-[13px] leading-snug text-muted-foreground">
                        Technical confirmation remains available through verified intelligence.
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.relatedNarratives.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                  {data.relatedAssets.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 xl:col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  Invalidating Conditions
                </CardTitle>
                <CardDescription>What would make this thesis wrong.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.invalidatingConditions.map((item) => (
                  <div key={item} className="rounded-xl border bg-background/35 p-4 text-sm text-foreground/90">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {opportunityIntelligence ? (
            <OpportunityIntelligencePanel
              intelligence={opportunityIntelligence}
              description="Research view of narrative exposure, market conviction, beneficiaries, and thesis risk."
            />
          ) : null}

          {alphaScore ? <AlphaScoreBreakdown result={alphaScore} /> : null}

          {evidenceGraph ? (
            <div id="journey-evidence-graph">
              <EvidenceGraph nodes={evidenceGraph.nodes} edges={evidenceGraph.edges} />
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-12">
            <Card className="bg-card/40 xl:col-span-7">
              <CardHeader>
                <CardTitle>Supporting Evidence</CardTitle>
                <CardDescription>
                  Each evidence item shows confidence, impact, and traceable reasoning.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.evidence.map((e) => (
                  <div key={e.id} className="rounded-xl border bg-background/35 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{e.sourceType}</Badge>
                      <Badge variant="secondary">{e.sourceName}</Badge>
                      <Badge variant="outline">
                        Confidence {Math.round(e.confidence * 100)}%
                      </Badge>
                      <Badge variant="outline">
                        Impact {Math.round(e.impactScore * 100)}%
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="text-sm text-muted-foreground">{e.reasoning}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/40 xl:col-span-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Narrative Readout
                </CardTitle>
                <CardDescription>
                  Strength, velocity, growth, and rotation behind the market thesis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.narrativeSignals.map((signal) => (
                  <div key={signal.name} className="rounded-xl border bg-background/35 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-display text-base font-semibold tracking-tight">
                        {signal.name}
                      </div>
                      <Badge>Strength {signal.strength}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      <div className="rounded-lg border bg-card/50 p-3">
                        <div className="text-xs text-muted-foreground">Velocity</div>
                        <div className="mt-1 text-sm">{signal.velocity}</div>
                      </div>
                      <div className="rounded-lg border bg-card/50 p-3">
                        <div className="text-xs text-muted-foreground">Growth</div>
                        <div className="mt-1 text-sm">{signal.growth}</div>
                      </div>
                      <div className="rounded-lg border bg-card/50 p-3">
                        <div className="text-xs text-muted-foreground">Rotation</div>
                        <div className="mt-1 text-sm">{signal.rotationScore}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {signal.interpretation}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card id="journey-historical-analogue" className="bg-card/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Historical Analogues
              </CardTitle>
              <CardDescription>
                Historical context and what happened next in comparable setups.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-2">
              {data.historicalAnalogues.map((item) => (
                <div key={item.id} className="rounded-xl border bg-background/35 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-base font-semibold tracking-tight">
                        {item.label}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Similarity {Math.round(item.similarity * 100)}%
                      </div>
                    </div>
                    <Badge variant="secondary">{Math.round(item.similarity * 100)}%</Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="text-xs text-muted-foreground">Context</div>
                  <div className="mt-1 text-sm text-foreground/90">{item.context}</div>
                  <div className="mt-4 text-xs text-muted-foreground">What happened next</div>
                  <div className="mt-1 text-sm text-foreground/90">
                    {item.whatHappenedNext}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {provenance ? <ProvenancePanel summary={provenance} /> : null}
        </>
      ) : null}
    </div>
  )
}

