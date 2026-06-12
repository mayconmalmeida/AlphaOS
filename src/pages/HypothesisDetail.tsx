import { useEffect } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { ChevronLeft, ShieldAlert, Sparkles, TrendingUp } from "lucide-react"

import { AlphaScoreBadge } from "@/components/alpha/AlphaScoreBadge"
import { AlphaScoreBreakdown } from "@/components/alpha/AlphaScoreBreakdown"
import { EvidenceGraph } from "@/components/evidence/EvidenceGraph"
import { ProvenancePanel } from "@/components/evidence/ProvenancePanel"
import { GuidedJourneyBanner } from "@/components/journey/GuidedJourneyBanner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useHypothesisDetail } from "@/hooks/useHypothesisDetail"
import { parseGuidedJourney } from "@/lib/guidedJourney"
import { buildAlphaScore } from "@/services/alphaScoreService"
import {
  buildHypothesisEvidenceGraph,
  buildProvenanceSummary,
} from "@/services/evidence/evidenceGraph"

export default function HypothesisDetail() {
  const { id } = useParams()
  const location = useLocation()
  const journey = parseGuidedJourney(location.search)
  const { data, loading, error, retry } = useHypothesisDetail(id)
  const alphaScore = data ? buildAlphaScore(data) : null
  const evidenceGraph = data ? buildHypothesisEvidenceGraph(data) : null
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
            freshness: "1h",
            reliability: "High",
            sourceType: "market",
            mode: data.origin === "generated" ? "live" : "fallback",
            timestamp: new Date().toISOString(),
            relevanceScore: data.confidence,
            confidenceScore: data.confidence,
            capability: "Quotes",
          },
          {
            label: "Technicals",
            used: data.evidence.some((item) => item.sourceType === "technicals"),
            freshness: "2h",
            reliability: "High",
            sourceType: "technical",
            mode: data.origin === "generated" ? "live" : "fallback",
            timestamp: new Date().toISOString(),
            relevanceScore: alphaScore?.breakdown.technicalConfirmation ?? 0,
            confidenceScore: alphaScore?.breakdown.technicalConfirmation ?? 0,
            capability: "Technicals",
          },
          {
            label: "News",
            used: data.evidence.some((item) => item.sourceType === "news"),
            freshness: "30m",
            reliability: "Medium",
            sourceType: "news",
            mode: data.origin === "generated" ? "live" : "fallback",
            timestamp: new Date().toISOString(),
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
            freshness: "15m",
            reliability: "Medium",
            sourceType: "sentiment",
            mode: data.origin === "generated" ? "live" : "fallback",
            timestamp: new Date().toISOString(),
            relevanceScore: alphaScore?.breakdown.sentimentAlignment ?? 0,
            confidenceScore: alphaScore?.breakdown.sentimentAlignment ?? 0,
            capability: "Sentiment",
          },
          {
            label: "Narratives",
            used: data.relatedNarratives.length > 0,
            freshness: "1h",
            reliability: "High",
            sourceType: "narrative",
            mode: data.origin === "generated" ? "live" : "fallback",
            timestamp: new Date().toISOString(),
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
    if (!journey.active) return
    if (!journey.step) return

    const targetId =
      journey.step === 2
        ? "journey-why-now"
        : journey.step === 3
          ? "journey-evidence-graph"
          : journey.step === 4
            ? "journey-historical-analogue"
            : null

    if (!targetId) return
    const el = document.getElementById(targetId)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [journey.active, journey.step])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/hypotheses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
        <Badge variant="secondary">
          {data?.origin === "generated" ? "Generated" : "Fallback Intelligence"}
        </Badge>
      </div>

      {journey.active ? <GuidedJourneyBanner hypothesisId={data?.id ?? journey.hypothesisId} /> : null}

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
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Hypothesis #{data.id}
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              {data.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              {data.description}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="bg-card/40 lg:col-span-8">
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

            <Card className="bg-card/40 lg:col-span-4">
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

          {alphaScore ? <AlphaScoreBreakdown result={alphaScore} /> : null}

          {evidenceGraph ? (
            <div id="journey-evidence-graph">
              <EvidenceGraph nodes={evidenceGraph.nodes} edges={evidenceGraph.edges} />
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="bg-card/40 lg:col-span-7">
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

            <Card className="bg-card/40 lg:col-span-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Narrative Signals
                </CardTitle>
                <CardDescription>
                  Strength, velocity, growth, and rotation behind the thesis.
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
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
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
            <CardContent className="grid gap-4 lg:grid-cols-2">
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

