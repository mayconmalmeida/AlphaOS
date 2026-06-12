import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useHypotheses } from "@/hooks/useHypotheses"
import { useI18n } from "@/i18n/I18nProvider"
import { useResearchCenter } from "@/hooks/useResearchCenter"
import { useCmcIntegration } from "@/hooks/useCmcIntegration"
import { useSystemHealth } from "@/hooks/useSystemHealth"

const COVERAGE = [
  {
    label: "Quotes",
    live: true,
    description: "Real-time pricing and market cap context anchor each opportunity in current market reality.",
  },
  {
    label: "Technicals",
    live: true,
    description: "Technical confirmation helps AlphaOS validate momentum, trend quality, and timing.",
  },
  {
    label: "News",
    live: true,
    description: "Headline flow adds catalyst awareness and keeps the research layer tied to what changed.",
  },
  {
    label: "Sentiment",
    live: true,
    description: "Sentiment signals help AlphaOS distinguish conviction, caution, and crowd positioning.",
  },
  {
    label: "Categories",
    live: true,
    description: "Category rotation reveals where leadership is forming across sectors and thematic groups.",
  },
  {
    label: "Narratives",
    live: true,
    description: "Narrative intelligence translates market activity into explainable themes and opportunity framing.",
  },
]

export default function CmcCoverage() {
  const { t } = useI18n()
  const cmcIntegration = useCmcIntegration()
  const hypotheses = useHypotheses()
  const research = useResearchCenter()
  const systemHealth = useSystemHealth()
  const byKey = new Map(systemHealth.report?.integrations.map((item) => [item.key, item]) ?? [])
  const cmcHealth = byKey.get("coinmarketcap") ?? null

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {t("nav.cmcCoverage", "CMC Intelligence")}
        </div>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
          {t("cmcCoverage.title", "CoinMarketCap Intelligence Layer")}
        </h2>
        <p className="mt-2 max-w-3xl text-[13px] leading-snug text-muted-foreground">
          {t(
            "cmcCoverage.subtitle",
            "See how CoinMarketCap powers market context, narrative intelligence, and research outputs across AlphaOS."
          )}
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="bg-card/40 lg:col-span-7">
          <CardHeader>
            <CardTitle>Capability Layer</CardTitle>
            <CardDescription>How CoinMarketCap intelligence enters AlphaOS and turns into product-ready insight.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {COVERAGE.map((item) => (
              (() => {
                const capabilityKey =
                  item.label === "Quotes"
                    ? "quotes"
                    : item.label === "Technicals"
                      ? "technicals"
                      : item.label === "News"
                        ? "news"
                        : item.label === "Sentiment"
                          ? "sentiment"
                          : item.label === "Categories"
                            ? "categories"
                            : item.label === "Narratives"
                              ? "narratives"
                              : null
                const runtime =
                  capabilityKey && capabilityKey in cmcIntegration.runtimeStatus
                    ? cmcIntegration.runtimeStatus[capabilityKey as keyof typeof cmcIntegration.runtimeStatus]
                    : null

                return (
              <div key={item.label} className="rounded-xl border bg-background/30 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[13px] font-medium">{item.label}</div>
                  <Badge
                    variant={
                      runtime?.source === "live"
                        ? "success"
                        : runtime?.source === "idle"
                          ? "outline"
                          : item.live
                          ? "warning"
                          : "outline"
                    }
                  >
                    {runtime?.source === "live"
                      ? "Live Intelligence"
                      : item.live
                        ? "Protected Intelligence"
                        : t("cmcCoverage.readiness", "Readiness")}
                  </Badge>
                </div>
                <div className="mt-2 text-[13px] leading-snug text-muted-foreground">
                    {item.description} Last verified: {runtime?.lastSync ?? "N/A"}.
                </div>
              </div>
                )
              })()
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/40 lg:col-span-5">
          <CardHeader>
            <CardTitle>Product Impact</CardTitle>
            <CardDescription>What the CoinMarketCap intelligence layer is already powering inside AlphaOS.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {[
              {
                label: t("cmcCoverage.documentsProcessed", "Intelligence records"),
                value: systemHealth.report?.summary.totalDocuments ?? 0,
              },
              { label: "Market states indexed", value: systemHealth.report?.summary.totalMarketSnapshots ?? 0 },
              { label: t("cmcCoverage.evidenceGenerated", "Evidence trails"), value: hypotheses.data.reduce((acc, item) => acc + item.evidenceCount, 0) || 0 },
              { label: t("cmcCoverage.hypothesesGenerated", "Opportunity briefs"), value: hypotheses.data.length },
              { label: t("cmcCoverage.reportsGenerated", "Research reports"), value: research.reports.length },
              { label: "Strategy pathways", value: systemHealth.report?.summary.totalStrategies ?? 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border bg-background/30 p-3">
                <div className="text-[11px] text-muted-foreground">{item.label}</div>
                <div className="mt-1 font-display text-xl font-semibold tracking-tight">{item.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>Executive Readiness</CardTitle>
          <CardDescription>High-level confidence inputs showing that CoinMarketCap intelligence is feeding the product experience.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          <Badge
            variant={
              cmcHealth?.state === "connected"
                ? "success"
                : cmcHealth?.state === "warning"
                  ? "warning"
                  : cmcHealth?.state === "error"
                    ? "danger"
                    : "outline"
            }
          >
            {cmcHealth?.state === "connected" ? "CoinMarketCap Intelligence Connected" : "CoinMarketCap Intelligence Protected"}
          </Badge>
          <Badge variant="outline">Last verified {systemHealth.report?.summary.lastSync ?? "N/A"}</Badge>
          <Badge variant="outline">
            {cmcIntegration.runtimeStatus.sentiment.source === "live" ? "Intelligence Active" : "Protected Intelligence"}
          </Badge>
          <Badge variant="outline">Market data ready</Badge>
          <Badge variant="outline">Research ready</Badge>
          <Badge variant="outline">Narrative coverage active</Badge>
          <Badge variant="outline">Records {systemHealth.report?.summary.totalDocuments ?? 0}</Badge>
        </CardContent>
      </Card>
    </div>
  )
}

