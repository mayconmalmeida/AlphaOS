import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  GitBranchPlus,
  History,
  Network,
  Sparkles,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { AlphaScoreBadge } from "@/components/alpha/AlphaScoreBadge"
import { AlphaScoreBreakdown } from "@/components/alpha/AlphaScoreBreakdown"
import { EvidenceGraph } from "@/components/evidence/EvidenceGraph"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  buildGuidedJourneyHref,
  buildGuidedJourneySearch,
  getGuidedJourneyEstimatedTime,
  getGuidedJourneyMeta,
  getGuidedJourneyTotalSteps,
  parseGuidedJourney,
  type GuidedJourneyStep,
} from "@/lib/guidedJourney"
import { buildAlphaScore, type AlphaScoreResult } from "@/services/alphaScoreService"
import { buildHypothesisEvidenceGraph } from "@/services/evidence/evidenceGraph"
import { hypothesesService, type Hypothesis, type HypothesisDetail } from "@/services/hypotheses"
import { marketReplayService, type ReplayScenario } from "@/services/marketReplay"
import { researchService, type ResearchReport } from "@/services/research"
import { strategiesService, type StrategyCandidate } from "@/services/strategies"

type JourneyData = {
  hypotheses: Hypothesis[]
  detail: HypothesisDetail
  strategy: StrategyCandidate | null
  replay: ReplayScenario | null
  report: ResearchReport | null
}

const STEP_KICKERS: Record<GuidedJourneyStep, string> = {
  1: "What AlphaOS discovered.",
  2: "Why this opportunity exists right now.",
  3: "How AlphaOS reached this conclusion.",
  4: "When this happened before.",
  5: "What happened after a similar setup.",
  6: "How AlphaOS would investigate this opportunity.",
  7: "How AlphaOS converts intelligence into actionable research.",
}

function normalizeStep(value: number): GuidedJourneyStep {
  if (value <= 1) return 1
  if (value >= 7) return 7
  return value as GuidedJourneyStep
}

function countBySource(detail: HypothesisDetail) {
  return detail.evidence.reduce<Record<string, number>>((acc, item) => {
    acc[item.sourceType] = (acc[item.sourceType] ?? 0) + 1
    return acc
  }, {})
}

function pickBestHypothesis(hypotheses: Hypothesis[]) {
  return hypotheses.find((item) => item.status !== "closed") ?? hypotheses[0] ?? null
}

function pickBestReport(reports: ResearchReport[], detail: HypothesisDetail) {
  const titleNeedle = detail.title.toLowerCase().split(" ").slice(0, 2).join(" ")
  return (
    reports.find((report) => report.title.toLowerCase().includes(titleNeedle)) ??
    reports.find((report) => report.tags.some((tag) => detail.relatedNarratives.includes(tag))) ??
    reports[0] ??
    null
  )
}

function JourneyProgress({
  step,
  hypothesisId,
  onFinish,
}: {
  step: GuidedJourneyStep
  hypothesisId: string
  onFinish: () => void
}) {
  const navigate = useNavigate()
  const meta = getGuidedJourneyMeta(step)
  const total = getGuidedJourneyTotalSteps()
  const percent = Math.round((step / total) * 100)

  return (
    <div className="sticky top-4 z-20 rounded-2xl border bg-background/80 p-4 shadow-glass-sm backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Guided Journey</Badge>
            <Badge variant="secondary">
              Step {step} of {total}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {getGuidedJourneyEstimatedTime(step)}
            </Badge>
          </div>
          <div className="mt-3 font-display text-2xl font-semibold tracking-tight">{meta.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{meta.matters}</div>
          <div className="mt-4 h-2 overflow-hidden rounded-full border bg-background/30">
            <div className="h-full bg-primary/80 transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/dashboard">Exit Journey</Link>
          </Button>
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() =>
                navigate(
                  buildGuidedJourneyHref({
                    step: normalizeStep(step - 1),
                    hypothesisId,
                  })
                )
              }
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : null}
          {step < total ? (
            <Button
              onClick={() =>
                navigate(
                  buildGuidedJourneyHref({
                    step: normalizeStep(step + 1),
                    hypothesisId,
                  })
                )
              }
              className="gap-2"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onFinish} className="gap-2">
              Finish Journey
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GuidedJourney() {
  const location = useLocation()
  const navigate = useNavigate()
  const parsed = parseGuidedJourney(location.search)
  const step = parsed.active ? parsed.step : 1

  const [data, setData] = useState<JourneyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFinal, setShowFinal] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const listRes = await hypothesesService.list({ status: "all" })
      if (listRes.ok === false) {
        if (!cancelled) {
          setError(listRes.error.message)
          setLoading(false)
        }
        return
      }

      const best = parsed.hypothesisId
        ? listRes.data.find((item) => item.id === parsed.hypothesisId) ?? pickBestHypothesis(listRes.data)
        : pickBestHypothesis(listRes.data)

      if (!best) {
        if (!cancelled) {
          setError("No opportunities are available for the guided journey.")
          setLoading(false)
        }
        return
      }

      const detailRes = await hypothesesService.getById(best.id)
      if (detailRes.ok === false) {
        if (!cancelled) {
          setError(detailRes.error.message)
          setLoading(false)
        }
        return
      }

      const detail = detailRes.data
      const [strategiesRes, replayRes, reportsRes] = await Promise.all([
        strategiesService.listCandidates({ hypothesisId: detail.id, status: "all" }),
        marketReplayService.listScenarios(),
        researchService.listReports(),
      ])

      let strategy =
        strategiesRes.ok && strategiesRes.data.length > 0 ? strategiesRes.data[0] : null

      if (!strategy) {
        const generatedStrategyRes = await strategiesService.generateFromHypothesis({
          hypothesisId: detail.id,
          variationCount: 10,
        })
        strategy =
          generatedStrategyRes.ok && generatedStrategyRes.data.length > 0
            ? generatedStrategyRes.data[0]
            : null
      }

      let report =
        reportsRes.ok && reportsRes.data.length > 0 ? pickBestReport(reportsRes.data, detail) : null

      if (!report) {
        const generatedReportRes = await researchService.generateReport({ hypothesisId: detail.id })
        report = generatedReportRes.ok ? generatedReportRes.data : null
      }

      if (!cancelled) {
        setData({
          hypotheses: listRes.data,
          detail,
          strategy,
          replay: replayRes.ok ? replayRes.data[0] ?? null : null,
          report,
        })
        setLoading(false)

        if (!parsed.active || !parsed.hypothesisId) {
          navigate(
            `/journey${buildGuidedJourneySearch({
              step,
              hypothesisId: detail.id,
            })}`,
            { replace: true }
          )
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [navigate, parsed.active, parsed.hypothesisId, step])

  const alphaScore = useMemo<AlphaScoreResult | null>(() => {
    return data ? buildAlphaScore(data.detail) : null
  }, [data])

  const evidenceGraph = useMemo(() => {
    return data ? buildHypothesisEvidenceGraph(data.detail) : null
  }, [data])

  const sourceBreakdown = useMemo(() => {
    return data ? countBySource(data.detail) : {}
  }, [data])

  const primaryAnalogue = data?.detail.historicalAnalogues[0] ?? null
  const primaryReplay = data?.replay
  const primaryStrategy = data?.strategy
  const primaryReport = data?.report

  const finalMetrics = useMemo(() => {
    if (!data) {
      return {
        opportunities: 0,
        evidenceSources: 0,
        narratives: 0,
        analogues: 0,
        reports: 0,
      }
    }

    return {
      opportunities: data.hypotheses.length,
      evidenceSources: data.detail.evidence.length,
      narratives: data.detail.relatedNarratives.length,
      analogues: data.detail.historicalAnalogues.length,
      reports: primaryReport ? 1 : 0,
    }
  }, [data, primaryReport])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg border bg-card/70 p-1 shadow-glass-sm">
              <img src="/AlphaOS_Logo.png" alt="AlphaOS" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight">AlphaOS</div>
              <div className="text-sm text-muted-foreground">
                The Autonomous Market Research Agent
              </div>
            </div>
          </div>
          <Badge variant="outline">Powered by CoinMarketCap Intelligence</Badge>
        </div>

        {data?.detail ? (
          <JourneyProgress
            step={step}
            hypothesisId={data.detail.id}
            onFinish={() => setShowFinal(true)}
          />
        ) : null}

        {loading ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="h-[620px] animate-pulse rounded-2xl border bg-background/30" />
            <div className="h-[620px] animate-pulse rounded-2xl border bg-background/30" />
          </div>
        ) : error ? (
          <Card className="mt-8 bg-card/40">
            <CardContent className="space-y-4 p-6">
              <div className="text-base font-medium">Failed to load the guided journey</div>
              <div className="text-sm text-muted-foreground">{error}</div>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()}>Retry</Button>
                <Button asChild variant="outline">
                  <Link to="/dashboard">Return to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : data && alphaScore ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-6">
              <Card className="bg-card/40">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge>{getGuidedJourneyMeta(step).title}</Badge>
                    <Badge variant="secondary">{STEP_KICKERS[step]}</Badge>
                  </div>
                  <CardTitle className="font-display text-3xl tracking-tight">
                    {step === 1
                      ? data.detail.title
                      : step === 2
                        ? "Why this thesis exists now"
                        : step === 3
                          ? "Evidence behind the conviction"
                          : step === 4
                            ? "Historical pattern match"
                            : step === 5
                              ? "Replay the analogue"
                              : step === 6
                                ? "Best strategy candidate"
                                : "Research report output"}
                  </CardTitle>
                  <CardDescription>{data.detail.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {step === 1 ? (
                    <>
                      <div className="grid gap-3 md:grid-cols-5">
                        <div className="rounded-xl border bg-background/35 p-4 md:col-span-2">
                          <div className="text-xs text-muted-foreground">Opportunity Name</div>
                          <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                            {data.detail.title}
                          </div>
                        </div>
                        <div className="rounded-xl border bg-background/35 p-4">
                          <div className="text-xs text-muted-foreground">Alpha Score</div>
                          <div className="mt-2">
                            <AlphaScoreBadge score={alphaScore} />
                          </div>
                        </div>
                        <div className="rounded-xl border bg-background/35 p-4">
                          <div className="text-xs text-muted-foreground">Confidence</div>
                          <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                            {data.detail.confidence}%
                          </div>
                        </div>
                        <div className="rounded-xl border bg-background/35 p-4">
                          <div className="text-xs text-muted-foreground">Risk</div>
                          <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                            {data.detail.riskScore}
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border bg-background/35 p-5">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                          What AlphaOS discovered
                        </div>
                        <div className="mt-3 text-sm leading-6 text-foreground/90">
                          {data.detail.description}
                        </div>
                      </div>
                    </>
                  ) : null}

                  {step === 2 ? (
                    <>
                      <div className="rounded-xl border bg-background/35 p-5">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                          Why Now
                        </div>
                        <div className="mt-3 text-sm leading-6 text-foreground/90">
                          {data.detail.whyNow}
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        {data.detail.narrativeSignals.slice(0, 3).map((signal) => (
                          <div key={signal.name} className="rounded-xl border bg-background/35 p-4">
                            <div className="text-sm font-medium">{signal.name}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="outline">Strength {signal.strength}</Badge>
                              <Badge variant="outline">Velocity {signal.velocity}</Badge>
                              <Badge variant="outline">Growth {signal.growth}</Badge>
                            </div>
                            <div className="mt-3 text-sm text-muted-foreground">
                              {signal.interpretation}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl border bg-background/35 p-5">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">
                          Market Context
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge>{data.detail.marketRegime}</Badge>
                          <Badge variant="secondary">{data.detail.expectedHorizon}</Badge>
                          <Badge variant="outline">{data.detail.relatedNarratives.join(" · ")}</Badge>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {step === 3 && evidenceGraph ? (
                    <>
                      <EvidenceGraph
                        nodes={evidenceGraph.nodes}
                        edges={evidenceGraph.edges}
                        title="Evidence Graph"
                        description="Interactive evidence, narrative, and historical relationships supporting the thesis."
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border bg-background/35 p-4">
                          <div className="text-xs text-muted-foreground">Evidence Count</div>
                          <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                            {data.detail.evidence.length}
                          </div>
                        </div>
                        <div className="rounded-xl border bg-background/35 p-4">
                          <div className="text-xs text-muted-foreground">Source Breakdown</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(sourceBreakdown).map(([key, value]) => (
                              <Badge key={key} variant="secondary">
                                {key} {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {step === 4 ? (
                    primaryAnalogue ? (
                      <div className="grid gap-4 md:grid-cols-[0.45fr_0.55fr]">
                        <div className="rounded-xl border bg-background/35 p-5">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Similar market period
                          </div>
                          <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                            {primaryAnalogue.label}
                          </div>
                          <div className="mt-3">
                            <Badge>Similarity {Math.round(primaryAnalogue.similarity * 100)}%</Badge>
                          </div>
                        </div>
                        <div className="rounded-xl border bg-background/35 p-5">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Historical context
                          </div>
                          <div className="mt-3 text-sm leading-6 text-foreground/90">
                            {primaryAnalogue.context}
                          </div>
                          <Separator className="my-4" />
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            What happened next
                          </div>
                          <div className="mt-3 text-sm leading-6 text-foreground/90">
                            {primaryAnalogue.whatHappenedNext}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border bg-background/35 p-5 text-sm text-muted-foreground">
                        No historical analogues are available for this opportunity yet.
                      </div>
                    )
                  ) : null}

                  {step === 5 ? (
                    primaryReplay ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-[0.45fr_0.55fr]">
                          <div className="rounded-xl border bg-background/35 p-5">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">
                              Replay snapshot
                            </div>
                            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                              {primaryReplay.title}
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              {primaryReplay.dateRange}
                            </div>
                            <div className="mt-4 text-sm leading-6 text-foreground/90">
                              {primaryReplay.context}
                            </div>
                          </div>
                          <div className="rounded-xl border bg-background/35 p-5">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">
                              What happened next
                            </div>
                            <div className="mt-3 grid gap-3">
                              {primaryReplay.followThrough.slice(0, 3).map((item) => (
                                <div key={item.horizon} className="rounded-lg border bg-card/40 p-4">
                                  <div className="text-sm font-medium">{item.horizon}</div>
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    {item.whatHappenedNext}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border bg-background/35 p-5">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Winning narratives
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {primaryReplay.followThrough[0]?.winningNarratives.map((item) => (
                              <Badge key={item}>{item}</Badge>
                            )) ?? <Badge variant="secondary">No winners tracked</Badge>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border bg-background/35 p-5 text-sm text-muted-foreground">
                        No replay scenario is available right now.
                      </div>
                    )
                  ) : null}

                  {step === 6 ? (
                    primaryStrategy ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-[0.5fr_0.5fr]">
                          <div className="rounded-xl border bg-background/35 p-5">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge>Best Strategy</Badge>
                              <Badge variant="secondary">{primaryStrategy.status}</Badge>
                              <Badge variant="outline">{primaryStrategy.spec.timeHorizon}</Badge>
                            </div>
                            <div className="mt-3 font-display text-2xl font-semibold tracking-tight">
                              {primaryStrategy.spec.strategyName}
                            </div>
                            <div className="mt-3 text-sm leading-6 text-foreground/90">
                              {primaryStrategy.spec.objective}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Badge>Score {primaryStrategy.score}</Badge>
                              <Badge variant="secondary">
                                Expected Horizon {primaryStrategy.spec.timeHorizon}
                              </Badge>
                            </div>
                          </div>
                          <div className="rounded-xl border bg-background/35 p-5">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">
                              Risk controls
                            </div>
                            <div className="mt-3 space-y-2 text-sm text-foreground/90">
                              {primaryStrategy.spec.riskControls.slice(0, 4).map((item) => (
                                <div key={item} className="rounded-lg border bg-card/40 px-3 py-2">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border bg-background/35 p-5 text-sm text-muted-foreground">
                          Strategy candidates are research artifacts for evaluation, not financial advice.
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border bg-background/35 p-5 text-sm text-muted-foreground">
                        No strategy candidate is available yet for this opportunity.
                      </div>
                    )
                  ) : null}

                  {step === 7 ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border bg-background/35 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>
                            <FileText className="mr-1 h-3.5 w-3.5" />
                            Research Report
                          </Badge>
                          {primaryReport ? <Badge variant="secondary">{primaryReport.reportType}</Badge> : null}
                        </div>
                        <div className="mt-3 font-display text-2xl font-semibold tracking-tight">
                          {primaryReport?.title ?? `${data.detail.title} Research Report`}
                        </div>
                        <div className="mt-3 text-sm leading-6 text-foreground/90">
                          {primaryReport?.executiveSummary ?? data.detail.description}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border bg-background/35 p-5">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Evidence Used
                          </div>
                          <div className="mt-3 space-y-2 text-sm text-foreground/90">
                            {data.detail.evidence.slice(0, 4).map((item) => (
                              <div key={item.id} className="rounded-lg border bg-card/40 px-3 py-2">
                                {item.sourceName}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl border bg-background/35 p-5">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Narratives Used
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {data.detail.relatedNarratives.map((item) => (
                              <Badge key={item} variant="secondary">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl border bg-background/35 p-5">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground">
                            Research Generated
                          </div>
                          <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                            {primaryReport?.sections.length ?? 0}
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            structured sections ready for a team handoff
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card/40">
                <CardHeader>
                  <CardTitle>Journey Snapshot</CardTitle>
                  <CardDescription>The strongest argument on one screen.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl border bg-background/35 p-4">
                    <div className="text-xs text-muted-foreground">Opportunity</div>
                    <div className="mt-2 font-display text-xl font-semibold tracking-tight">
                      {data.detail.title}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-xl border bg-background/35 p-4">
                      <div className="text-xs text-muted-foreground">Alpha Score</div>
                      <div className="mt-2">
                        <AlphaScoreBadge score={alphaScore} />
                      </div>
                    </div>
                    <div className="rounded-xl border bg-background/35 p-4">
                      <div className="text-xs text-muted-foreground">Evidence</div>
                      <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                        {data.detail.evidence.length}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-background/35 p-4">
                      <div className="text-xs text-muted-foreground">Historical Analogues</div>
                      <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                        {data.detail.historicalAnalogues.length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {step <= 2 ? <AlphaScoreBreakdown result={alphaScore} /> : null}

              <Card className="bg-card/40">
                <CardHeader>
                  <CardTitle>Journey Map</CardTitle>
                  <CardDescription>One linear story from discovery to research.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(Array.from({ length: 7 }, (_, idx) => normalizeStep(idx + 1)) as GuidedJourneyStep[]).map(
                    (item) => {
                      const meta = getGuidedJourneyMeta(item)
                      const active = item === step
                      return (
                        <div
                          key={item}
                          className={`rounded-xl border px-4 py-3 text-sm ${
                            active ? "border-primary bg-primary/10" : "bg-background/35"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span>
                              Step {item} · {meta.title}
                            </span>
                            {active ? <Badge variant="secondary">Current</Badge> : null}
                          </div>
                        </div>
                      )
                    }
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>

      {showFinal && data ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-6 backdrop-blur">
          <Card className="w-full max-w-4xl bg-card/70 shadow-glass-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>AlphaOS</Badge>
                <Badge variant="secondary">The Autonomous Market Research Agent</Badge>
                <Badge variant="outline">Powered by CoinMarketCap Intelligence</Badge>
              </div>
              <CardTitle className="font-display text-3xl tracking-tight">
                AlphaOS found the opportunity, explained the timing, proved the thesis, compared it with history, structured a strategy, and produced research.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="rounded-xl border bg-background/35 p-4">
                  <div className="text-xs text-muted-foreground">Alpha Opportunities Generated</div>
                  <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                    {finalMetrics.opportunities}
                  </div>
                </div>
                <div className="rounded-xl border bg-background/35 p-4">
                  <div className="text-xs text-muted-foreground">Evidence Sources Analyzed</div>
                  <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                    {finalMetrics.evidenceSources}
                  </div>
                </div>
                <div className="rounded-xl border bg-background/35 p-4">
                  <div className="text-xs text-muted-foreground">Narratives Tracked</div>
                  <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                    {finalMetrics.narratives}
                  </div>
                </div>
                <div className="rounded-xl border bg-background/35 p-4">
                  <div className="text-xs text-muted-foreground">Historical Analogues Found</div>
                  <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                    {finalMetrics.analogues}
                  </div>
                </div>
                <div className="rounded-xl border bg-background/35 p-4">
                  <div className="text-xs text-muted-foreground">Research Reports Generated</div>
                  <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                    {finalMetrics.reports}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-background/35 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Opportunity
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">{data.detail.title}</div>
                </div>
                <div className="rounded-xl border bg-background/35 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Network className="h-4 w-4 text-primary" />
                    Evidence
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {data.detail.evidence.length} evidence sources connected into one thesis.
                  </div>
                </div>
                <div className="rounded-xl border bg-background/35 p-5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <History className="h-4 w-4 text-primary" />
                    Memory
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {data.detail.historicalAnalogues.length} historical matches used to ground the narrative.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => setShowFinal(false)}>
                  Close
                </Button>
                <Button asChild>
                  <Link to="/dashboard">Return to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

