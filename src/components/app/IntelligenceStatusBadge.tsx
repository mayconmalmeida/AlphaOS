import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

type IntelligenceStatusBadgeProps = {
  compact?: boolean
  className?: string
}

export function IntelligenceStatusBadge({ compact = false, className }: IntelligenceStatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-md border bg-background px-3 text-xs font-medium",
        compact && "px-2",
        className
      )}
    >
      <Circle className="h-3.5 w-3.5 text-emerald-500" fill="currentColor" />
      <span className={cn(compact && "hidden md:inline")}>Live Intelligence</span>
    </div>
  )
}
