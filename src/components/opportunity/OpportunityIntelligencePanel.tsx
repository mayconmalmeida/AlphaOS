import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { OpportunityIntelligence } from "@/services/opportunityIntelligence"

export function OpportunityIntelligencePanel({
  intelligence,
  title = "Opportunity Intelligence",
  description = "Narrative exposure, market conviction, beneficiaries, and thesis risk in one research view.",
}: {
  intelligence: OpportunityIntelligence
  title?: string
  description?: string
}) {
  const breakdown = intelligence.market_conviction_breakdown

  return (
    <Card className="bg-card/40">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Conviction {intelligence.conviction_score}</Badge>
            <Badge variant="secondary">{intelligence.narrative_momentum}</Badge>
            <Badge variant="outline">{intelligence.capital_rotation}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border bg-background/35 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Research View</div>
          <div className="mt-2 font-display text-xl font-semibold tracking-tight">
            {intelligence.narrative}
          </div>
          <div className="mt-2 text-sm leading-6 text-foreground/90">
            {intelligence.narrative_explanation}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Narrative Momentum</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {breakdown.narrative_momentum}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Category Rotation</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {breakdown.category_rotation}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Technical Confirmation</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {breakdown.technical_confirmation}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Sentiment Alignment</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {breakdown.sentiment_alignment}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs text-muted-foreground">Market Context</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {breakdown.market_context}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Potential Beneficiaries
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {intelligence.potential_beneficiaries.map((asset) => (
                  <Badge key={asset} variant="secondary">
                    {asset}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                These assets are shown as narrative exposure candidates, not investment recommendations.
              </div>
            </div>
          </div>
          <div className="xl:col-span-7">
            <div className="rounded-xl border bg-background/35 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Why These Assets
              </div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-foreground/90">
                {intelligence.why_these_assets.map((item) => (
                  <div key={item} className="rounded-lg border bg-card/40 px-3 py-2">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Risk Factors</div>
            <div className="mt-3 space-y-2 text-sm leading-6 text-foreground/90">
              {intelligence.risk_factors.map((item) => (
                <div key={item} className="rounded-lg border bg-card/40 px-3 py-2">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-background/35 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Invalidating Conditions
            </div>
            <div className="mt-3 space-y-2 text-sm leading-6 text-foreground/90">
              {intelligence.invalidating_conditions.map((item) => (
                <div key={item} className="rounded-lg border bg-card/40 px-3 py-2">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-background/35 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Powered by CoinMarketCap Intelligence
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {intelligence.coinmarketcap_inputs_used.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Research and simulation only. Not financial advice.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
