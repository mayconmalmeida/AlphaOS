import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/i18n/I18nProvider"
import type { EvidenceGraphEdge, EvidenceGraphNode } from "@/services/evidence/types"

type EvidenceGraphProps = {
  title?: string
  description?: string
  nodes: EvidenceGraphNode[]
  edges: EvidenceGraphEdge[]
}

const COLORS: Record<EvidenceGraphNode["kind"], string> = {
  market: "#60a5fa",
  narrative: "#a78bfa",
  hypothesis: "#f59e0b",
  evidence: "#22c55e",
  historical: "#f97316",
  category: "#14b8a6",
  technical: "#06b6d4",
  sentiment: "#e879f9",
  news: "#ef4444",
}

export function EvidenceGraph({
  title,
  description,
  nodes,
  edges,
}: EvidenceGraphProps) {
  const { t } = useI18n()
  const [selected, setSelected] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)

  const activeLinks = useMemo(
    () => edges.filter((edge) => edge.from === selected || edge.to === selected),
    [edges, selected]
  )

  return (
    <Card className="bg-card/40">
      <CardHeader>
        <CardTitle>{title ?? t("evidence.graph", "Evidence Graph")}</CardTitle>
        <CardDescription>
          {description ??
            "Current market state, narratives, historical analogues, and AI evidence connected in one graph."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Zoom {Math.round(zoom * 100)}%</Badge>
          <Badge variant="outline">Nodes {nodes.length}</Badge>
          <Badge variant="outline">Edges {edges.length}</Badge>
        </div>

        <div
          className="hidden overflow-x-auto rounded-xl border bg-background/35 md:block"
          onWheel={(event) => {
            event.preventDefault()
            setZoom((current) => Math.max(0.7, Math.min(1.8, current + (event.deltaY > 0 ? -0.08 : 0.08))))
          }}
          onMouseDown={(event) => setDragStart({ x: event.clientX - offset.x, y: event.clientY - offset.y })}
          onMouseMove={(event) => {
            if (!dragStart) return
            setOffset({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y })
          }}
          onMouseUp={() => setDragStart(null)}
          onMouseLeave={() => setDragStart(null)}
        >
          <svg
            viewBox="0 0 1100 560"
            className="h-[360px] min-w-[760px] w-full cursor-grab active:cursor-grabbing lg:h-[460px]"
          >
            <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
              {edges.map((edge) => {
                const from = nodes.find((node) => node.id === edge.from)
                const to = nodes.find((node) => node.id === edge.to)
                if (!from || !to) return null
                const active = selected ? edge.from === selected || edge.to === selected : true
                return (
                  <g key={edge.id}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={active ? "#94a3b8" : "#475569"}
                      strokeWidth={active ? 2.2 : 1.2}
                      strokeOpacity={active ? 0.9 : 0.4}
                    />
                    <text
                      x={(from.x + to.x) / 2}
                      y={(from.y + to.y) / 2 - 8}
                      fill="#94a3b8"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {t(`evidence.${edge.kind}`, edge.kind)}
                    </text>
                  </g>
                )
              })}

              {nodes.map((node) => {
                const active =
                  !selected ||
                  node.id === selected ||
                  activeLinks.some((edge) => edge.from === node.id || edge.to === node.id)

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x} ${node.y})`}
                    onClick={() => setSelected(node.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle
                      r={selected === node.id ? 34 : 28}
                      fill={COLORS[node.kind]}
                      fillOpacity={active ? 0.92 : 0.45}
                      stroke="#0f172a"
                      strokeWidth={2}
                    />
                    <text
                      y={4}
                      fill="#0f172a"
                      fontSize="10"
                      textAnchor="middle"
                      className="font-medium"
                    >
                      {node.label.slice(0, 14)}
                    </text>
                    <text y={48} fill="#cbd5e1" fontSize="10" textAnchor="middle">
                      {node.confidence ?? 0}% / {node.relevance ?? 0}%
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        <div className="space-y-3 md:hidden">
          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelected(node.id)}
              className="w-full rounded-xl border bg-background/35 p-4 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">{node.label}</div>
                <Badge variant="outline">{node.kind}</Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Confidence {node.confidence ?? 0}% · Relevance {node.relevance ?? 0}%
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
            {nodes.find((node) => node.id === selected)?.label}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

