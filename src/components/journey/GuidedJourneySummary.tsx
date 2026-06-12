import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { AlphaScoreBadge } from "@/components/alpha/AlphaScoreBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AlphaScoreResult } from "@/services/alphaScoreService"

type GuidedJourneySummaryProps = {
  open: boolean
  onClose: () => void
  hypothesisId: string
  alphaScore: AlphaScoreResult | null
  evidenceCount: number
  reportsCount: number
  narrativesTracked: number
  marketMemoryMatches: number
}

export function GuidedJourneySummary(props: GuidedJourneySummaryProps) {
  const navigate = useNavigate()

  if (!props.open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-6 backdrop-blur">
      <Card className="w-full max-w-3xl bg-card/60 shadow-glass-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>AlphaOS</Badge>
            <Badge variant="secondary">The Autonomous Market Research Agent</Badge>
            <Badge variant="outline">Powered by CoinMarketCap Intelligence</Badge>
          </div>
          <CardTitle className="font-display text-2xl tracking-tight">
            A complete opportunity narrative in under two minutes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Alpha Score</div>
              <div className="mt-2">
                {props.alphaScore ? <AlphaScoreBadge score={props.alphaScore} /> : <Badge variant="secondary">N/A</Badge>}
              </div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Evidence Count</div>
              <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                {props.evidenceCount}
              </div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Research Generated</div>
              <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                {props.reportsCount}
              </div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs text-muted-foreground">Narratives Tracked</div>
              <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                {props.narrativesTracked}
              </div>
            </div>
            <div className="rounded-xl border bg-background/35 p-4 md:col-span-2">
              <div className="text-xs text-muted-foreground">Market Memory Matches</div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="font-display text-2xl font-semibold tracking-tight">
                  {props.marketMemoryMatches}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  AlphaOS found, explained, proved, compared, structured, and reported the opportunity.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={props.onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                props.onClose()
                navigate(`/hypotheses/${props.hypothesisId}`)
              }}
              className="gap-2"
            >
              Review opportunity
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

