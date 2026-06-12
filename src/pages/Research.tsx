import { useEffect, useMemo, useState } from "react"
import { ExternalLink, FileText, Plus } from "lucide-react"

import { AlphaScoreBadge } from "@/components/alpha/AlphaScoreBadge"
import { EvidenceGraph } from "@/components/evidence/EvidenceGraph"
import { ProvenancePanel } from "@/components/evidence/ProvenancePanel"
import { EvidencePanel } from "@/components/rag/EvidencePanel"
import { ResearchReportLayout } from "@/components/research/ResearchReportLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRagResearch } from "@/hooks/useRagResearch"
import { useResearchCenter } from "@/hooks/useResearchCenter"
import { isErr } from "@/lib/api"
import { buildAlphaScore } from "@/services/alphaScoreService"
import { cmcServices } from "@/services/cmc"
import { getCmcRuntimeStatus } from "@/services/cmc/runtime"
import type { CategoryMetric, Quote, TechnicalSummary } from "@/services/cmc/types"
import { buildProvenanceSummary } from "@/services/evidence/evidenceGraph"
import type { HypothesisDetail } from "@/services/hypotheses"
import {
  buildOpportunityIntelligence,
  buildOpportunityReportSection,
} from "@/services/opportunityIntelligence"

function exportReport(title: string, sections: { title: string; body: string }[]) {
  const content = sections.map((section) => `## ${section.title}\n\n${section.body}`).join("\n\n")
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `${title.replace(/\s+/g, "-").toLowerCase()}.md`
  anchor.click()
  URL.revokeObjectURL(url)
}

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1_000 ? 0 : 2,
  }).format(value)
}

function intelligenceLabel(source?: "live" | "fallback" | "cache" | "idle") {
  if (source === "live") return "Live Intelligence"
  if (source === "cache") return "Cached Intelligence"
  if (source === "idle") return "Intelligence Available"
  return "Protected Intelligence"
}

function provenanceMode(source?: "live" | "fallback" | "cache" | "idle") {
  if (source === "live" || source === "fallback" || source === "cache") return source
  return "unknown" as const
}

export default function Research() {
  const rag = useRagResearch()
  const {
    reports,
    hypotheses,
    selectedHypothesisId,
    setSelectedHypothesisId,
    selectedReport,
    selectedId,
    setSelectedId,
    loading,
    generating,
    error,
    retry,
    generateReport,
  } = useResearchCenter()
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
  const provenanceConfidence = rag.data?.answer?.unsupportedClaimsBlocked ? 84 : 68
  const provenanceRelevance =
    rag.data?.evidence.length
      ? Math.round(
          (rag.data.evidence.reduce((acc, item) => acc + item.relevanceScore, 0) /
            rag.data.evidence.length) *
            100
        )
      : 0

  const graph =
    rag.data && rag.data.evidence.length > 0
      ? {
          nodes: [
            { id: "question", label: "Research Question", kind: "market" as const, x: 180, y: 180, confidence: 100, relevance: 100 },
            {
              id: "answer",
              label: selectedReport?.title ?? "Structured Answer",
              kind: "hypothesis" as const,
              x: 520,
              y: 180,
              confidence: provenanceConfidence,
              relevance: provenanceRelevance,
            },
            ...rag.data.evidence.slice(0, 5).map((item, index) => ({
              id: item.id,
              label: item.title,
              kind: "evidence" as const,
              x: 850,
              y: 70 + index * 90,
              confidence: Math.round(item.relevanceScore * 100),
              relevance: Math.round(item.relevanceScore * 100),
            })),
          ],
          edges: rag.data.evidence.slice(0, 5).map((item) => ({
            id: `edge:${item.id}`,
            from: item.id,
            to: "answer",
            kind: "supports" as const,
            weight: Math.round(item.relevanceScore * 100),
          })),
        }
      : null

  const selectedHypothesis =
    hypotheses.find((item) => item.id === selectedHypothesisId) ?? hypotheses[0] ?? null
  const alphaScore = selectedHypothesis
    ? buildAlphaScore({
        ...(selectedHypothesis as HypothesisDetail),
        evidence: [],
        narrativeSignals: [],
        historicalAnalogues: [],
      })
    : null
  const reportForView = useMemo(() => {
    if (!selectedReport) return null
    if (selectedReport.opportunityIntelligence || !selectedHypothesis || !alphaScore) return selectedReport

    const opportunityIntelligence = buildOpportunityIntelligence(selectedHypothesis, {
      alphaScore,
      quotes: cmcSignals.quotes,
      categories: cmcSignals.categories,
      technicals: cmcSignals.technicals,
    })

    const hasSection = selectedReport.sections.some((section) => section.title === "Opportunity Intelligence")

    return {
      ...selectedReport,
      opportunityIntelligence,
      sections: hasSection
        ? selectedReport.sections
        : [
            {
              id: "opportunity-intelligence",
              title: "Opportunity Intelligence",
              body: buildOpportunityReportSection(opportunityIntelligence),
            },
            ...selectedReport.sections,
          ],
    }
  }, [
    alphaScore,
    cmcSignals.categories,
    cmcSignals.quotes,
    cmcSignals.technicals,
    selectedHypothesis,
    selectedReport,
  ])

  const provenance = buildProvenanceSummary({
    title: selectedReport?.title ?? "Research Center",
    lastUpdated: selectedReport?.createdAt ?? new Date().toISOString(),
    evidenceCount: rag.data?.evidence.length ?? 0,
    confidence: provenanceConfidence,
    relevance: provenanceRelevance,
    quality: rag.data?.evidence.length ? "Traceable" : "Awaiting retrieval",
    historicalAnalogues: rag.data?.evidence
      .filter((item) => item.sourceType === "research" || item.sourceType === "snapshot")
      .map((item) => item.title) ?? [],
    sources: [
      {
        label: "Quotes",
        used: cmcSignals.quotes.length > 0,
        freshness: runtime.quotes.lastSync ?? "Unavailable",
        reliability: "High",
        sourceType: "market",
        mode: provenanceMode(runtime.quotes.source),
        timestamp: runtime.quotes.lastSync ?? undefined,
        capability: "Quotes",
      },
      {
        label: "Technicals",
        used: cmcSignals.technicals.length > 0,
        freshness: runtime.technicals.lastSync ?? "Unavailable",
        reliability: "High",
        sourceType: "technical",
        mode: provenanceMode(runtime.technicals.source),
        timestamp: runtime.technicals.lastSync ?? undefined,
        capability: "Technicals",
      },
      {
        label: "News",
        used: rag.data?.evidence.some((item) => item.sourceType === "news") ?? false,
        freshness: runtime.news.lastSync ?? "Unavailable",
        reliability: "Medium",
        sourceType: "news",
        mode: provenanceMode(runtime.news.source),
        timestamp: runtime.news.lastSync ?? undefined,
        capability: "News",
      },
      {
        label: "Sentiment",
        used: true,
        freshness: runtime.sentiment.lastSync ?? "Unavailable",
        reliability: "Medium",
        sourceType: "sentiment",
        mode: provenanceMode(runtime.sentiment.source),
        timestamp: runtime.sentiment.lastSync ?? undefined,
        capability: "Sentiment",
      },
      {
        label: "Categories",
        used: cmcSignals.categories.length > 0,
        freshness: runtime.categories.lastSync ?? "Unavailable",
        reliability: "High",
        sourceType: "category",
        mode: provenanceMode(runtime.categories.source),
        timestamp: runtime.categories.lastSync ?? undefined,
        capability: "Categories",
      },
      {
        label: "Narratives",
        used: selectedHypothesis?.relatedNarratives.length ? true : false,
        freshness: runtime.narratives.lastSync ?? "Unavailable",
        reliability: "High",
        sourceType: "narrative",
        mode: provenanceMode(runtime.narratives.source),
        timestamp: runtime.narratives.lastSync ?? undefined,
        capability: "Narratives",
      },
    ],
  })

  useEffect(() => {
    let cancelled = false

    async function loadSignals() {
      if (!selectedHypothesis) {
        setCmcSignals({ quotes: [], categories: [], technicals: [] })
        return
      }

      const symbols = selectedHypothesis.relatedAssets.slice(0, 3)
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
  }, [selectedHypothesis])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[11px] font-medium tracking-wide text-muted-foreground">Research Center</div>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
            Generate institutional research reports
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-snug text-muted-foreground">
            Generate investor-ready reports from hypotheses, evidence, market memory, narratives,
            strategy work, and audit outputs.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
          <select
            value={selectedHypothesisId}
            onChange={(e) => setSelectedHypothesisId(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-w-[240px]"
          >
            <option value="">Select a hypothesis</option>
            {hypotheses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            className="flex w-full items-center gap-2 lg:w-auto"
            onClick={generateReport}
            disabled={generating}
          >
            <Plus className="h-4 w-4" />
            {generating ? "Generating..." : "Generate Report"}
          </Button>
          <Button
            className="flex w-full items-center gap-2 lg:w-auto"
            disabled={!selectedReport}
            onClick={() =>
              selectedReport
                ? exportReport(selectedReport.title, selectedReport.sections)
                : undefined
            }
          >
            <FileText className="h-4 w-4" />
            Export Markdown
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="h-[520px] animate-pulse rounded-xl border bg-background/30 lg:col-span-4" />
          <div className="h-[520px] animate-pulse rounded-xl border bg-background/30 lg:col-span-8" />
        </div>
      ) : error ? (
        <Card className="bg-card/40">
          <CardContent className="pt-3">
            <div className="text-sm font-medium">Failed to load reports</div>
            <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
            <Button variant="outline" className="mt-3" onClick={retry}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-12">
            <Card className="bg-card/40 xl:col-span-4">
              <CardHeader>
                <CardTitle>Research Library</CardTitle>
                <CardDescription>Curated library of institutional research outputs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedId(report.id)}
                    className={[
                      "w-full rounded-xl border p-3 text-left transition-colors hover:bg-background/45",
                      selectedId === report.id ? "bg-background/50 border-primary/40" : "bg-background/30",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-display text-[13px] font-semibold tracking-tight">
                          {report.title}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{report.createdAt}</div>
                      </div>
                      <Badge variant="outline">{report.reportType}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {report.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 line-clamp-3 text-[13px] leading-snug text-muted-foreground">
                      {report.executiveSummary}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="min-w-0 xl:col-span-8">
              {alphaScore && selectedHypothesis ? (
                <Card className="mb-4 bg-card/40">
                  <CardContent className="space-y-3 pt-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">Selected Hypothesis</div>
                        <div className="mt-1 text-sm font-medium">{selectedHypothesis.title}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            runtime.quotes.source === "live" &&
                            runtime.categories.source === "live" &&
                            runtime.technicals.source === "live"
                              ? "success"
                              : "warning"
                          }
                        >
                          {runtime.quotes.source === "live" &&
                          runtime.categories.source === "live" &&
                          runtime.technicals.source === "live"
                            ? "Live Intelligence"
                            : "Protected Intelligence"}
                        </Badge>
                        <AlphaScoreBadge score={alphaScore} />
                      </div>
                    </div>
                    <div className="grid gap-2 lg:grid-cols-3">
                      <div className="rounded-xl border bg-background/30 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs text-muted-foreground">Market Context</div>
                          <Badge variant={runtime.quotes.source === "live" ? "success" : "warning"}>
                            {intelligenceLabel(runtime.quotes.source)}
                          </Badge>
                        </div>
                        {cmcLoading ? (
                          <div className="mt-2 h-12 animate-pulse rounded-lg border bg-background/40" />
                        ) : cmcSignals.quotes.length > 0 ? (
                          <div className="mt-2 space-y-1.5">
                            {cmcSignals.quotes.slice(0, 3).map((quote) => (
                              <div key={quote.symbol} className="flex items-center justify-between gap-3 text-[13px]">
                                <span>{quote.symbol}</span>
                                <span className="text-muted-foreground">{currency(quote.priceUsd)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2 text-[13px] leading-snug text-muted-foreground">
                            Verified market context remains available while live pricing refreshes.
                          </div>
                        )}
                      </div>
                      <div className="rounded-xl border bg-background/30 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs text-muted-foreground">Category Rotation</div>
                          <Badge variant={runtime.categories.source === "live" ? "success" : "warning"}>
                            {intelligenceLabel(runtime.categories.source)}
                          </Badge>
                        </div>
                        {cmcLoading ? (
                          <div className="mt-2 h-12 animate-pulse rounded-lg border bg-background/40" />
                        ) : cmcSignals.categories.length > 0 ? (
                          <div className="mt-2 space-y-1.5">
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
                          <div className="mt-2 text-[13px] leading-snug text-muted-foreground">
                            Category intelligence is protected with the latest verified rotation view.
                          </div>
                        )}
                      </div>
                      <div className="rounded-xl border bg-background/30 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs text-muted-foreground">Technical Confirmation</div>
                          <Badge variant={runtime.technicals.source === "live" ? "success" : "warning"}>
                            {intelligenceLabel(runtime.technicals.source)}
                          </Badge>
                        </div>
                        {cmcLoading ? (
                          <div className="mt-2 h-12 animate-pulse rounded-lg border bg-background/40" />
                        ) : cmcSignals.technicals.length > 0 ? (
                          <div className="mt-2 space-y-1.5">
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
                          <div className="mt-2 text-[13px] leading-snug text-muted-foreground">
                            Technical confirmation remains available through verified intelligence.
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
              {reportForView ? (
                <ResearchReportLayout
                  report={reportForView}
                  onExportMarkdown={() =>
                    exportReport(reportForView.title, reportForView.sections)
                  }
                  actions={
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() =>
                        window.open(
                          `/research/reports/${reportForView.id}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                      Share / Print
                    </Button>
                  }
                />
              ) : (
                <Card className="bg-card/40">
                  <CardHeader>
                    <CardTitle>Research Viewer</CardTitle>
                    <CardDescription>Institutional layout inspired by top-tier research desks.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border bg-background/30 p-4 text-[13px] leading-snug text-muted-foreground">
                      Select a report from the library to open the viewer.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <details className="rounded-xl border bg-card/40">
            <summary className="cursor-pointer select-none px-3 py-3">
              <div className="font-display text-base font-semibold tracking-tight">Research Evidence Review</div>
              <div className="mt-1 text-[13px] leading-snug text-muted-foreground">
                Expands the research trail behind each conclusion, including supporting context and citations.
              </div>
            </summary>
            <div className="px-3 pb-3 pt-0">
            <div className="space-y-3">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <textarea
                  value={rag.question}
                  onChange={(e) => rag.setQuestion(e.target.value)}
                  rows={3}
                  className="min-h-[88px] rounded-md border border-input bg-background/40 px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ask a market research question..."
                />
                <Button onClick={rag.run} disabled={rag.loading} className="h-fit w-full lg:w-auto">
                  {rag.loading ? "Generating..." : "Generate Answer"}
                </Button>
              </div>

              {rag.error ? (
                <div className="rounded-xl border bg-background/30 p-3 text-sm text-muted-foreground">
                  {rag.error.message}
                </div>
              ) : null}

              {rag.data ? (
                <>
                  <details className="rounded-xl border bg-background/30 p-3">
                    <summary className="cursor-pointer select-none text-sm font-medium">
                      Research context
                    </summary>
                    <pre className="mt-2 max-h-[220px] overflow-auto whitespace-pre-wrap break-words text-xs text-foreground/90">
                      {rag.data.prompt}
                    </pre>
                  </details>
                  <EvidencePanel evidence={rag.data.evidence} answer={rag.data.answer} />
                  {graph ? <EvidenceGraph nodes={graph.nodes} edges={graph.edges} /> : null}
                  <details className="rounded-xl border bg-background/30 p-3">
                    <summary className="cursor-pointer select-none text-sm font-medium">
                      Evidence trail
                    </summary>
                    <div className="mt-3">
                      <ProvenancePanel summary={provenance} />
                    </div>
                  </details>
                </>
              ) : (
                <div className="rounded-xl border bg-background/30 p-3 text-sm text-muted-foreground">
                  Generate an answer to inspect ranked evidence, supporting context, and citations.
                </div>
              )}
            </div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

