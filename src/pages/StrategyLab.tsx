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
import { buildProvenanceSummary } from "@/services/evidence/evidenceGraph"

function fmtPct(value: number) {
  return `${Math.round(value * 100)}%`
}

function displayPipelineStatus(value: string) {
  if (value === "mock") return "simulated"
  return value
}

export default function StrategyLab() {
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
            { label: "Hypothesis evidence", used: true, freshness: "Current", reliability: "High", sourceType: "hypothesis", mode: "live", capability: "Quotes" },
            { label: "Critic checks", used: true, freshness: "Current", reliability: "High", sourceType: "critic", mode: "cache", capability: "Skills Marketplace readiness" },
            { label: "Narrative signals", used: true, freshness: "1h", reliability: "Medium", sourceType: "narrative", mode: "live", capability: "Narratives" },
            { label: "Technicals", used: true, freshness: "2h", reliability: "Medium", sourceType: "technical", mode: "live", capability: "Technicals" },
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
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Strategy Evolution Lab
        </div>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Pipeline visual de evolução
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Gere variações backtestáveis a partir de uma hipótese selecionada. Pesquisa e simulação apenas.
        </p>
      </div>

      <Card className="bg-card/40">
        <CardContent className="grid gap-3 p-5 md:grid-cols-[220px_1fr_auto]">
          <select
            value={selectedHypothesisId}
            onChange={(e) => setSelectedHypothesisId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecione uma hipótese</option>
            {hypotheses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <div className="rounded-xl border bg-background/35 p-4">
            {activeHypothesis ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge>{activeHypothesis.status}</Badge>
                  <Badge variant="secondary">
                    Confidence {activeHypothesis.confidence}%
                  </Badge>
                  {activeAlphaScore ? <AlphaScoreBadge score={activeAlphaScore} compact /> : null}
                  <Badge variant="outline">{activeHypothesis.marketRegime}</Badge>
                </div>
                <div className="mt-3 font-display text-base font-semibold tracking-tight">
                  {activeHypothesis.title}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {activeHypothesis.description}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Escolha uma hipótese para gerar estratégias backtestáveis.
              </div>
            )}
          </div>
          <Button onClick={generateStrategies} disabled={!selectedHypothesisId || generating}>
            <Sparkles className="h-4 w-4" />
            {generating ? "Gerando…" : "Generate Strategies"}
          </Button>
        </CardContent>
      </Card>

      {generationError ? (
        <Card className="bg-card/40">
          <CardContent className="p-5">
            <div className="text-sm font-medium">Falha ao gerar estratégias</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {generationError.message}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="bg-card/40">
        <CardContent className="grid gap-3 p-5 md:grid-cols-[1fr_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por estratégia, benchmark, ativo…"
              className="pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Todos os status</option>
            <option value="approved">Approved</option>
            <option value="warning">Warning</option>
            <option value="candidate">Candidate</option>
          </select>
          <div className="flex gap-2">
            <Button variant="outline" onClick={retry}>
              Atualizar
            </Button>
            <Button onClick={exportJson} className="gap-2">
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>Pipeline</CardTitle>
          <CardDescription>
            Hypothesis → Generate → Backtest → Critic → Approved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-5">
            {pipeline.map((s) => (
              <div key={s.label} className="rounded-xl border bg-background/35 p-4">
                <div className="text-xs text-muted-foreground">Step</div>
                <div className="mt-1 font-display text-base font-semibold tracking-tight">
                  {s.label}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge
                    variant={
                      s.status === "ready"
                        ? "default"
                        : s.status === "active"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {displayPipelineStatus(s.status)}
                  </Badge>
                  {typeof s.count === "number" ? (
                    <Badge variant="secondary">{s.count}</Badge>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {loading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-[280px] animate-pulse rounded-xl border bg-background/30" />
              <div className="h-[280px] animate-pulse rounded-xl border bg-background/30" />
            </div>
          ) : error ? (
            <div className="rounded-xl border bg-background/35 p-5">
              <div className="text-sm font-medium">Falha ao carregar estratégias</div>
              <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
              <Button variant="outline" className="mt-3" onClick={retry}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border bg-background/35 p-5">
                <div className="text-sm font-medium">Top Ranked</div>
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
                        className="flex w-full items-center justify-between rounded-lg border bg-card/50 px-3 py-3 text-left transition-colors hover:bg-card/70"
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
                      Gere estratégias para a hipótese selecionada para preencher o ranking.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-background/35 p-5">
                <div className="text-sm font-medium">Comparação</div>
                {comparison ? (
                  <>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {[comparison.left, comparison.right].map((strategy) => (
                        <div
                          key={strategy.id}
                          className={[
                            "rounded-xl border bg-card/50 p-4",
                            selectedIds?.includes(strategy.id)
                              ? "border-primary/40"
                              : "border-border",
                          ].join(" ")}
                        >
                          <div className="font-display text-base font-semibold tracking-tight">
                            {strategy.spec.strategyName}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge>{displayPipelineStatus(strategy.status)}</Badge>
                            <Badge variant="secondary">{displayPipelineStatus(strategy.pipelineStage)}</Badge>
                            <Badge variant="outline">Score {strategy.score}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-2 md:grid-cols-2">
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
                    Selecione duas estratégias para comparar.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="bg-card/40 lg:col-span-5">
          <CardHeader>
            <CardTitle>Selected Strategy</CardTitle>
            <CardDescription>Spec pronta para export e evolução futura.</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStrategy ? (
              <div className="space-y-4 rounded-xl border bg-background/35 p-4">
                <div>
                  <div className="font-display text-lg font-semibold tracking-tight">
                    {selectedStrategy.spec.strategyName}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {selectedStrategy.spec.objective}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
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
                    <div className="mt-1 text-sm">
                      {selectedStrategy.spec.positionSizing}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-card/50 p-3">
                    <div className="text-xs text-muted-foreground">Rebalance</div>
                    <div className="mt-1 text-sm">
                      {selectedStrategy.spec.rebalanceFrequency}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-card/50 p-3">
                  <div className="text-xs text-muted-foreground">Entry Rules</div>
                  <div className="mt-2 space-y-1 text-sm">
                    {selectedStrategy.spec.entryRules.map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border bg-card/50 p-3">
                  <div className="text-xs text-muted-foreground">Risk Controls</div>
                  <div className="mt-2 space-y-1 text-sm">
                    {selectedStrategy.spec.riskControls.map((item) => (
                      <div key={item}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                Nenhuma estratégia disponível para a hipótese selecionada.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/40 lg:col-span-7">
          <CardHeader>
            <CardTitle>All Variations</CardTitle>
            <CardDescription>
              Estratégias ordenadas por score para comparação e export.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border">
              <div className="grid grid-cols-[1.6fr_repeat(5,0.8fr)] bg-background/20 px-3 py-2 text-xs text-muted-foreground">
                <div>Strategy</div>
                <div>Status</div>
                <div>Score</div>
                <div>Return</div>
                <div>DD</div>
                <div>Win</div>
              </div>
              <div className="max-h-[420px] overflow-auto divide-y divide-border">
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
                      className="grid w-full grid-cols-[1.6fr_repeat(5,0.8fr)] items-center bg-background/30 px-3 py-3 text-left text-sm transition-colors hover:bg-background/45"
                    >
                      <div className="min-w-0">
                        <div className="truncate">{item.spec.strategyName}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.spec.benchmark}
                        </div>
                      </div>
                      <div>{item.status}</div>
                      <div>{item.score}</div>
                      <div>{fmtPct(item.metrics.totalReturn)}</div>
                      <div>{fmtPct(item.metrics.maxDrawdown)}</div>
                      <div>{fmtPct(item.metrics.winRate)}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-sm text-muted-foreground">
                    Sem variações geradas para esta hipótese.
                  </div>
                )}
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
            Painel tipo auditoria para overfitting, liquidez, dependência narrativa e concentração.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {criticLoading ? (
            <div className="h-[320px] animate-pulse rounded-xl border bg-background/30" />
          ) : criticError ? (
            <div className="rounded-xl border bg-background/35 p-5">
              <div className="text-sm font-medium">Falha ao carregar relatório</div>
              <div className="mt-1 text-sm text-muted-foreground">{criticError.message}</div>
              <Button variant="outline" className="mt-3" onClick={criticRetry}>
                Tentar novamente
              </Button>
            </div>
          ) : criticReport ? (
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-4">
                <div className="rounded-xl border bg-background/35 p-5">
                  <div className="text-xs text-muted-foreground">Overall Status</div>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge
                      variant={
                        criticReport.overallStatus === "approved"
                          ? "default"
                          : criticReport.overallStatus === "warning"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {criticReport.overallStatus}
                    </Badge>
                    <div className="font-display text-2xl font-semibold tracking-tight">
                      {criticReport.score}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <div className="rounded-lg border bg-card/50 p-3">
                      <div className="text-xs text-muted-foreground">Findings</div>
                      <div className="mt-1 text-sm">{criticReport.findings.length}</div>
                    </div>
                    <div className="rounded-lg border bg-card/50 p-3">
                      <div className="text-xs text-muted-foreground">Warnings</div>
                      <div className="mt-1 text-sm">{criticReport.warnings.length}</div>
                    </div>
                    <div className="rounded-lg border bg-card/50 p-3">
                      <div className="text-xs text-muted-foreground">Failures</div>
                      <div className="mt-1 text-sm">{criticReport.failureReasons.length}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-background/35 p-5">
                  <div className="text-sm font-medium">Recommended Adjustments</div>
                  <div className="mt-3 space-y-2">
                    {criticReport.recommendedAdjustments.map((item) => (
                      <div key={item} className="rounded-lg border bg-card/50 p-3 text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-8">
                <div className="grid gap-3 md:grid-cols-2">
                  {criticReport.checks.map((check) => (
                    <div key={check.key} className="rounded-xl border bg-background/35 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {check.status === "passed" ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : check.status === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <div className="font-medium">{check.label}</div>
                        </div>
                        <Badge
                          variant={
                            check.status === "passed"
                              ? "default"
                              : check.status === "warning"
                                ? "outline"
                                : "secondary"
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
                              ? "bg-primary"
                              : check.status === "warning"
                                ? "bg-yellow-400"
                                : "bg-red-400",
                          ].join(" ")}
                          style={{ width: `${Math.max(0, Math.min(100, check.score))}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Score</span>
                        <span>{check.score}</span>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        {check.reasoning}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border bg-background/35 p-4">
                    <div className="text-sm font-medium">Passed</div>
                    <div className="mt-3 space-y-2">
                      {criticReport.findings.map((item) => (
                        <div key={item} className="text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-background/35 p-4">
                    <div className="text-sm font-medium">Warning</div>
                    <div className="mt-3 space-y-2">
                      {criticReport.warnings.map((item) => (
                        <div key={item} className="text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-background/35 p-4">
                    <div className="text-sm font-medium">Failed</div>
                    <div className="mt-3 space-y-2">
                      {criticReport.failureReasons.map((item) => (
                        <div key={item} className="text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {provenance ? <ProvenancePanel summary={provenance} /> : null}
    </div>
  )
}

