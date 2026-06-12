import { ResponsiveContainer, Radar, RadarChart, PolarAngleAxis, PolarGrid, Tooltip } from "recharts"

import type { NarrativeMetric } from "@/services/cmc/types"

type Props = {
  narratives: NarrativeMetric[]
}

export function NarrativeRadarChart({ narratives }: Props) {
  const data = narratives
    .slice()
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8)
    .map((n) => ({ name: n.name, strength: n.strength }))

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="78%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <Radar
            dataKey="strength"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.18}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 12,
              color: "hsl(var(--popover-foreground))",
              fontSize: 12,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

