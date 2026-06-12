import type { EmbeddingJob, EmbeddingVectorRecord } from "@/services/embeddings/types"

const JOBS_KEY = "alphaos.embedding.jobs"
const RECORDS_KEY = "alphaos.embedding.records"

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

export const embeddingStorage = {
  getJobs() {
    return readJson<EmbeddingJob>(JOBS_KEY)
  },
  saveJobs(jobs: EmbeddingJob[]) {
    writeJson(JOBS_KEY, jobs)
  },
  getRecords() {
    return readJson<EmbeddingVectorRecord>(RECORDS_KEY)
  },
  saveRecords(records: EmbeddingVectorRecord[]) {
    writeJson(RECORDS_KEY, records)
  },
}

