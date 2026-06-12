import type { NarrativeMetric } from "@/services/cmc/types"

type Props = {
  narratives: NarrativeMetric[]
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function cellStyle(v: number) {
  const t = clamp01(v / 100)
  const alpha = 0.08 + t * 0.30
  return { backgroundColor: `rgba(74, 110, 255, ${alpha})` }
}

export function NarrativeHeatmap({ narratives }: Props) {
  const rows = narratives.slice().sort((a, b) => b.strength - a.strength).slice(0, 10)

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="grid grid-cols-[160px_repeat(4,1fr)] bg-background/20 text-xs">
        <div className="px-3 py-2 text-muted-foreground">Narrativa</div>
        <div className="px-3 py-2 text-muted-foreground">Strength</div>
        <div className="px-3 py-2 text-muted-foreground">Velocity</div>
        <div className="px-3 py-2 text-muted-foreground">Growth</div>
        <div className="px-3 py-2 text-muted-foreground">Rotation</div>
      </div>

      <div className="divide-y divide-border">
        {rows.map((n) => (
          <div
            key={n.name}
            className="grid grid-cols-[160px_repeat(4,1fr)] bg-background/30 text-sm"
          >
            <div className="px-3 py-2">
              <div className="truncate font-medium">{n.name}</div>
            </div>
            <div className="px-3 py-2">
              <div className="rounded-md border px-2 py-1" style={cellStyle(n.strength)}>
                {Math.round(n.strength)}
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="rounded-md border px-2 py-1" style={cellStyle(n.velocity)}>
                {Math.round(n.velocity)}
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="rounded-md border px-2 py-1" style={cellStyle(n.growth)}>
                {Math.round(n.growth)}
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="rounded-md border px-2 py-1" style={cellStyle(n.rotationScore)}>
                {Math.round(n.rotationScore)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

