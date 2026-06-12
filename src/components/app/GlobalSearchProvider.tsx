import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cmcServices } from "@/services/cmc"
import { hypothesesRepository } from "@/services/hypotheses/HypothesesRepository"
import { marketSnapshotsRepository } from "@/services/marketMemory/MarketSnapshotsRepository"
import { researchRepository } from "@/services/research/ResearchRepository"

type SearchItemType = "hypothesis" | "report" | "snapshot" | "narrative"

type SearchItem = {
  id: string
  type: SearchItemType
  title: string
  subtitle?: string
  route: string
  payload?: { snapshotId?: string }
}

type GlobalSearchContextValue = {
  open: () => void
  close: () => void
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null)

export function useGlobalSearch() {
  const ctx = useContext(GlobalSearchContext)
  if (!ctx) throw new Error("useGlobalSearch must be used within GlobalSearchProvider")
  return ctx
}

function typeLabel(type: SearchItemType) {
  switch (type) {
    case "hypothesis":
      return "Hypothesis"
    case "report":
      return "Report"
    case "snapshot":
      return "Snapshot"
    case "narrative":
      return "Narrative"
  }
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function matchScore(query: string, item: SearchItem) {
  const q = normalize(query)
  if (!q) return 0
  const hay = normalize(`${item.title} ${item.subtitle ?? ""}`)
  if (hay === q) return 100
  if (hay.startsWith(q)) return 85
  if (hay.includes(q)) return 65
  return 0
}

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => {
    setIsOpen(false)
    setQuery("")
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isK = event.key.toLowerCase() === "k"
      if (isK && event.ctrlKey) {
        event.preventDefault()
        setIsOpen(true)
      }
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    setLoading(true)

    Promise.all([
      hypothesesRepository.listGenerated(),
      researchRepository.listGenerated(),
      marketSnapshotsRepository.list(),
      cmcServices.narratives.getNarratives(),
    ])
      .then(([hypotheses, reports, snapshots, narrativesRes]) => {
        if (cancelled) return
        const next: SearchItem[] = [
          ...hypotheses.map((h) => ({
            id: h.id,
            type: "hypothesis" as const,
            title: h.title,
            subtitle: `Confidence ${h.confidence}% · Risk ${h.riskScore}`,
            route: `/hypotheses/${h.id}`,
          })),
          ...reports.map((r) => ({
            id: r.id,
            type: "report" as const,
            title: r.title,
            subtitle: `${r.reportType} · ${new Date(r.createdAt).toLocaleDateString()}`,
            route: `/research/reports/${r.id}`,
          })),
          ...snapshots.map((s) => ({
            id: s.id,
            type: "snapshot" as const,
            title: s.title,
            subtitle: `${s.date} · ${s.sourceMode ?? "fallback"}`,
            route: "/market-memory",
            payload: { snapshotId: s.id },
          })),
        ]

        if (narrativesRes.ok) {
          next.push(
            ...narrativesRes.data.map((n) => ({
              id: n.name,
              type: "narrative" as const,
              title: n.name,
              subtitle: `Strength ${Math.round(n.strength)} · Velocity ${Math.round(n.velocity)}`,
              route: "/dashboard",
            }))
          )
        }

        setItems(next)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  const results = useMemo(() => {
    if (!query.trim()) return items.slice(0, 12)
    return items
      .map((item) => ({ item, score: matchScore(query, item) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((row) => row.item)
  }, [items, query])

  const onSelect = useCallback(
    (item: SearchItem) => {
      if (item.type === "snapshot" && item.payload?.snapshotId) {
        window.sessionStorage.setItem("alphaos.market-memory.selected", item.payload.snapshotId)
      }
      close()
      navigate(item.route)
    },
    [close, navigate]
  )

  const value = useMemo(() => ({ open, close }), [open, close])

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-black/40 px-4 py-24 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border bg-background/95 shadow-glass-sm backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hypotheses, narratives, reports, market snapshots..."
                className="h-9 w-full bg-transparent text-sm text-foreground outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={close}
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[420px] overflow-y-auto p-2">
              {loading ? (
                <div className="rounded-xl border bg-card/40 p-4 text-sm text-muted-foreground">
                  Loading index...
                </div>
              ) : results.length === 0 ? (
                <div className="rounded-xl border bg-card/40 p-4 text-sm text-muted-foreground">
                  No results yet. Ingest market snapshots and generate hypotheses to populate Market Memory.
                </div>
              ) : (
                results.map((item) => (
                  <button
                    key={`${item.type}:${item.id}`}
                    type="button"
                    onClick={() => onSelect(item)}
                    className={cn(
                      "w-full rounded-xl border bg-background/40 px-3 py-3 text-left transition-colors",
                      "hover:bg-background/55"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{item.title}</div>
                        {item.subtitle ? (
                          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {item.subtitle}
                          </div>
                        ) : null}
                      </div>
                      <Badge variant="outline">{typeLabel(item.type)}</Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
              <span>Navigate with click · Close with Esc</span>
              <span className="rounded border px-2 py-1">Ctrl K</span>
            </div>
          </div>
        </div>
      ) : null}
    </GlobalSearchContext.Provider>
  )
}

