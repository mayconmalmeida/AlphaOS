import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/i18n/I18nProvider"
import type { ProvenanceSummary } from "@/services/evidence/types"

type ProvenancePanelProps = {
  summary: ProvenanceSummary
}

function availabilityLabel(mode?: string) {
  if (mode === "live") return "Live Intelligence"
  if (mode === "idle") return "Intelligence Ready"
  if (mode === "cache" || mode === "fallback") return "Verified Market Context"
  return mode ?? "Verified Intelligence"
}

function evidenceTypeLabel(sourceType?: string) {
  if (!sourceType) return null
  if (sourceType === "cmc") return "CoinMarketCap"
  if (sourceType === "market_memory") return "Market Memory"
  if (sourceType === "research") return "Research"
  return sourceType.replace(/_/g, " ")
}

function coverageLabel(capability?: string) {
  if (!capability) return null
  if (capability === "technicals") return "Technical Signals"
  return capability.replace(/_/g, " ")
}

export function ProvenancePanel({ summary }: ProvenancePanelProps) {
  const { t } = useI18n()

  return (
    <Card className="bg-card/40">
      <CardHeader>
        <CardTitle>{t("evidence.provenance", "Evidence Trail")}</CardTitle>
        <CardDescription>{t("evidence.panelDescription", "Verified evidence supporting each AI-assisted insight.")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">{t("evidence.lastUpdated", "Last updated")}</div>
            <div className="mt-2 break-words text-sm font-medium">{summary.lastUpdated}</div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">{t("evidence.evidenceCount", "Evidence count")}</div>
            <div className="mt-2 text-sm font-medium">{summary.evidenceCount}</div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">{t("evidence.quality", "Evidence quality")}</div>
            <div className="mt-2 text-sm font-medium">{summary.evidenceQuality}</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">{t("evidence.confidence", "Confidence")}</div>
            <div className="mt-2 text-sm font-medium">{summary.confidence}%</div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">{t("evidence.relevance", "Relevance")}</div>
            <div className="mt-2 text-sm font-medium">{summary.relevance}%</div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">{t("evidence.historicalAnalogues", "Historical analogues")}</div>
            <div className="mt-2 text-sm font-medium">{summary.historicalAnalogues.length}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("evidence.sources", "Sources used")}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {summary.sources.map((source) => (
              <div key={source.label} className="rounded-xl border bg-background/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{source.label}</div>
                  <Badge variant={source.used ? "default" : "outline"}>
                    {source.used ? "Used" : "Idle"}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 break-words text-xs text-muted-foreground">
                  <span>{t("evidence.freshness", "Data freshness")}: {source.freshness}</span>
                  <span>{t("evidence.reliability", "Source reliability")}: {source.reliability}</span>
                  {source.sourceType ? <span>Evidence type: {evidenceTypeLabel(source.sourceType)}</span> : null}
                  {source.mode ? <span>Availability: {availabilityLabel(source.mode)}</span> : null}
                  {source.capability ? <span>Coverage: {coverageLabel(source.capability)}</span> : null}
                  {source.timestamp ? <span>Observed: {source.timestamp}</span> : null}
                  {typeof source.relevanceScore === "number" ? (
                    <span>Relevance: {source.relevanceScore}%</span>
                  ) : null}
                  {typeof source.confidenceScore === "number" ? (
                    <span>Confidence: {source.confidenceScore}%</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

