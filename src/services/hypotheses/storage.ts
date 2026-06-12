import type { HypothesisDetail } from "@/services/hypotheses/types"

const GENERATED_KEY = "alphaos.hypotheses.generated"

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

export const hypothesesStorage = {
  getGenerated() {
    return readJson<HypothesisDetail>(GENERATED_KEY)
  },
  upsertGenerated(hypothesis: HypothesisDetail) {
    const current = readJson<HypothesisDetail>(GENERATED_KEY)
    const next = [hypothesis, ...current.filter((h) => h.id !== hypothesis.id)]
    writeJson(GENERATED_KEY, next)
    return next
  },
  clearGenerated() {
    writeJson<HypothesisDetail>(GENERATED_KEY, [])
  },
}

