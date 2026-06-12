import { NavLink } from "react-router-dom"
import type { ComponentType } from "react"
import {
  Brain,
  Database,
  FileText,
  FlaskConical,
  History,
  LayoutDashboard,
  PlayCircle,
  Settings,
  Stethoscope,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { IntelligenceStatusBadge } from "@/components/app/IntelligenceStatusBadge"
import { useI18n } from "@/i18n/I18nProvider"

type NavItem = {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

const NAV: Array<NavItem & { key: string }> = [
  { to: "/dashboard", key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hypotheses", key: "hypotheses", label: "Hypotheses", icon: Brain },
  { to: "/market-memory", key: "marketMemory", label: "Market Memory", icon: Database },
  { to: "/market-replay", key: "marketReplay", label: "Market Replay", icon: PlayCircle },
  { to: "/strategy-lab", key: "strategyLab", label: "Strategy Lab", icon: FlaskConical },
  { to: "/research", key: "research", label: "Research", icon: FileText },
  { to: "/cmc-coverage", key: "cmcCoverage", label: "CMC Coverage", icon: History },
  { to: "/system-health", key: "systemHealth", label: "System Health", icon: Stethoscope },
  { to: "/settings", key: "settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const { t } = useI18n()

  return (
    <aside className="flex h-full w-[280px] flex-col border-r bg-background/30 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg border bg-card/70 p-1 shadow-glass-sm">
          <img
            src="/AlphaOS_Logo.png"
            alt="AlphaOS"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="font-display text-base font-semibold leading-tight tracking-tight">
            AlphaOS
          </div>
          <div className="truncate text-xs text-muted-foreground">
            Market Intelligence OS
          </div>
        </div>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                isActive && "bg-accent text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 opacity-90" />
            <span className="truncate">{t(`nav.${item.key}`, item.label)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-5 pb-5">
        <div className="rounded-xl border bg-card/60 p-4 shadow-glass-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <History className="h-3.5 w-3.5" />
              <span>{t("shell.intelligenceStatus", "Intelligence Status")}</span>
            </div>
            <IntelligenceStatusBadge compact />
          </div>
          <div className="mt-2 text-sm leading-snug text-foreground/90">
            {t(
              "shell.intelligenceDescription",
              "Powered by CoinMarketCap Intelligence with explicit fallback and provenance when live connectivity is unavailable."
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

