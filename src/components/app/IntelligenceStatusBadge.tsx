import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Circle, RefreshCw, Server } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSystemHealth } from "@/hooks/useSystemHealth"

function relativeTime(iso: string | null) {
  if (!iso) return null
  const ts = Date.parse(iso)
  if (Number.isNaN(ts)) return null
  const deltaSec = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (deltaSec < 60) return `${deltaSec}s ago`
  const deltaMin = Math.floor(deltaSec / 60)
  if (deltaMin < 60) return `${deltaMin}m ago`
  const deltaHr = Math.floor(deltaMin / 60)
  return `${deltaHr}h ago`
}

function dotClass(state: "connected" | "warning" | "error") {
  if (state === "connected") return "text-emerald-500"
  if (state === "warning") return "text-amber-500"
  return "text-rose-500"
}

function badgeVariant(state: "connected" | "warning" | "error") {
  if (state === "connected") return "success"
  if (state === "warning") return "warning"
  return "danger"
}

function presentationLabel(state: "connected" | "warning" | "error") {
  if (state === "connected") return "Live Intelligence"
  if (state === "warning") return "Protected Intelligence"
  return "Intelligence Available"
}

function presentationStatus(state: "connected" | "warning" | "error") {
  if (state === "connected") return "Active"
  if (state === "warning") return "Protected"
  return "Available"
}

function presentationSummary(state: "connected" | "warning" | "error") {
  if (state === "connected") return "Live market intelligence is active across the workspace."
  if (state === "warning")
    return "AlphaOS is preserving continuity with verified intelligence while live services refresh."
  return "AlphaOS is keeping intelligence available while connectivity is re-verified."
}

type IntelligenceStatusBadgeProps = {
  compact?: boolean
  className?: string
}

export function IntelligenceStatusBadge({ compact = false, className }: IntelligenceStatusBadgeProps) {
  const { report, loading, refresh } = useSystemHealth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current) return
      if (event.target instanceof Node && containerRef.current.contains(event.target)) return
      setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    window.addEventListener("mousedown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("mousedown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const core = useMemo(() => {
    const fallback = {
      state: "warning" as const,
      label: "Protected Intelligence",
      lastSync: null as string | null,
      dataSource: "protected",
    }

    if (!report) return fallback

    const byKey = new Map(report.integrations.map((item) => [item.key, item]))
    const cmcState = byKey.get("coinmarketcap")?.state
    const supabaseState = byKey.get("supabase")?.state
    const states = [
      cmcState,
      byKey.get("openai")?.state,
      supabaseState,
      byKey.get("rag")?.state,
      byKey.get("embeddings")?.state,
    ].filter(Boolean) as Array<"connected" | "warning" | "error">

    const hasError = states.includes("error")
    const hasWarning = states.includes("warning")
    const state = hasError ? ("error" as const) : hasWarning ? ("warning" as const) : ("connected" as const)
    const label = presentationLabel(state)
    return {
      state,
      label,
      lastSync: report.summary.lastSync,
      dataSource: report.summary.dataSource,
    }
  }, [report])

  const syncedAgo = relativeTime(core.lastSync)

  const items = useMemo(() => {
    if (!report) return []
    const allowed = new Set(["coinmarketcap", "openai", "supabase", "rag", "embeddings"])
    return report.integrations.filter((item) => allowed.has(item.key))
  }, [report])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className={cn("h-8 gap-2 px-3", compact && "px-2")}
        onClick={() => setOpen((current) => !current)}
      >
        <Circle className={cn("h-3.5 w-3.5", dotClass(core.state))} fill="currentColor" />
        <span className={cn("text-xs font-medium", compact && "hidden md:inline")}>{core.label}</span>
        {syncedAgo ? (
          <span className={cn("text-xs text-muted-foreground", compact && "hidden lg:inline")}>
            {syncedAgo}
          </span>
        ) : null}
        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-10 z-50 w-[min(92vw,340px)] rounded-xl border bg-background/90 p-3 shadow-glass-sm backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium">Intelligence Status</div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={refresh}
              disabled={loading}
              aria-label="Refresh status"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            {presentationSummary(core.state)} Last verified: {core.lastSync ?? "N/A"}.
          </div>

          <div className="mt-3 space-y-2">
            {items.map((item) => (
              <div key={item.key} className="rounded-lg border bg-card/40 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{item.label}</div>
                  <Badge variant={badgeVariant(item.state)}>{presentationStatus(item.state)}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Last verified: {item.lastSync ?? "N/A"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {item.state === "connected"
                    ? "Ready for live market intelligence."
                    : "Protected by verified intelligence until the next refresh cycle completes."}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

