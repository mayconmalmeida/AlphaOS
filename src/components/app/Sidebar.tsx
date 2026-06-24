import { NavLink } from "react-router-dom"
import type { ComponentType } from "react"
import {
  Database,
  FileText,
  History,
  LayoutDashboard,
  PlayCircle,
  Route,
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
  { to: "/journey", key: "guidedJourney", label: "Guided Journey", icon: Route },
  { to: "/research", key: "research", label: "Research", icon: FileText },
  { to: "/market-memory", key: "marketMemory", label: "Market Memory", icon: Database },
  { to: "/market-replay", key: "marketReplay", label: "Market Replay", icon: PlayCircle },
  { to: "/cmc-intelligence", key: "cmcCoverage", label: "CMC Intelligence", icon: History },
]

export function Sidebar({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const { t } = useI18n()

  return (
    <aside
      className={[
        "flex h-full flex-col border-r bg-background/60 backdrop-blur-xl",
        mobile ? "w-[min(84vw,312px)] shadow-xl" : "w-[232px] xl:w-[248px]",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg border bg-card/60 p-1">
          <img
            src="/AlphaOS_Logo.png"
            alt="AlphaOS"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="font-display text-sm font-semibold leading-tight tracking-tight">
            AlphaOS
          </div>
          <div className="truncate text-xs text-muted-foreground">
            Market Intelligence OS
          </div>
        </div>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors",
                "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                isActive && "bg-accent/55 text-foreground"
              )
            }
          >
            <item.icon className="h-3.5 w-3.5 opacity-80" />
            <span className="truncate">{t(`nav.${item.key}`, item.label)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-lg border bg-background/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <History className="h-3.5 w-3.5 opacity-80" />
              <span>{t("shell.intelligenceStatus", "Intelligence Status")}</span>
            </div>
            <IntelligenceStatusBadge compact />
          </div>
          <div className="mt-2 text-xs leading-snug text-muted-foreground">
            {t(
              "shell.intelligenceDescription",
              "Powered by CoinMarketCap Intelligence with evidence provenance and guided market research."
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

