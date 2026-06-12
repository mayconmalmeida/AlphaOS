import type { StrategyCandidate } from "@/services/strategies/types"

const GENERATED_KEY = "alphaos.strategies.generated"

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

export const strategiesStorage = {
  getGenerated() {
    return readJson<StrategyCandidate>(GENERATED_KEY)
  },
  replaceForHypothesis(hypothesisId: string, strategies: StrategyCandidate[]) {
    const current = readJson<StrategyCandidate>(GENERATED_KEY)
    const next = [
      ...strategies,
      ...current.filter((item) => item.hypothesisId !== hypothesisId),
    ]
    writeJson(GENERATED_KEY, next)
    return next
  },
}

