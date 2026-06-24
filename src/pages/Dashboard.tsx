import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  History,
  LineChart,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
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
import { useHypothesisDetail } from "@/hooks/useHypothesisDetail"
import { isErr } from "@/lib/api"
import { buildAlphaScore } from "@/services/alphaScoreService"
import { cmcServices } from "@/services/cmc"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useNarrativeIntelligenceData } from "@/hooks/useNarrativeIntelligenceData"
import type { CategoryMetric, Quote, TechnicalSummary } from "@/services/cmc/types"
import type { Hypothesis, HypothesisDetail } from "@/services/hypotheses"
import { buildOpportunityRadar } from "@/services/opportunityIntelligence"

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/30 px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-base font-semibold tracking-tight">{value}</div>
    </div>
  )
}

function EmptyMetric() {
  return <div className="h-[54px] animate-pulse rounded-lg border bg-background/30" />
}

function detailFromHypothesis(hypothesis: Hypothesis | null, detail: HypothesisDetail | null) {
  if (detail) return detail
  if (!hypothesis) return null

  return {
    ...hypothesis,
    evidence: [],
    narrativeSignals: [],
    historicalAnalogues: [],
  } satisfies HypothesisDetail
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data, loading } = useDashboardData()
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
  const { data: bestDetail } = useHypothesisDetail(best?.id)
  const hero = useMemo(() => detailFromHypothesis(best, bestDetail), [best, bestDetail])
  const { data: narratives, loading: narrativesLoading } = useNarrativeIntelligenceData()
  const opportunityRadar = useMemo(
    () =>
      buildOpportunityRadar(hypotheses, {
        quotes: cmcSignals.quotes,
        categories: cmcSignals.categories,
        technicals: cmcSignals.technicals,
      }).slice(0, 5),
    [cmcSignals.categories, cmcSignals.quotes, cmcSignals.technicals, hypotheses]
  )
  const alphaScore = useMemo(() => (hero ? buildAlphaScore(hero) : null), [hero])
  const otherOpportunities = useMemo(
    () => hypotheses.filter((item) => item.id !== best?.id).slice(0, 2),
    [best?.id, hypotheses]
  )
  const leadingAnalogue = hero?.historicalAnalogues[0] ?? null
  const leadingNarrative = hero?.narrativeSignals[0] ?? null
  const leadingTechnical = cmcSignals.technicals[0] ?? null
  const leadingCategory = cmcSignals.categories
    .slice()
    .sort((a, b) => b.rotationScore - a.rotationScore)[0]

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

  if (!hero || !alphaScore) {
    return (
      <div className="space-y-4">
        <div className="h-[220px] animate-pulse rounded-xl border bg-card/40" />
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="h-[120px] animate-pulse rounded-xl border bg-card/40" />
          <div className="h-[120px] animate-pulse rounded-xl border bg-card/40" />
          <div className="h-[120px] animate-pulse rounded-xl border bg-card/40" />
        </div>
      </div>
    )
  }

  const evidenceCards = [
    {
      icon: Radar,
      label: "Narrative Strength",
      value: leadingNarrative ? `${Math.round(leadingNarrative.strength)} / 100` : leadingCategory?.name ?? "Strong",
      detail: leadingNarrative?.interpretation ?? "Category and narrative rotation are aligned with the opportunity.",
    },
    {
      icon: LineChart,
      label: "Technical Confirmation",
      value: leadingTechnical?.trend ?? "Confirmed",
      detail: leadingTechnical
        ? `${leadingTechnical.symbol} confirms the setup with current market structure.`
        : "Price structure supports continued investigation.",
    },
    {
      icon: BarChart3,
      label: "Sentiment Momentum",
      value: data ? `${Math.round(data.marketPulse.sentimentScore * 100)}%` : "Elevated",
      detail: "Sentiment and news momentum support the current research path.",
    },
    {
      icon: History,
      label: "Historical Similarity",
      value: leadingAnalogue ? `${Math.round(leadingAnalogue.similarity)}%` : "Aligned",
      detail: leadingAnalogue?.context ?? "Market memory shows comparable conditions worth exploring.",
    },
    {
      icon: ShieldCheck,
      label: "Market Regime",
      value: hero.marketRegime,
      detail: "Regime context supports a structured, evidence-led review before strategy simulation.",
    },
  ]

  const keyEvidence =
    hero.evidence.length > 0
      ? hero.evidence.slice(0, 2).map((item) => item.reasoning)
      : [
          `${hero.evidenceCount} evidence points support this opportunity.`,
          hero.relatedNarratives[0]
            ? `${hero.relatedNarratives[0]} remains central to the current thesis.`
            : "Market context and timing support continued research.",
        ]
  const mainRisks =
    hero.invalidatingConditions.length > 0
      ? hero.invalidatingConditions.slice(0, 2)
      : ["Thesis weakens if narrative momentum fades.", "Risk increases if market regime deteriorates."]

  return (
    <div className="space-y-4">
      <section className="rounded-xl border bg-card/45 p-4 shadow-glass-sm md:p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Today&apos;s Best Opportunity</Badge>
              <Badge variant="success">Live Intelligence</Badge>
            </div>
            <h1 className="mt-4 max-w-4xl font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              {hero.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              {hero.description}
            </p>

            <div className="mt-5 rounded-xl border bg-background/35 p-4">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Why now</div>
              <p className="mt-2 text-sm leading-6">{hero.whyNow}</p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/journey" className="flex items-center gap-2">
                  Start Guided Journey
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link to="/research" className="flex items-center gap-2">
                  View Research Report
                  <FileText className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid content-start gap-3 rounded-xl border bg-background/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] text-muted-foreground">Alpha Score</div>
                <div className="mt-1">
                  <AlphaScoreBadge score={alphaScore} />
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Confidence" value={`${hero.confidence}%`} />
              <Metric label="Horizon" value={hero.expectedHorizon} />
              <Metric label="Risk Level" value={`${hero.riskScore}`} />
              <Metric label="Evidence" value={`${hero.evidenceCount}`} />
            </div>
            <div className="rounded-lg border bg-card/45 px-3 py-2">
              <div className="text-[11px] text-muted-foreground">Potential beneficiaries</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(hero.relatedAssets.length > 0 ? hero.relatedAssets : ["BTC", "ETH", "SOL"]).slice(0, 4).map((asset) => (
                  <Badge key={asset} variant="secondary">
                    {asset}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle>Why AlphaOS Identified This Opportunity</CardTitle>
            <CardDescription>Evidence cards explain why this opportunity matters right now.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {evidenceCards.map((item) => (
              <div key={item.label} className="rounded-xl border bg-background/30 p-3">
                <item.icon className="h-4 w-4 text-primary" />
                <div className="mt-3 text-[11px] text-muted-foreground">{item.label}</div>
                <div className="mt-1 font-display text-base font-semibold tracking-tight">{item.value}</div>
                <p className="mt-2 text-[13px] leading-snug text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/40">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Current Market Regime</CardTitle>
              <CardDescription>Compact read on conditions and risk.</CardDescription>
            </div>
            <Badge variant="secondary">{hero.marketRegime}</Badge>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <Metric label="Confidence" value={`${hero.confidence}%`} />
            <Metric label="Risk Level" value={hero.riskScore <= 35 ? "Moderate" : "Elevated"} />
            <Metric
              label="Narrative Strength"
              value={leadingNarrative ? `${Math.round(leadingNarrative.strength)} / 100` : "Strong"}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-12">
        <Card className="bg-card/40 lg:col-span-5">
          <CardHeader>
            <CardTitle>Historical Match</CardTitle>
            <CardDescription>Market memory preview for the current opportunity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border bg-background/30 p-3">
              <div className="text-[11px] text-muted-foreground">Most Similar Environment</div>
              <div className="mt-1 font-display text-lg font-semibold tracking-tight">
                {leadingAnalogue?.label ?? `${hero.relatedNarratives[0] ?? hero.marketRegime} cycle`}
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Metric label="Similarity" value={leadingAnalogue ? `${Math.round(leadingAnalogue.similarity)}%` : "High"} />
              <Metric label="Regime" value={hero.marketRegime} />
            </div>
            <div className="rounded-xl border bg-background/30 p-3">
              <div className="text-[11px] text-muted-foreground">What happened next</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {leadingAnalogue?.whatHappenedNext ??
                  "Comparable environments rewarded disciplined research, narrative confirmation, and staged strategy simulation."}
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/market-memory" className="flex items-center gap-2">
                Explore Historical Analogue
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/40 lg:col-span-7">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Research Snapshot</CardTitle>
              <CardDescription>Institutional research output distilled from the opportunity.</CardDescription>
            </div>
            <BookOpenCheck className="mt-1 h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-background/30 p-3 md:col-span-2">
              <div className="text-[11px] text-muted-foreground">Opportunity Summary</div>
              <p className="mt-2 text-sm leading-6">{hero.description}</p>
            </div>
            <div className="rounded-xl border bg-background/30 p-3">
              <div className="text-[11px] text-muted-foreground">Key Evidence</div>
              <div className="mt-2 space-y-2">
                {keyEvidence.map((item) => (
                  <div key={item} className="flex gap-2 text-sm leading-snug text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border bg-background/30 p-3">
              <div className="text-[11px] text-muted-foreground">Main Risks</div>
              <div className="mt-2 space-y-2">
                {mainRisks.map((item) => (
                  <div key={item} className="flex gap-2 text-sm leading-snug text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border bg-background/30 p-3">
              <div className="text-[11px] text-muted-foreground">Potential Beneficiaries</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hero.relatedAssets.slice(0, 6).map((asset) => (
                  <Badge key={asset} variant="secondary">
                    {asset}
                  </Badge>
                ))}
              </div>
            </div>
            <Button asChild className="h-auto min-h-10 w-full self-stretch md:justify-self-end">
              <Link to="/research" className="flex items-center gap-2">
                Open Full Research Report
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="bg-card/40">
          <CardHeader>
            <CardTitle>Other Emerging Opportunities</CardTitle>
            <CardDescription>Secondary setups for later exploration.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {otherOpportunities.map((o) => {
              const score = buildAlphaScore({
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-display text-[15px] font-semibold tracking-tight">{o.title}</div>
                      <div className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">{o.whyNow}</div>
                    </div>
                    <AlphaScoreBadge score={score} compact />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge>Confidence {o.confidence}%</Badge>
                    <Badge variant="outline">Horizon {o.expectedHorizon}</Badge>
                    {o.relatedNarratives[0] ? <Badge variant="secondary">{o.relatedNarratives[0]}</Badge> : null}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="bg-card/40">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Market Pulse</CardTitle>
              <CardDescription>CoinMarketCap intelligence feeding the research workflow.</CardDescription>
            </div>
            <Badge className="mt-0.5" variant="success">
              Live Intelligence
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <EmptyMetric />
                <EmptyMetric />
                <EmptyMetric />
                <EmptyMetric />
              </div>
            ) : data ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Metric label="BTC Dominance" value={`${data.marketPulse.btcDominance.toFixed(1)}%`} />
                <Metric label="Fear & Greed" value={`${Math.round(data.marketPulse.fearGreed)}`} />
                <Metric label="News Momentum" value={`${Math.round(data.marketPulse.newsMomentum * 100)}%`} />
                <Metric label="Sentiment" value={`${Math.round(data.marketPulse.sentimentScore * 100)}%`} />
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <Metric label="Market Context" value="Active" />
                <Metric label="Narrative Read" value="Strong" />
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="min-w-0 bg-card/40 lg:col-span-7">
          <CardHeader>
            <CardTitle>Narrative Radar</CardTitle>
            <CardDescription>Which narratives are strengthening before consensus updates.</CardDescription>
          </CardHeader>
          <CardContent>
            {narrativesLoading ? (
              <div className="h-[260px] animate-pulse rounded-xl border bg-background/30" />
            ) : narratives ? (
              <NarrativeRadarChart narratives={narratives} />
            ) : null}
          </CardContent>
        </Card>

        <Card className="min-w-0 bg-card/40 lg:col-span-5">
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>Emerging and cooling narratives from the current snapshot.</CardDescription>
          </CardHeader>
          <CardContent>
            {narrativesLoading ? (
              <div className="h-[260px] animate-pulse rounded-xl border bg-background/30" />
            ) : narratives ? (
              <NarrativeRankings narratives={narratives} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <OpportunityRadar items={opportunityRadar} />

      <Card className="min-w-0 bg-card/40">
        <CardHeader>
          <CardTitle>Narrative Intelligence</CardTitle>
          <CardDescription>Heatmap of narrative strength, velocity, growth, and rotation.</CardDescription>
        </CardHeader>
        <CardContent>
          {narrativesLoading ? (
            <div className="h-[360px] animate-pulse rounded-xl border bg-background/30" />
          ) : narratives ? (
            <NarrativeHeatmap narratives={narratives} />
          ) : null}
        </CardContent>
      </Card>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>Recommended Flow</CardTitle>
          <CardDescription>Follow the product path from opportunity to research report.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "1. Dashboard", to: "/dashboard", icon: Radar },
            { label: "2. Guided Journey", to: "/journey", icon: BrainCircuit },
            { label: "3. Research", to: "/research", icon: FileText },
            { label: "4. Market Memory", to: "/market-memory", icon: History },
            { label: "5. Market Replay", to: "/market-replay", icon: Clock3 },
          ].map((step) => (
            <Link
              key={step.label}
              to={step.to}
              className="rounded-xl border bg-background/30 px-3 py-2.5 text-sm transition-colors hover:bg-background/40"
            >
              <step.icon className="h-4 w-4 text-primary" />
              <div className="mt-2 font-medium">{step.label}</div>
              <div className="mt-1 text-[13px] leading-snug text-muted-foreground">Open step</div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
