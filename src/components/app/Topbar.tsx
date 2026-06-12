import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { Command, Moon, Search, Sun } from "lucide-react"

import { IntelligenceStatusBadge } from "@/components/app/IntelligenceStatusBadge"
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher"
import { useGlobalSearch } from "@/components/app/GlobalSearchProvider"
import { useTheme } from "@/hooks/useTheme"
import { useI18n } from "@/i18n/I18nProvider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const TITLES: Record<string, { titleKey: string; title: string; kickerKey?: string; kicker?: string }> = {
  "/dashboard": { titleKey: "nav.dashboard", title: "Dashboard", kickerKey: "topbar.kickers.dashboard", kicker: "Today’s alpha" },
  "/hypotheses": { titleKey: "nav.hypotheses", title: "Hypotheses", kickerKey: "topbar.kickers.hypotheses", kicker: "Explainable research" },
  "/market-memory": { titleKey: "nav.marketMemory", title: "Market Memory", kickerKey: "topbar.kickers.marketMemory", kicker: "Market snapshots" },
  "/market-replay": { titleKey: "nav.marketReplay", title: "Market Replay", kickerKey: "topbar.kickers.marketReplay", kicker: "Replay regimes" },
  "/strategy-lab": { titleKey: "nav.strategyLab", title: "Strategy Lab", kickerKey: "topbar.kickers.strategyLab", kicker: "Evolution pipeline" },
  "/research": { titleKey: "nav.research", title: "Research", kickerKey: "topbar.kickers.research", kicker: "Institutional reports" },
  "/cmc-coverage": { titleKey: "nav.cmcCoverage", title: "CMC Coverage", kickerKey: "topbar.kickers.cmcCoverage", kicker: "Coverage intelligence" },
  "/system-health": { titleKey: "nav.systemHealth", title: "System Health", kickerKey: "topbar.kickers.systemHealth", kicker: "Infrastructure readiness" },
  "/settings": { titleKey: "nav.settings", title: "Settings", kickerKey: "topbar.kickers.settings", kicker: "Preferences" },
}

export function Topbar() {
  const { pathname } = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const globalSearch = useGlobalSearch()
  const { t } = useI18n()

  const meta = useMemo(() => {
    if (TITLES[pathname]) return TITLES[pathname]
    if (pathname.startsWith("/hypotheses/")) {
      return {
        titleKey: "nav.hypotheses",
        title: "Hypothesis",
        kickerKey: "topbar.kickers.hypothesisDetail",
        kicker: "Evidence center",
      }
    }
    return { titleKey: "AlphaOS", title: "AlphaOS" }
  }, [pathname])

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/40 px-6 backdrop-blur-xl">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <div className="hidden h-9 w-9 items-center justify-center overflow-hidden rounded-lg border bg-card/60 p-1 md:flex">
            <img
              src="/AlphaOS_Logo.png"
              alt="AlphaOS"
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="font-display text-lg font-semibold tracking-tight">
            {t(meta.titleKey, meta.title)}
          </h1>
          {meta.kicker ? (
            <Badge variant="secondary">{t(meta.kickerKey ?? meta.kicker, meta.kicker)}</Badge>
          ) : null}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {t("topbar.subtitle", "Evidence-backed market research for high-conviction decisions.")}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <IntelligenceStatusBadge />
        <Button
          type="button"
          variant="outline"
          className="hidden h-8 items-center gap-2 px-3 md:flex"
          onClick={globalSearch.open}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs">{t("common.search", "Search")}</span>
          <span className="ml-2 flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            <Command className="h-3 w-3" />
            K
          </span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("common.themeToggle", "Toggle theme")}
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  )
}

