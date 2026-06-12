import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { OpportunityIntelligence } from "@/services/opportunityIntelligence"

type OpportunityRadarItem = OpportunityIntelligence & {
  rank: number
}

export function OpportunityRadar({
  items,
}: {
  items: OpportunityRadarItem[]
}) {
  return (
    <Card className="bg-card/40">
      <CardHeader>
        <CardTitle>Opportunity Radar</CardTitle>
        <CardDescription>
          Ranked opportunity intelligence showing conviction, rotation, and narrative exposure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={`${item.rank}-${item.narrative}`} className="rounded-xl border bg-background/30 p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>#{item.rank}</Badge>
                  <div className="font-display text-base font-semibold tracking-tight">
                    {item.narrative}
                  </div>
                </div>
                <div className="mt-2 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                  {item.narrative_explanation}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Badge variant="secondary">Conviction {item.conviction_score}</Badge>
                <Badge variant="outline">{item.narrative_momentum}</Badge>
                <Badge variant="outline">{item.capital_rotation}</Badge>
              </div>
            </div>

            <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-lg border bg-card/40 px-3 py-2">
                <div className="text-[11px] text-muted-foreground">Research View</div>
                <div className="mt-1 text-[13px] leading-snug text-foreground/90">
                  {item.why_these_assets[0]}
                </div>
              </div>
              <div className="rounded-lg border bg-card/40 px-3 py-2">
                <div className="text-[11px] text-muted-foreground">Potential Beneficiaries</div>
                <div className="mt-1 text-[13px] leading-snug text-foreground/90">
                  {item.potential_beneficiaries.join(", ")}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-1 text-xs text-muted-foreground">
          Powered by CoinMarketCap Intelligence. Research and simulation only. Not financial advice.
        </div>
      </CardContent>
    </Card>
  )
}
