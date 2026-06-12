import type { ComponentType } from "react"
import { NavLink } from "react-router-dom"
import {
  Brain,
  Database,
  FileText,
  FlaskConical,
  LayoutDashboard,
  PlayCircle,
  Settings,
} from "lucide-react"

import { useI18n } from "@/i18n/I18nProvider"
import { cn } from "@/lib/utils"

type NavItem = {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
}

const NAV: Array<NavItem & { key: string }> = [
  { to: "/dashboard", key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hypotheses", key: "hypotheses", label: "Hypotheses", icon: Brain },
  { to: "/market-memory", key: "marketMemory", label: "Memory", icon: Database },
  { to: "/market-replay", key: "marketReplay", label: "Replay", icon: PlayCircle },
  { to: "/strategy-lab", key: "strategyLab", label: "Strategy", icon: FlaskConical },
  { to: "/research", key: "research", label: "Research", icon: FileText },
  { to: "/settings", key: "settings", label: "Settings", icon: Settings },
]

export function MobileNav() {
  const { t } = useI18n()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/90 px-2 py-2 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-7 gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] transition-colors",
                "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                isActive && "bg-accent text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="truncate">{t(`nav.${item.key}`, item.label)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

