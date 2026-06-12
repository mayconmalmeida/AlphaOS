import { hypothesesStorage } from "@/services/hypotheses/storage"
import { buildAlphaScore } from "@/services/alphaScoreService"
import type { HypothesisDetail } from "@/services/hypotheses/types"
import {
  getJsonPayloadById,
  listJsonPayloads,
  upsertJsonPayload,
} from "@/services/shared/repository"

const TABLE = "generated_hypotheses"

export const hypothesesRepository = {
  async listGenerated() {
    const remote = await listJsonPayloads<HypothesisDetail>(TABLE)
    if (remote) {
      remote.forEach((item) => hypothesesStorage.upsertGenerated(item))
      return remote
    }
    return hypothesesStorage.getGenerated()
  },
  async getById(id: string) {
    const remote = await getJsonPayloadById<HypothesisDetail>(TABLE, "id", id)
    if (remote) {
      hypothesesStorage.upsertGenerated(remote)
      return remote
    }
    return hypothesesStorage.getGenerated().find((item) => item.id === id) ?? null
  },
  async upsert(detail: HypothesisDetail) {
    const alphaScore = buildAlphaScore(detail)
    const ok = await upsertJsonPayload(TABLE, detail, {
      title: detail.title,
      status: detail.status,
      origin: detail.origin ?? "generated",
      alpha_score: alphaScore.score,
      why_now: detail.whyNow,
      invalidating_conditions: detail.invalidatingConditions,
    })

    hypothesesStorage.upsertGenerated(detail)
    return ok
  },
}

