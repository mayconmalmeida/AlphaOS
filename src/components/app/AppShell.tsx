import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { GlobalSearchProvider } from "@/components/app/GlobalSearchProvider"
import { Sidebar } from "@/components/app/Sidebar"
import { Topbar } from "@/components/app/Topbar"
import { useI18n } from "@/i18n/I18nProvider"

export function AppShell() {
  const location = useLocation()
  const { t } = useI18n()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <GlobalSearchProvider>
      <div className="min-h-screen overflow-x-hidden bg-background">
        {mobileNavOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative h-full w-[min(84vw,320px)]">
              <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
          <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
            <Sidebar />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="sticky top-0 z-30">
              <Topbar onOpenMenu={() => setMobileNavOpen(true)} />
            </div>
            <main className="flex-1 px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
              <div key={location.pathname} className="route-enter mx-auto w-full max-w-7xl">
                <Outlet />
              </div>
              <div className="mx-auto mt-6 w-full max-w-7xl rounded-xl border bg-card/30 px-4 py-3 text-xs text-muted-foreground">
                {t("common.disclaimer", "Research and simulation only. Not financial advice.")}
              </div>
            </main>
          </div>
        </div>
      </div>
    </GlobalSearchProvider>
  )
}

