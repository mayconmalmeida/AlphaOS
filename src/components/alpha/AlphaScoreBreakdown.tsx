import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { AlphaScoreResult } from "@/services/alphaScoreService"

type AlphaScoreBreakdownProps = {
  result: AlphaScoreResult
  title?: string
  description?: string
}

const LABELS: Record<keyof AlphaScoreResult["breakdown"], string> = {
  narrativeStrength: "Narrative Strength",
  historicalSimilarity: "Historical Similarity",
  sentimentAlignment: "Sentiment Alignment",
  technicalConfirmation: "Technical Confirmation",
  volumeConfirmation: "Volume Confirmation",
}

export function AlphaScoreBreakdown({
  result,
  title = "Alpha Score",
  description = "Proprietary AlphaOS score derived from narrative strength, historical similarity, sentiment, technicals, and volume confirmation.",
}: AlphaScoreBreakdownProps) {
  return (
    <Card className="bg-card/40">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-xl border bg-background/35 p-5 lg:col-span-4">
          <div className="text-xs text-muted-foreground">Current Score</div>
          <div className="mt-2 font-display text-4xl font-semibold tracking-tight">
            {result.score}
            <span className="ml-1 text-base text-muted-foreground">/100</span>
          </div>
          <div className="mt-4 grid gap-2">
            {result.history.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border bg-card/50 px-3 py-2 text-sm"
              >
                <span>{item.label}</span>
                <span>{item.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 lg:col-span-8 md:grid-cols-2">
          {Object.entries(result.breakdown).map(([key, value]) => (
            <div key={key} className="rounded-xl border bg-background/35 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>{LABELS[key as keyof AlphaScoreResult["breakdown"]]}</span>
                <span>{value}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full border bg-background/30">
                <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
