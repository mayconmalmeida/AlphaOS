import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import { mockReplayScenarios } from "@/services/marketReplay/mockData"
import type { ReplayScenario } from "@/services/marketReplay/types"

export type MarketReplayService = {
  listScenarios(): Promise<ApiResult<ReplayScenario[]>>
  getScenarioById(id: string): Promise<ApiResult<ReplayScenario>>
}

export function createMarketReplayService(): MarketReplayService {
  return {
    async listScenarios() {
      return ok(mockReplayScenarios)
    },
    async getScenarioById(id) {
      const scenario = mockReplayScenarios.find((item) => item.id === id)
      if (!scenario) return err("Replay não encontrado", "REPLAY_NOT_FOUND")
      return ok(scenario)
    },
  }
}

export const marketReplayService = createMarketReplayService()

