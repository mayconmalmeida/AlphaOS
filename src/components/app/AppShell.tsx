import { Outlet, useLocation } from "react-router-dom"

import { GlobalSearchProvider } from "@/components/app/GlobalSearchProvider"
import { MobileNav } from "@/components/app/MobileNav"
import { Sidebar } from "@/components/app/Sidebar"
import { Topbar } from "@/components/app/Topbar"
import { useI18n } from "@/i18n/I18nProvider"

export function AppShell() {
  const location = useLocation()
  const { t } = useI18n()

  return (
    <GlobalSearchProvider>
      <div className="min-h-screen">
        <div className="flex min-h-screen">
          <div className="sticky top-0 hidden h-screen md:block">
            <Sidebar />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="sticky top-0 z-10">
              <Topbar />
            </div>
            <main className="flex-1 px-4 py-4 pb-24 sm:px-6 sm:py-6 sm:pb-24 md:pb-8">
              <div key={location.pathname} className="route-enter">
                <Outlet />
              </div>
              <div className="mt-6 rounded-xl border bg-card/30 px-4 py-3 text-xs text-muted-foreground">
                {t("common.disclaimer", "Research and simulation only. Not financial advice.")}
              </div>
            </main>
          </div>
        </div>
        <MobileNav />
      </div>
    </GlobalSearchProvider>
  )
}

