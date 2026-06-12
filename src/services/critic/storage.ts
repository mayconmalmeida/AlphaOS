import type { CriticReport } from "@/services/critic/types"

const REPORTS_KEY = "alphaos.critic.reports"

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function readJson<T>(key: string): T[] {
  if (!canUseStorage()) return []
  const raw = window.localStorage.getItem(key)
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeJson<T>(key: string, value: T[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

type StoredReport = CriticReport & { cachedAt: number }

export const criticStorage = {
  get(strategyId: string): CriticReport | null {
    const reports = readJson<StoredReport>(REPORTS_KEY)
    const found = reports.find((r) => r.strategyId === strategyId)
    return found ?? null
  },
  upsert(report: CriticReport) {
    const reports = readJson<StoredReport>(REPORTS_KEY)
    const next: StoredReport = { ...report, cachedAt: Date.now() }
    const merged = [next, ...reports.filter((r) => r.strategyId !== report.strategyId)]
    writeJson(REPORTS_KEY, merged)
    return report
  },
}

