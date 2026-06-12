import { strategiesStorage } from "@/services/strategies/storage"
import type { StrategyCandidate } from "@/services/strategies/types"
import { listJsonPayloads, replaceJsonPayloadsForKey } from "@/services/shared/repository"

const TABLE = "strategy_candidates"

export const strategiesRepository = {
  async listGenerated() {
    const remote = await listJsonPayloads<StrategyCandidate>(TABLE)
    if (remote) {
      const grouped = new Map<string, StrategyCandidate[]>()
      remote.forEach((item) => {
        const next = grouped.get(item.hypothesisId) ?? []
        next.push(item)
        grouped.set(item.hypothesisId, next)
      })
      grouped.forEach((items, hypothesisId) => {
        strategiesStorage.replaceForHypothesis(hypothesisId, items)
      })
      return remote
    }
    return strategiesStorage.getGenerated()
  },
  async replaceForHypothesis(hypothesisId: string, strategies: StrategyCandidate[]) {
    const ok = await replaceJsonPayloadsForKey(
      TABLE,
      "hypothesis_id",
      hypothesisId,
      strategies,
      (item) => ({
        hypothesis_id: item.hypothesisId,
        status: item.status,
        pipeline_stage: item.pipelineStage,
        score: item.score,
      })
    )
    strategiesStorage.replaceForHypothesis(hypothesisId, strategies)
    return ok
  },
}

