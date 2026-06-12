import { Badge } from "@/components/ui/badge"
import type { AlphaScoreResult } from "@/services/alphaScoreService"

type AlphaScoreBadgeProps = {
  score: number | AlphaScoreResult
  compact?: boolean
}

function resolveVariant(value: number) {
  if (value >= 80) return "default"
  if (value >= 60) return "outline" as const
  return "secondary" as const
}

export function AlphaScoreBadge({ score, compact = false }: AlphaScoreBadgeProps) {
  const resolved = typeof score === "number" ? score : score.score

  return (
    <Badge variant={resolveVariant(resolved)}>
      {compact ? `Alpha ${resolved}` : `Alpha Score ${resolved}/100`}
    </Badge>
  )
}
