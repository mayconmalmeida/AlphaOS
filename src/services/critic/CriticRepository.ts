import { criticStorage } from "@/services/critic/storage"
import type { CriticReport } from "@/services/critic/types"
import { getJsonPayloadById, upsertJsonPayload } from "@/services/shared/repository"

const TABLE = "critic_reports"

export const criticRepository = {
  async get(strategyId: string) {
    const remote = await getJsonPayloadById<CriticReport>(TABLE, "id", strategyId)
    if (remote) {
      criticStorage.upsert(remote)
      return remote
    }
    return criticStorage.get(strategyId)
  },
  async upsert(report: CriticReport) {
    const ok = await upsertJsonPayload(
      TABLE,
      { id: report.strategyId, ...report },
      {
        overall_status: report.overallStatus,
        score: report.score,
      }
    )
    criticStorage.upsert(report)
    return ok
  },
}

