import type { CmcProvider } from "@/services/cmc/provider"
import {
  mockCategories,
  mockMarketPulse,
  mockNarratives,
  mockNews,
  mockQuotes,
  mockTechnicals,
} from "@/services/cmc/mockData"

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function createMockCmcProvider(options?: { delayMs?: number }): CmcProvider {
  const delayMs = options?.delayMs ?? 250
  return {
    async getMarketPulse() {
      await sleep(delayMs)
      return mockMarketPulse
    },
    async getNarratives() {
      await sleep(delayMs)
      return mockNarratives
    },
    async getNews() {
      await sleep(delayMs)
      return mockNews
    },
    async getCategories() {
      await sleep(delayMs)
      return mockCategories
    },
    async getTechnicals(symbols) {
      await sleep(delayMs)
      const set = new Set(symbols.map((s) => s.toUpperCase()))
      return mockTechnicals.filter((item) => set.has(item.symbol.toUpperCase()))
    },
    async getQuotes(symbols) {
      await sleep(delayMs)
      const set = new Set(symbols.map((s) => s.toUpperCase()))
      return mockQuotes.filter((q) => set.has(q.symbol.toUpperCase()))
    },
  }
}

