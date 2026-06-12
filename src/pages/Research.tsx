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
import { buildAlphaScore } from "@/services/alphaScoreService"
import { buildProvenanceSummary } from "@/services/evidence/evidenceGraph"
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Research Center
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Relatórios institucionais
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Geração de relatórios a partir de hipótese, evidências, memória de mercado, narrativas, estratégias e auditoria.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          <select
            value={selectedHypothesisId}
            onChange={(e) => setSelectedHypothesisId(e.target.value)}
            className="h-9 min-w-[240px] rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecione uma hipótese</option>
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
            {generating ? "Gerando..." : "Generate Report"}
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

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="h-[520px] animate-pulse rounded-xl border bg-background/30 lg:col-span-4" />
          <div className="h-[520px] animate-pulse rounded-xl border bg-background/30 lg:col-span-8" />
        </div>
      ) : error ? (
        <Card className="bg-card/40">
          <CardContent className="p-5">
            <div className="text-sm font-medium">Falha ao carregar relatórios</div>
            <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
            <Button variant="outline" className="mt-3" onClick={retry}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="bg-card/40 lg:col-span-4">
              <CardHeader>
                <CardTitle>Research Library</CardTitle>
                <CardDescription>Biblioteca institucional de relatórios.</CardDescription>
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
                    <CardDescription>Template estilo Bloomberg Research + Goldman Sachs.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border bg-background/35 p-6 text-sm text-muted-foreground">
                      Selecione um relatório na biblioteca para abrir o viewer.
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
                Recupera contexto semantico antes de responder. Nenhuma claim deve sair sem evidencia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <textarea
                  value={rag.question}
                  onChange={(e) => rag.setQuestion(e.target.value)}
                  rows={3}
                  className="min-h-[88px] rounded-md border border-input bg-background/40 px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Faça uma pergunta de pesquisa de mercado..."
                />
                <Button onClick={rag.run} disabled={rag.loading} className="h-fit">
                  {rag.loading ? "Gerando..." : "Generate Answer"}
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
                  Gere uma resposta para visualizar evidencias ranqueadas, prompt de contexto e citacoes.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

