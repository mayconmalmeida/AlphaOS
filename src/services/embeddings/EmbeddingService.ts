import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import { getSupabaseClient } from "@/lib/supabase"
import { buildMockEmbedding } from "@/services/embeddings/mock"
import { sampleEmbeddingDocuments } from "@/services/embeddings/seedData"
import { embeddingJobsRepository } from "@/services/embeddings/EmbeddingJobsRepository"
import { embeddingStorage } from "@/services/embeddings/storage"
import { pgvectorRepository } from "@/services/pgvector"
import type {
  EmbeddingDocument,
  EmbeddingJob,
  EmbeddingResponse,
  EmbeddingVectorRecord,
} from "@/services/embeddings/types"

function nowIso() {
  return new Date().toISOString()
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function toMarketDocumentType(type: EmbeddingDocument["type"]) {
  switch (type) {
    case "market_snapshot":
      return "snapshot" as const
    case "news_summary":
      return "news" as const
    case "narrative_report":
      return "narrative" as const
    case "category_summary":
      return "category" as const
    case "technical_summary":
      return "technical" as const
    case "sentiment_summary":
      return "sentiment" as const
    case "historical_context":
      return "research" as const
    default:
      return "research" as const
  }
}

function toRecord(
  job: EmbeddingJob,
  response: EmbeddingResponse,
  previous?: EmbeddingVectorRecord
): EmbeddingVectorRecord {
  return {
    id: previous?.id ?? createId("record"),
    documentId: job.document.id,
    status: "completed",
    embedding: response.embedding,
    dimensions: response.dimensions,
    provider: response.provider,
    model: response.model,
    retryCount: job.retryCount,
    createdAt: previous?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  }
}

async function requestEmbedding(document: EmbeddingDocument): Promise<ApiResult<EmbeddingResponse>> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return ok(buildMockEmbedding(document))
  }

  const { data, error } = await supabase.functions.invoke<EmbeddingResponse>(
    "generate-embedding",
    {
      body: {
        input: document.content,
        metadata: {
          documentId: document.id,
          type: document.type,
          title: document.title,
        },
      },
    }
  )

  if (error) {
    return ok(buildMockEmbedding(document))
  }

  if (!data?.embedding || !Array.isArray(data.embedding)) {
    return err("Resposta de embedding invalida.", "EMBEDDING_INVALID_RESPONSE")
  }

  if ((data.dimensions ?? data.embedding.length) !== 1536) {
    return err("Embedding dimension mismatch. Expected 1536 dimensions.", "EMBEDDING_DIMENSION_MISMATCH")
  }

  return ok(data)
}

export type EmbeddingService = {
  listJobs(): Promise<ApiResult<EmbeddingJob[]>>
  listRecords(): Promise<ApiResult<EmbeddingVectorRecord[]>>
  seedQueue(): Promise<ApiResult<EmbeddingJob[]>>
  enqueueDocuments(documents: EmbeddingDocument[]): Promise<ApiResult<EmbeddingJob[]>>
  processNextPending(): Promise<ApiResult<EmbeddingJob | null>>
  retryFailed(jobId: string): Promise<ApiResult<EmbeddingJob>>
  retryFailedJobs(): Promise<ApiResult<number>>
}

export function createEmbeddingService(): EmbeddingService {
  return {
    async listJobs() {
      const supabase = getSupabaseClient()
      if (supabase) {
        const res = await embeddingJobsRepository.listJobs()
        if (res.ok) return res
      }
      return ok(embeddingStorage.getJobs())
    },

    async listRecords() {
      const supabase = getSupabaseClient()
      if (supabase) {
        const { data, error } = await supabase
          .from("market_embeddings")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(250)

        if (!error && Array.isArray(data)) {
          return ok(
            data.map((row) => ({
              id: row.id as string,
              documentId: row.document_id as string,
              status: "completed",
              embedding: null,
              dimensions: (row.dimensions as number) ?? 1536,
              provider: (row.provider as "mock" | "openai") ?? "openai",
              model: (row.model as string) ?? "unknown",
              retryCount: 0,
              createdAt: (row.created_at as string) ?? nowIso(),
              updatedAt: (row.updated_at as string) ?? nowIso(),
            }))
          )
        }
      }

      return ok(embeddingStorage.getRecords())
    },

    async seedQueue() {
      return this.enqueueDocuments(sampleEmbeddingDocuments)
    },

    async enqueueDocuments(documents) {
      const supabase = getSupabaseClient()
      const createdAt = nowIso()

      if (supabase) {
        const created: EmbeddingJob[] = []

        for (const document of documents) {
          await pgvectorRepository.upsertMarketDocument({
            id: document.id,
            documentType: toMarketDocumentType(document.type),
            title: document.title,
            content: document.content,
            sourceRef: document.sourceRef,
            metadata: document.metadata,
          })

          const existingRes = await embeddingJobsRepository.findJobByDocumentId(document.id)
          if (existingRes.ok === false) return existingRes

          if (existingRes.data) {
            created.push(existingRes.data)
            continue
          }

          const job: EmbeddingJob = {
            id: createId("job"),
            document,
            status: "pending",
            retryCount: 0,
            attempts: 0,
            sourceMode:
              typeof document.metadata?.sourceMode === "string" && document.metadata.sourceMode === "live"
                ? "live"
                : "fallback",
            createdAt,
            updatedAt: createdAt,
          }

          const res = await embeddingJobsRepository.createJob({ job })
          if (res.ok === false) return res
          created.push(res.data)
        }

        embeddingStorage.saveJobs(created)
        return ok(created)
      }

      const currentJobs = embeddingStorage.getJobs()
      const nextJobs = [
        ...documents.map<EmbeddingJob>((document) => ({
          id: createId("job"),
          document,
          status: "pending",
          retryCount: 0,
          createdAt,
          updatedAt: createdAt,
        })),
        ...currentJobs,
      ]
      embeddingStorage.saveJobs(nextJobs)
      return ok(nextJobs)
    },

    async processNextPending() {
      const supabase = getSupabaseClient()

      if (supabase) {
        const jobsRes = await embeddingJobsRepository.listJobs("pending")
        if (jobsRes.ok === false) return jobsRes
        const target = jobsRes.data[0]
        if (!target) return ok(null)

        const startedRes = await embeddingJobsRepository.markProcessing(target.id)
        if (startedRes.ok === false) return startedRes
        const startedJob = startedRes.data

        const response = await requestEmbedding(startedJob.document)
        if (response.ok === false) {
          const failed = await embeddingJobsRepository.markFailed({
            id: startedJob.id,
            error: response.error.message,
          })
          return failed.ok ? ok(failed.data) : failed
        }

        const record = toRecord(startedJob, response.data)
        const embedRes = await pgvectorRepository.upsertMarketEmbedding({
          id: record.id,
          document_id: startedJob.document.id,
          embedding: response.data.embedding,
          model: response.data.model,
          provider: response.data.provider,
          dimensions: response.data.dimensions,
        })

        if (embedRes.ok === false) {
          const failed = await embeddingJobsRepository.markFailed({
            id: startedJob.id,
            error: embedRes.error.message,
          })
          return failed.ok ? ok(failed.data) : failed
        }

        const completed = await embeddingJobsRepository.markCompleted({
          id: startedJob.id,
          vectorRecordId: record.id,
          embeddingModel: response.data.model,
          vectorDimension: response.data.dimensions,
          sourceMode: response.data.provider === "mock" ? "fallback" : "live",
        })

        if (completed.ok === false) return completed
        embeddingStorage.saveJobs([completed.data, ...embeddingStorage.getJobs().filter((j) => j.id !== completed.data.id)])
        return ok(completed.data)
      }

      const jobs = embeddingStorage.getJobs()
      const records = embeddingStorage.getRecords()
      const target = jobs.find((job) => job.status === "pending")
      if (!target) return ok(null)

      const startedJob: EmbeddingJob = {
        ...target,
        status: "processing",
        updatedAt: nowIso(),
      }

      embeddingStorage.saveJobs(jobs.map((job) => (job.id === target.id ? startedJob : job)))

      const response = await requestEmbedding(target.document)
      if (response.ok === false) {
        const failedJob: EmbeddingJob = {
          ...startedJob,
          status: "failed",
          lastError: response.error.message,
          updatedAt: nowIso(),
        }
        embeddingStorage.saveJobs(
          embeddingStorage.getJobs().map((job) => (job.id === target.id ? failedJob : job))
        )
        return ok(failedJob)
      }

      const previousRecord = records.find((record) => record.documentId === target.document.id)
      const record = toRecord(startedJob, response.data, previousRecord)
      const completedJob: EmbeddingJob = {
        ...startedJob,
        status: "completed",
        vectorRecordId: record.id,
        lastError: undefined,
        updatedAt: nowIso(),
      }

      embeddingStorage.saveJobs(
        embeddingStorage.getJobs().map((job) => (job.id === target.id ? completedJob : job))
      )
      embeddingStorage.saveRecords([record, ...records.filter((item) => item.id !== record.id)])

      await pgvectorRepository.upsertMarketDocument({
        id: target.document.id,
        documentType: toMarketDocumentType(target.document.type),
        title: target.document.title,
        content: target.document.content,
        sourceRef: target.document.sourceRef,
        metadata: target.document.metadata,
      })

      await pgvectorRepository.upsertMarketEmbedding({
        id: record.id,
        document_id: target.document.id,
        embedding: response.data.embedding,
        model: response.data.model,
        provider: response.data.provider,
        dimensions: response.data.dimensions,
      })

      return ok(completedJob)
    },

    async retryFailed(jobId) {
      const supabase = getSupabaseClient()
      if (supabase) {
        const currentRes = await embeddingJobsRepository.getJob(jobId)
        if (currentRes.ok && currentRes.data) {
          const res = await embeddingJobsRepository.updateStatus({
            id: jobId,
            status: "pending",
            patch: {
              retryCount: currentRes.data.retryCount + 1,
              lastError: undefined,
            },
          })
          if (res.ok) return res
        }
      }

      const jobs = embeddingStorage.getJobs()
      const existing = jobs.find((job) => job.id === jobId)
      if (!existing) return err("Embedding job not found.", "EMBEDDING_JOB_NOT_FOUND")

      const retriedJob: EmbeddingJob = {
        ...existing,
        status: "pending",
        retryCount: existing.retryCount + 1,
        lastError: undefined,
        updatedAt: nowIso(),
      }

      embeddingStorage.saveJobs(jobs.map((job) => (job.id === jobId ? retriedJob : job)))

      return ok(retriedJob)
    },

    async retryFailedJobs() {
      const supabase = getSupabaseClient()
      if (supabase) {
        return embeddingJobsRepository.retryFailedJobs()
      }
      const jobs = embeddingStorage.getJobs()
      const failed = jobs.filter((job) => job.status === "failed")
      embeddingStorage.saveJobs(
        jobs.map((job) =>
          job.status === "failed" ? { ...job, status: "pending", lastError: undefined, updatedAt: nowIso() } : job
        )
      )
      return ok(failed.length)
    },
  }
}

export const embeddingService = createEmbeddingService()

