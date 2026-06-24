import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { Command, Menu, Moon, Search, Sun } from "lucide-react"

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
  "/cmc-coverage": { titleKey: "nav.cmcCoverage", title: "CMC Intelligence", kickerKey: "topbar.kickers.cmcCoverage", kicker: "Intelligence layer" },
  "/cmc-intelligence": { titleKey: "nav.cmcCoverage", title: "CMC Intelligence", kickerKey: "topbar.kickers.cmcCoverage", kicker: "Intelligence layer" },
  "/system-health": { titleKey: "nav.systemHealth", title: "System Health", kickerKey: "topbar.kickers.systemHealth", kicker: "Infrastructure readiness" },
  "/settings": { titleKey: "nav.settings", title: "Settings", kickerKey: "topbar.kickers.settings", kicker: "Preferences" },
}

export function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
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
    <header className="border-b bg-background/55 px-4 py-2 backdrop-blur-xl sm:px-5 lg:px-6">
      <div className="flex min-h-8 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 lg:hidden"
              aria-label="Open navigation"
              onClick={onOpenMenu}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="hidden h-9 w-9 items-center justify-center overflow-hidden rounded-lg border bg-card/60 p-1 sm:flex">
              <img
                src="/AlphaOS_Logo.png"
                alt="AlphaOS"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-base font-semibold tracking-tight sm:text-lg">
                {t(meta.titleKey, meta.title)}
              </h1>
              <div className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                {t("topbar.subtitle", "Evidence-backed market research for high-conviction decisions.")}
              </div>
            </div>
            {meta.kicker ? (
              <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
                {t(meta.kickerKey ?? meta.kicker, meta.kicker)}
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <IntelligenceStatusBadge compact />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={globalSearch.open}
            aria-label={t("common.search", "Search")}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
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
      </div>
    </header>
  )
}

