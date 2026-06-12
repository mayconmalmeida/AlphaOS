import { TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { NarrativeMetric } from "@/services/cmc/types"

type Props = {
  narratives: NarrativeMetric[]
}

export function NarrativeRankings({ narratives }: Props) {
  const emerging = narratives
    .slice()
    .sort((a, b) => b.velocity + b.growth - (a.velocity + a.growth))
    .slice(0, 5)

  const losing = narratives
    .slice()
    .sort((a, b) => a.growth - b.growth)
    .slice(0, 5)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border bg-background/30 p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <div className="text-sm font-medium">Top Emerging</div>
        </div>
        <div className="mt-3 space-y-2">
          {emerging.map((n) => (
            <div key={n.name} className="flex items-center justify-between rounded-lg border bg-card/50 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm">{n.name}</div>
                <div className="text-xs text-muted-foreground">
                  Velocity {Math.round(n.velocity)} · Growth {Math.round(n.growth)}
                </div>
              </div>
              <Badge>+{Math.round((n.velocity + n.growth) / 2)}</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-background/30 p-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm font-medium">Top Losing</div>
        </div>
        <div className="mt-3 space-y-2">
          {losing.map((n) => (
            <div key={n.name} className="flex items-center justify-between rounded-lg border bg-card/50 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm">{n.name}</div>
                <div className="text-xs text-muted-foreground">
                  Growth {Math.round(n.growth)} · Rotation {Math.round(n.rotationScore)}
                </div>
              </div>
              <Badge variant="secondary">{Math.round(n.growth)}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

