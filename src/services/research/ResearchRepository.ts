import { researchStorage } from "@/services/research/storage"
import type { ResearchReport } from "@/services/research/types"
import {
  getJsonPayloadById,
  listJsonPayloads,
  upsertJsonPayload,
} from "@/services/shared/repository"

const TABLE = "research_reports"

export const researchRepository = {
  async listGenerated() {
    const remote = await listJsonPayloads<ResearchReport>(TABLE)
    if (remote) {
      remote.forEach((item) => researchStorage.upsertGenerated(item))
      return remote
    }
    return researchStorage.getGenerated()
  },
  async getById(id: string) {
    const remote = await getJsonPayloadById<ResearchReport>(TABLE, "id", id)
    if (remote) {
      researchStorage.upsertGenerated(remote)
      return remote
    }
    return researchStorage.getGenerated().find((item) => item.id === id) ?? null
  },
  async upsert(report: ResearchReport) {
    const ok = await upsertJsonPayload(TABLE, report, {
      title: report.title,
      report_type: report.reportType,
      tone: report.tone,
    })
    researchStorage.upsertGenerated(report)
    return ok
  },
}

