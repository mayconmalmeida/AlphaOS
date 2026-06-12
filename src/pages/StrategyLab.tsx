import { useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Search,
  Shield,
  Sparkles,
  XCircle,
} from "lucide-react"

import { AlphaScoreBadge } from "@/components/alpha/AlphaScoreBadge"
import { ProvenancePanel } from "@/components/evidence/ProvenancePanel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCriticReport } from "@/hooks/useCriticReport"
import { useStrategyLab } from "@/hooks/useStrategyLab"
import { buildAlphaScore } from "@/services/alphaScoreService"
import { getCmcRuntimeStatus } from "@/services/cmc/runtime"
import { buildProvenanceSummary } from "@/services/evidence/evidenceGraph"

function fmtPct(value: number) {
  return `${Math.round(value * 100)}%`
}

function displayPipelineStatus(value: string) {
  if (value === "mock") return "Protected Intelligence"
  return value
}

function provenanceMode(source?: "live" | "fallback" | "cache" | "idle") {
  if (source === "live" || source === "fallback" || source === "cache") return source
  return "unknown" as const
}

export default function StrategyLab() {
  const [showHypothesisDetails, setShowHypothesisDetails] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPipelineDetails, setShowPipelineDetails] = useState(false)
  const [showRankedCandidates, setShowRankedCandidates] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [expandVariations, setExpandVariations] = useState(false)
  const {
    search,
    setSearch,
    status,
    setStatus,
    hypotheses,
    activeHypothesis,
    selectedHypothesisId,
    setSelectedHypothesisId,
    pipeline,
    candidates,
    topRanked,
    comparison,
    selectedIds,
    setSelectedIds,
    loading,
    generating,
    error,
    generationError,
    generateStrategies,
    retry,
  } = useStrategyLab()

  const selectedStrategy = comparison?.left ?? topRanked[0] ?? null
  const activeAlphaScore = activeHypothesis
    ? buildAlphaScore({
        ...activeHypothesis,
        evidence: [],
        narrativeSignals: [],
        historicalAnalogues: [],
      })
    : null
  const {
    data: criticReport,
    loading: criticLoading,
    error: criticError,
    retry: criticRetry,
  } = useCriticReport(selectedStrategy)
  const runtime = getCmcRuntimeStatus()

  const provenance =
    selectedStrategy && criticReport
      ? buildProvenanceSummary({
          title: selectedStrategy.spec.strategyName,
          lastUpdated: new Date().toISOString(),
          evidenceCount:
            selectedStrategy.spec.entryRules.length +
            selectedStrategy.spec.exitRules.length +
            selectedStrategy.spec.riskControls.length,
          confidence: Math.max(criticReport.score, selectedStrategy.score),
          relevance: selectedStrategy.score,
          quality: criticReport.overallStatus === "approved" ? "Institutional review passed" : "Needs review",
          historicalAnalogues: [selectedStrategy.hypothesisTitle ?? "Selected hypothesis"],
          sources: [
            {
              label: "Hypothesis evidence",
              used: true,
              freshness: runtime.quotes.lastSync ?? "Unavailable",
              reliability: "High",
              sourceType: "hypothesis",
              mode: provenanceMode(runtime.quotes.source),
              capability: "Quotes",
            },
            {
              label: "Critic checks",
              used: true,
              freshness: "Current",
              reliability: "High",
              sourceType: "critic",
              mode: "cache",
              capability: "Skills Marketplace readiness",
            },
            {
              label: "Narrative signals",
              used: true,
              freshness: runtime.narratives.lastSync ?? "Unavailable",
              reliability: "Medium",
              sourceType: "narrative",
              mode: provenanceMode(runtime.narratives.source),
              capability: "Narratives",
            },
            {
              label: "Technicals",
              used: true,
              freshness: runtime.technicals.lastSync ?? "Unavailable",
              reliability: "Medium",
              sourceType: "technical",
              mode: provenanceMode(runtime.technicals.source),
              capability: "Technicals",
            },
          ],
        })
      : null

  function exportJson() {
    const strategy = comparison?.left ?? topRanked[0]
    if (!strategy) return

    const blob = new Blob([JSON.stringify(strategy.spec, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${strategy.spec.strategyName
      .replace(/\s+/g, "-")
      .toLowerCase()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground">Strategy Lab</div>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
          Turn hypotheses into testable strategies
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-snug text-muted-foreground">
          Generate backtestable strategy variations from a selected hypothesis. Research and
          simulation only.
        </p>
      </div>

      <Card className="bg-card/40">
        <CardContent className="grid gap-3 pt-3 lg:grid-cols-[220px_1fr_auto]">
          <select
            value={selectedHypothesisId}
            onChange={(e) => setSelectedHypothesisId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a hypothesis</option>
            {hypotheses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <div className="rounded-xl border bg-background/30 p-3">
            {activeHypothesis ? (
              <>
                <div className="font-display text-base font-semibold tracking-tight">
                  {activeHypothesis.title}
                </div>
                <div className="mt-1 text-[13px] leading-snug text-muted-foreground">
                  {activeHypothesis.whyNow}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 px-0"
                  onClick={() => setShowHypothesisDetails((value) => !value)}
                >
                  {showHypothesisDetails ? "Hide details" : "View details"}
                </Button>
                {showHypothesisDetails ? (
                  <>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge>{activeHypothesis.status}</Badge>
                      <Badge variant="secondary">
                        Confidence {activeHypothesis.confidence}%
                      </Badge>
                      {activeAlphaScore ? <AlphaScoreBadge score={activeAlphaScore} compact /> : null}
                      <Badge variant="outline">{activeHypothesis.marketRegime}</Badge>
                    </div>
                    <div className="mt-3 text-[13px] leading-snug text-muted-foreground">
                      {activeHypothesis.description}
                    </div>
                  </>
                ) : null}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Choose a hypothesis to generate backtestable strategies.
              </div>
            )}
          </div>
          <Button onClick={generateStrategies} disabled={!selectedHypothesisId || generating} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {generating ? "Generating..." : "Generate Strategies"}
          </Button>
        </CardContent>
      </Card>

      {generationError ? (
        <Card className="bg-card/40">
          <CardContent className="pt-3">
            <div className="text-sm font-medium">Failed to generate strategies</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {generationError.message}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="bg-card/40">
        <CardContent className="space-y-3 pt-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium">Strategy candidates</div>
              <div className="mt-1 text-[13px] leading-snug text-muted-foreground">
                {candidates.length} strategy variations available for ranking, review, and export.
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowFilters((value) => !value)}>
              {showFilters ? "Hide" : "Refine"}
            </Button>
          </div>
          {showFilters ? (
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by strategy, benchmark, or asset..."
                  className="pl-9"
                />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All statuses</option>
                <option value="approved">Approved</option>
                <option value="warning">Warning</option>
                <option value="candidate">Candidate</option>
              </select>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={retry} className="w-full sm:w-auto">
                  Refresh
                </Button>
                <Button variant="outline" onClick={exportJson} className="w-full gap-2 sm:w-auto">
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">
                Approved {candidates.filter((item) => item.status === "approved").length}
              </Badge>
              <Badge variant="warning">
                Warning {candidates.filter((item) => item.status === "warning").length}
              </Badge>
              <Badge variant="outline">
                Candidate {candidates.filter((item) => item.status === "candidate").length}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>Strategy pipeline</CardTitle>
          <CardDescription>
            Keep the first screen simple and expand operational detail only when needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Hypotheses {hypotheses.length}</Badge>
            <Badge variant="outline">Active candidates {candidates.length}</Badge>
              <Badge variant="outline">Top score {topRanked[0]?.score ?? "N/A"}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAdvanced((value) => !value)}>
              {showAdvanced ? "Hide advanced" : "Advanced"}
            </Button>
          </div>
          {showAdvanced ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPipelineDetails((value) => !value)}
              >
                {showPipelineDetails ? "Hide pipeline details" : "Pipeline details"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRankedCandidates((value) => !value)}
              >
                {showRankedCandidates ? "Hide ranked candidates" : "Ranked candidates"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison((value) => !value)}
              >
                {showComparison ? "Hide comparison" : "Comparison"}
              </Button>
            </div>
          ) : null}
          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-[280px] animate-pulse rounded-xl border bg-background/30" />
              <div className="h-[280px] animate-pulse rounded-xl border bg-background/30" />
            </div>
          ) : error ? (
            <div className="rounded-xl border bg-background/30 p-3">
              <div className="text-sm font-medium">Failed to load strategies</div>
              <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
              <Button variant="outline" className="mt-3" onClick={retry}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              {showAdvanced && showPipelineDetails ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {pipeline.map((s) => (
                    <div key={s.label} className="rounded-xl border bg-background/30 p-3">
                      <div className="text-[11px] text-muted-foreground">Step</div>
                      <div className="mt-1 font-display text-base font-semibold tracking-tight">
                        {s.label}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge
                          variant={
                            s.status === "ready"
                              ? "success"
                              : s.status === "active"
                                ? "warning"
                                : "outline"
                          }
                        >
                          {displayPipelineStatus(s.status)}
                        </Badge>
                        {typeof s.count === "number" ? (
                          <Badge variant="outline">{s.count}</Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {(showAdvanced && (showRankedCandidates || showComparison)) ? <Separator /> : null}

              <div className="grid gap-4 lg:grid-cols-2">
                {showAdvanced && showRankedCandidates ? (
                  <div className="rounded-xl border bg-background/30 p-3">
                    <div className="text-sm font-medium">Ranked candidates</div>
                    <div className="mt-3 space-y-2">
                      {topRanked.length > 0 ? (
                        topRanked.map((row) => (
                          <button
                            key={row.id}
                            type="button"
                            onClick={() =>
                              setSelectedIds((prev) => [
                                row.id,
                                prev?.[1] && prev[1] !== row.id
                                  ? prev[1]
                                  : topRanked[1]?.id ?? row.id,
                              ])
                            }
                            className="flex w-full items-center justify-between rounded-lg border bg-card/50 px-3 py-2.5 text-left transition-colors hover:bg-card/70"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm">{row.spec.strategyName}</div>
                              <div className="text-xs text-muted-foreground">
                                {displayPipelineStatus(row.status)} · {displayPipelineStatus(row.pipelineStage)} · {row.spec.timeHorizon}
                              </div>
                            </div>
                            <Badge variant="outline">Score {row.score}</Badge>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-lg border bg-card/50 p-3 text-sm text-muted-foreground">
                          Generate strategies for the selected hypothesis to populate the ranking.
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {showAdvanced && showComparison ? (
                  <div className="rounded-xl border bg-background/30 p-3">
                    <div className="text-sm font-medium">Comparison</div>
                    {comparison ? (
                      <>
                        <div className="mt-3 grid gap-3 xl:grid-cols-2">
                          {[comparison.left, comparison.right].map((strategy) => (
                            <div
                              key={strategy.id}
                              className={[
                                "rounded-xl border bg-card/50 p-3",
                                selectedIds?.includes(strategy.id)
                                  ? "border-primary/40"
                                  : "border-border",
                              ].join(" ")}
                            >
                              <div className="font-display text-base font-semibold tracking-tight">
                                {strategy.spec.strategyName}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <Badge variant="outline">{displayPipelineStatus(strategy.status)}</Badge>
                                <Badge variant="outline">{displayPipelineStatus(strategy.pipelineStage)}</Badge>
                                <Badge variant="outline">Score {strategy.score}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {[
                            {
                              k: "Total Return",
                              a: fmtPct(comparison.left.metrics.totalReturn),
                              b: fmtPct(comparison.right.metrics.totalReturn),
                            },
                            {
                              k: "Max Drawdown",
                              a: fmtPct(comparison.left.metrics.maxDrawdown),
                              b: fmtPct(comparison.right.metrics.maxDrawdown),
                            },
                            {
                              k: "Win Rate",
                              a: fmtPct(comparison.left.metrics.winRate),
                              b: fmtPct(comparison.right.metrics.winRate),
                            },
                            {
                              k: "Profit Factor",
                              a: comparison.left.metrics.profitFactor.toFixed(2),
                              b: comparison.right.metrics.profitFactor.toFixed(2),
                            },
                          ].map((m) => (
                            <div key={m.k} className="rounded-lg border bg-card/50 p-3">
                              <div className="text-xs text-muted-foreground">{m.k}</div>
                              <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                                <span>{m.a}</span>
                                <span className="text-muted-foreground">vs</span>
                                <span>{m.b}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="mt-3 text-sm text-muted-foreground">
                        Select two strategies to compare.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="bg-card/40 xl:col-span-5">
          <CardHeader>
            <CardTitle>Selected Strategy</CardTitle>
            <CardDescription>Strategy specification ready for review, export, and iteration.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStrategy ? (
              <div className="space-y-3 rounded-xl border bg-background/30 p-3">
                <div>
                  <div className="font-display text-lg font-semibold tracking-tight">
                    {selectedStrategy.spec.strategyName}
                  </div>
                  <div className="mt-1 text-[13px] leading-snug text-muted-foreground">
                    {selectedStrategy.spec.objective}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStrategy.spec.universe.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                  {activeAlphaScore ? <AlphaScoreBadge score={activeAlphaScore} /> : null}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border bg-card/50 p-3">
                    <div className="text-xs text-muted-foreground">
                      Position Sizing
                    </div>
                    <div className="mt-1 text-[13px] leading-snug">
                      {selectedStrategy.spec.positionSizing}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card/50 p-3">
                    <div className="text-xs text-muted-foreground">Rebalance</div>
                    <div className="mt-1 text-[13px] leading-snug">
                      {selectedStrategy.spec.rebalanceFrequency}
                    </div>
                  </div>
                </div>
                <details className="rounded-lg border bg-card/50 p-3">
                  <summary className="cursor-pointer select-none text-xs text-muted-foreground">
                    Entry Rules · {selectedStrategy.spec.entryRules.length}
                  </summary>
                  <div className="mt-2 space-y-1 text-[13px] leading-snug">
                    {selectedStrategy.spec.entryRules.map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                </details>
                <details className="rounded-lg border bg-card/50 p-3">
                  <summary className="cursor-pointer select-none text-xs text-muted-foreground">
                    Risk Controls · {selectedStrategy.spec.riskControls.length}
                  </summary>
                  <div className="mt-2 space-y-1 text-[13px] leading-snug">
                    {selectedStrategy.spec.riskControls.map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                </details>
              </div>
            ) : (
              <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                No strategies are available for the selected hypothesis.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/40 xl:col-span-7">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>All Variations</CardTitle>
              <CardDescription>
                Strategies ranked by score for comparison and export.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setExpandVariations((v) => !v)}>
              {expandVariations ? "Collapse" : "Expand"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[1.6fr_repeat(5,0.8fr)] bg-background/20 px-3 py-2 text-xs text-muted-foreground">
                  <div>Strategy</div>
                  <div>Status</div>
                  <div>Score</div>
                  <div>Return</div>
                  <div>DD</div>
                  <div>Win</div>
                </div>
                <div className={(expandVariations ? "max-h-[520px]" : "max-h-[320px]") + " overflow-auto divide-y divide-border"}>
                {candidates.length > 0 ? (
                  candidates.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setSelectedIds((prev) => [
                          item.id,
                          prev?.[1] && prev[1] !== item.id
                            ? prev[1]
                            : candidates[1]?.id ?? item.id,
                        ])
                      }
                      className="grid w-full grid-cols-[1.6fr_repeat(5,0.8fr)] items-center bg-background/30 px-3 py-2.5 text-left text-sm transition-colors hover:bg-background/45"
                    >
                      <div className="min-w-0">
                        <div className="truncate">{item.spec.strategyName}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.spec.benchmark}
                        </div>
                      </div>
                      <div>{displayPipelineStatus(item.status)}</div>
                      <div>{item.score}</div>
                      <div>{fmtPct(item.metrics.totalReturn)}</div>
                      <div>{fmtPct(item.metrics.maxDrawdown)}</div>
                      <div>{fmtPct(item.metrics.winRate)}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-sm text-muted-foreground">
                    No variations have been generated for this hypothesis.
                  </div>
                )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Critic Report
          </CardTitle>
          <CardDescription>
            Buyer-facing risk review covering overfitting, liquidity, concentration, and narrative dependence.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {criticLoading ? (
            <div className="h-[320px] animate-pulse rounded-xl border bg-background/30" />
          ) : criticError ? (
            <div className="rounded-xl border bg-background/30 p-3">
              <div className="text-sm font-medium">Failed to load report</div>
              <div className="mt-1 text-sm text-muted-foreground">{criticError.message}</div>
              <Button variant="outline" className="mt-3" onClick={criticRetry}>
                Retry
              </Button>
            </div>
          ) : criticReport ? (
            <div className="grid gap-4 xl:grid-cols-12">
              <div className="space-y-4 xl:col-span-4">
                <div className="rounded-xl border bg-background/30 p-3">
                  <div className="text-[11px] text-muted-foreground">Overall Status</div>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge
                      variant={
                        criticReport.overallStatus === "approved"
                          ? "success"
                          : criticReport.overallStatus === "warning"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {criticReport.overallStatus}
                    </Badge>
                    <div className="font-display text-xl font-semibold tracking-tight">
                      {criticReport.score}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <div className="rounded-lg border bg-card/50 p-3">
                      <div className="text-xs text-muted-foreground">Findings</div>
                      <div className="mt-1 text-[13px]">{criticReport.findings.length}</div>
                    </div>
                    <div className="rounded-lg border bg-card/50 p-3">
                      <div className="text-xs text-muted-foreground">Warnings</div>
                      <div className="mt-1 text-[13px]">{criticReport.warnings.length}</div>
                    </div>
                    <div className="rounded-lg border bg-card/50 p-3">
                      <div className="text-xs text-muted-foreground">Failures</div>
                      <div className="mt-1 text-[13px]">{criticReport.failureReasons.length}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-background/30 p-3">
                  <div className="text-sm font-medium">Recommended Adjustments</div>
                  <div className="mt-3 space-y-2">
                    {criticReport.recommendedAdjustments.map((item) => (
                      <div key={item} className="rounded-lg border bg-card/50 p-3 text-[13px] leading-snug">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 xl:col-span-8">
                <div className="grid gap-3 lg:grid-cols-2">
                  {criticReport.checks.map((check) => (
                    <div key={check.key} className="rounded-xl border bg-background/30 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {check.status === "passed" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : check.status === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-500" />
                          )}
                          <div className="font-medium">{check.label}</div>
                        </div>
                        <Badge
                          variant={
                            check.status === "passed"
                              ? "success"
                              : check.status === "warning"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {check.status}
                        </Badge>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full border bg-background/30">
                        <div
                          className={[
                            "h-full rounded-full",
                            check.status === "passed"
                              ? "bg-emerald-500"
                              : check.status === "warning"
                                ? "bg-amber-500"
                                : "bg-rose-500",
                          ].join(" ")}
                          style={{ width: `${Math.max(0, Math.min(100, check.score))}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Score</span>
                        <span>{check.score}</span>
                      </div>
                      <div className="mt-3 text-[13px] leading-snug text-muted-foreground">
                        {check.reasoning}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <details
                    className="rounded-xl border bg-background/30 p-3"
                    open={criticReport.warnings.length === 0 && criticReport.failureReasons.length === 0}
                  >
                    <summary className="cursor-pointer select-none text-sm font-medium">
                      Passed · {criticReport.findings.length}
                    </summary>
                    <div className="mt-3 space-y-2">
                      {criticReport.findings.map((item) => (
                        <div key={item} className="text-[13px] leading-snug text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </details>
                  <details className="rounded-xl border bg-background/30 p-3" open={criticReport.warnings.length > 0}>
                    <summary className="cursor-pointer select-none text-sm font-medium">
                      Warning · {criticReport.warnings.length}
                    </summary>
                    <div className="mt-3 space-y-2">
                      {criticReport.warnings.map((item) => (
                        <div key={item} className="text-[13px] leading-snug text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </details>
                  <details className="rounded-xl border bg-background/30 p-3" open={criticReport.failureReasons.length > 0}>
                    <summary className="cursor-pointer select-none text-sm font-medium">
                      Failed · {criticReport.failureReasons.length}
                    </summary>
                    <div className="mt-3 space-y-2">
                      {criticReport.failureReasons.map((item) => (
                        <div key={item} className="text-[13px] leading-snug text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {provenance ? (
        <details className="rounded-xl border bg-background/30 p-3">
          <summary className="cursor-pointer select-none text-sm font-medium">
            Evidence provenance
          </summary>
          <div className="mt-3">
            <ProvenancePanel summary={provenance} />
          </div>
        </details>
      ) : null}
    </div>
  )
}

