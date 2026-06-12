import { Link, useNavigate } from "react-router-dom"
import { ChevronRight, Search, ShieldCheck, Sparkles } from "lucide-react"

import { AlphaScoreBadge } from "@/components/alpha/AlphaScoreBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { buildAlphaScore } from "@/services/alphaScoreService"
import type { HypothesisDetail } from "@/services/hypotheses"
import { useHypothesisGeneration } from "@/hooks/useHypothesisGeneration"
import { useHypotheses } from "@/hooks/useHypotheses"

export default function Hypotheses() {
  const { search, setSearch, status, setStatus, data, loading, error, retry } =
    useHypotheses()
  const navigate = useNavigate()
  const {
    generate,
    loading: generating,
    error: generateError,
  } = useHypothesisGeneration()

  async function handleGenerate() {
    const res = await generate()
    if (res.ok) {
      await retry()
      navigate(`/hypotheses/${res.data.id}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Hypothesis Center
          </div>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Hipóteses explicáveis
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            AlphaOS gera hipóteses de mercado com evidências. Não são sinais, nem recomendação.
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          <Sparkles className="h-4 w-4" />
          {generating ? "Gerando…" : "Generate Hypothesis"}
        </Button>
      </div>

      {generateError ? (
        <Card className="bg-card/40">
          <CardContent className="p-5">
            <div className="text-sm font-medium">Falha ao gerar hipótese</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {generateError.message}
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
              placeholder="Buscar por hipótese, narrativa, regime…"
              className="pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-md border border-input bg-background/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Todos os status</option>
            <option value="open">Open</option>
            <option value="watch">Watch</option>
            <option value="closed">Closed</option>
          </select>
          <Button variant="outline" onClick={retry}>
            Atualizar
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-[220px] animate-pulse rounded-xl border bg-background/30"
            />
          ))
        ) : error ? (
          <Card className="bg-card/40 lg:col-span-2">
            <CardContent className="p-5">
              <div className="text-sm font-medium">Falha ao carregar hipóteses</div>
              <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
              <Button variant="outline" className="mt-3" onClick={retry}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        ) : data.length === 0 ? (
          <Card className="bg-card/40 lg:col-span-2">
            <CardContent className="p-5 text-sm text-muted-foreground">
              Nenhuma hipótese encontrada com os filtros atuais.
            </CardContent>
          </Card>
        ) : (
          data.map((h) => (
            (() => {
              const alphaScore = buildAlphaScore({
                ...(h as HypothesisDetail),
                evidence: [],
                narrativeSignals: [],
                historicalAnalogues: [],
              })

              return (
            <Card key={h.id} className="bg-card/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{h.title}</CardTitle>
                    <CardDescription>Hypothesis #{h.id}</CardDescription>
                  </div>
                  <div className="rounded-lg border bg-card/50 p-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{h.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>Confidence {h.confidence}%</Badge>
                  <AlphaScoreBadge score={alphaScore} compact />
                  <Badge variant="secondary">Risk {h.riskScore}</Badge>
                  <Badge variant="secondary">{h.status}</Badge>
                  <Badge variant="outline">{h.expectedHorizon}</Badge>
                  <Badge variant="outline">{h.evidenceCount} evidências</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {h.relatedNarratives.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
                <div className="rounded-xl border bg-background/35 p-4">
                  <div className="text-xs text-muted-foreground">Why now</div>
                  <div className="mt-1 text-sm text-foreground/90">{h.whyNow}</div>
                </div>
                <Link
                  to={`/hypotheses/${h.id}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Abrir evidências
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
              )
            })()
          ))
        )}
      </div>
    </div>
  )
}

