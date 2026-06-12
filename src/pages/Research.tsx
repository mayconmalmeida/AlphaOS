import { useEffect, useMemo, useState } from "react"
import { ExternalLink, FileText, Plus } from "lucide-react"
import { useLocation } from "react-router-dom"

import { AlphaScoreBadge } from "@/components/alpha/AlphaScoreBadge"
import { EvidenceGraph } from "@/components/evidence/EvidenceGraph"
import { ProvenancePanel } from "@/components/evidence/ProvenancePanel"
import { GuidedJourneyBanner } from "@/components/journey/GuidedJourneyBanner"
import { GuidedJourneySummary } from "@/components/journey/GuidedJourneySummary"
import { EvidencePanel } from "@/components/rag/EvidencePanel"
import { ResearchReportLayout } from "@/components/research/ResearchReportLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRagResearch } from "@/hooks/useRagResearch"
import { useResearchCenter } from "@/hooks/useResearchCenter"
import { parseGuidedJourney } from "@/lib/guidedJourney"
import { buildAlphaScore } from "@/services/alphaScoreService"
import { buildProvenanceSummary } from "@/services/evidence/evidenceGraph"
import { hypothesesService } from "@/services/hypotheses"
import type { HypothesisDetail } from "@/services/hypotheses"

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

export default function Research() {
  const location = useLocation()
  const journey = parseGuidedJourney(location.search)
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
  const [showSummary, setShowSummary] = useState(false)
  const [journeyHypothesis, setJourneyHypothesis] = useState<HypothesisDetail | null>(null)

  useEffect(() => {
    if (!journey.active) return
    if (journey.step !== 7) return
    if (!journey.hypothesisId) return
    if (selectedHypothesisId === journey.hypothesisId) return
    setSelectedHypothesisId(journey.hypothesisId)
  }, [journey.active, journey.hypothesisId, journey.step, selectedHypothesisId, setSelectedHypothesisId])

  useEffect(() => {
    let active = true
    if (!journey.active) {
      setJourneyHypothesis(null)
      return
    }
    if (!journey.hypothesisId) return
    hypothesesService.getById(journey.hypothesisId).then((res) => {
      if (!active) return
      if (res.ok) {
        setJourneyHypothesis(res.data as HypothesisDetail)
      }
    })
    return () => {
      active = false
    }
  }, [journey.active, journey.hypothesisId])

  const provenance = buildProvenanceSummary({
    title: selectedReport?.title ?? "Research Center",
    lastUpdated: selectedReport?.createdAt ?? new Date().toISOString(),
    evidenceCount: rag.data?.evidence.length ?? 0,
    confidence: rag.data?.answer?.unsupportedClaimsBlocked ? 84 : 68,
    relevance:
      rag.data?.evidence.length
        ? Math.round(
            (rag.data.evidence.reduce((acc, item) => acc + item.relevanceScore, 0) /
              rag.data.evidence.length) *
              100
          )
        : 0,
    quality: rag.data?.evidence.length ? "Traceable" : "Awaiting retrieval",
    historicalAnalogues: rag.data?.evidence
      .filter((item) => item.sourceType === "research" || item.sourceType === "snapshot")
      .map((item) => item.title) ?? [],
    sources: [
      { label: "Quotes", used: true, freshness: "1h", reliability: "High", sourceType: "market", mode: "live", capability: "Quotes" },
      { label: "Technicals", used: true, freshness: "2h", reliability: "High", sourceType: "technical", mode: "live", capability: "Technicals" },
      { label: "News", used: true, freshness: "30m", reliability: "Medium", sourceType: "news", mode: "live", capability: "News" },
      { label: "Sentiment", used: true, freshness: "15m", reliability: "Medium", sourceType: "sentiment", mode: "live", capability: "Sentiment" },
      { label: "Categories", used: true, freshness: "1h", reliability: "High", sourceType: "category", mode: "live", capability: "Categories" },
      { label: "Narratives", used: true, freshness: "1h", reliability: "High", sourceType: "narrative", mode: "live", capability: "Narratives" },
    ],
  })

  const graph =
    rag.data && rag.data.evidence.length > 0
      ? {
          nodes: [
            { id: "question", label: "Research Question", kind: "market" as const, x: 180, y: 180, confidence: 100, relevance: 100 },
            { id: "answer", label: selectedReport?.title ?? "Structured Answer", kind: "hypothesis" as const, x: 520, y: 180, confidence: provenance.confidence, relevance: provenance.relevance },
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

  const journeyAlphaScore = useMemo(() => {
    return journeyHypothesis ? buildAlphaScore(journeyHypothesis) : null
  }, [journeyHypothesis])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Research Center
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Generate institutional research reports
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Generate investor-ready reports from hypotheses, evidence, market memory, narratives,
            strategy work, and audit outputs.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          <select
            value={selectedHypothesisId}
            onChange={(e) => setSelectedHypothesisId(e.target.value)}
            className="h-9 min-w-[240px] rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            className="flex items-center gap-2"
            onClick={generateReport}
            disabled={generating}
          >
            <Plus className="h-4 w-4" />
            {generating ? "Generating..." : "Generate Report"}
          </Button>
          <Button
            className="flex items-center gap-2"
            disabled={!selectedReport}
            onClick={() =>
              selectedReport
                ? exportReport(selectedReport.title, selectedReport.sections)
                : undefined
            }
          >
            <FileText className="h-4 w-4" />
            Export Viewer
          </Button>
        </div>
      </div>

      {journey.active ? (
        <>
          <GuidedJourneyBanner hypothesisId={journey.hypothesisId} onFinish={() => setShowSummary(true)} />
          {journey.hypothesisId ? (
            <GuidedJourneySummary
              open={showSummary}
              onClose={() => setShowSummary(false)}
              hypothesisId={journey.hypothesisId}
              alphaScore={journeyAlphaScore}
              evidenceCount={journeyHypothesis?.evidence.length ?? 0}
              reportsCount={reports.length}
              narrativesTracked={journeyHypothesis?.relatedNarratives.length ?? 0}
              marketMemoryMatches={journeyHypothesis?.historicalAnalogues.length ?? 0}
            />
          ) : null}
        </>
      ) : null}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="h-[520px] animate-pulse rounded-xl border bg-background/30 lg:col-span-4" />
          <div className="h-[520px] animate-pulse rounded-xl border bg-background/30 lg:col-span-8" />
        </div>
      ) : error ? (
        <Card className="bg-card/40">
          <CardContent className="p-5">
            <div className="text-sm font-medium">Failed to load reports</div>
            <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
            <Button variant="outline" className="mt-3" onClick={retry}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="bg-card/40 lg:col-span-4">
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
                      "w-full rounded-xl border p-4 text-left transition-colors hover:bg-background/45",
                      selectedId === report.id ? "bg-background/50 border-primary/40" : "bg-background/30",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{report.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{report.createdAt}</div>
                      </div>
                      <Badge variant="outline">{report.reportType}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {report.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {report.executiveSummary}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="lg:col-span-8">
              {alphaScore && selectedHypothesis ? (
                <Card className="mb-4 bg-card/40">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <div className="text-xs text-muted-foreground">Selected Hypothesis</div>
                      <div className="mt-1 text-sm font-medium">{selectedHypothesis.title}</div>
                    </div>
                    <AlphaScoreBadge score={alphaScore} />
                  </CardContent>
                </Card>
              ) : null}
              {selectedReport ? (
                <ResearchReportLayout
                  report={selectedReport}
                  onExportMarkdown={() =>
                    exportReport(selectedReport.title, selectedReport.sections)
                  }
                  actions={
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() =>
                        window.open(
                          `/research/reports/${selectedReport.id}`,
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
                    <div className="rounded-xl border bg-background/35 p-6 text-sm text-muted-foreground">
                      Select a report from the library to open the viewer.
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle>RAG Evidence Engine</CardTitle>
              <CardDescription>
                Retrieves semantic context before answering. No claim ships without evidence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <textarea
                  value={rag.question}
                  onChange={(e) => rag.setQuestion(e.target.value)}
                  rows={3}
                  className="min-h-[88px] rounded-md border border-input bg-background/40 px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ask a market research question..."
                />
                <Button onClick={rag.run} disabled={rag.loading} className="h-fit">
                  {rag.loading ? "Generating..." : "Generate Answer"}
                </Button>
              </div>

              {rag.error ? (
                <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                  {rag.error.message}
                </div>
              ) : null}

              {rag.data ? (
                <>
                  <div className="rounded-xl border bg-background/35 p-4">
                    <div className="text-xs text-muted-foreground">Context Prompt</div>
                    <pre className="mt-2 max-h-[220px] overflow-auto whitespace-pre-wrap text-xs text-foreground/90">
                      {rag.data.prompt}
                    </pre>
                  </div>
                  <EvidencePanel evidence={rag.data.evidence} answer={rag.data.answer} />
                  {graph ? <EvidenceGraph nodes={graph.nodes} edges={graph.edges} /> : null}
                  <ProvenancePanel summary={provenance} />
                </>
              ) : (
                <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                  Generate an answer to inspect ranked evidence, the context prompt, and citations.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

