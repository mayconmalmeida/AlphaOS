import type { ApiResult } from "@/lib/api"
import { err, ok } from "@/lib/api"
import { getSupabaseClient } from "@/lib/supabase"
import type { EmbeddingDocument, EmbeddingJob, EmbeddingStatus } from "@/services/embeddings/types"

type EmbeddingJobRow = {
  id: string
  status: EmbeddingStatus
  retry_count: number
  attempts: number | null
  last_error: string | null
  vector_record_id: string | null
  payload: unknown
  document_id: string | null
  document_type: string | null
  embedding_model: string | null
  vector_dimension: number | null
  source_mode: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

function nowIso() {
  return new Date().toISOString()
}

function toJob(row: EmbeddingJobRow): EmbeddingJob {
  const payload = row.payload as { document?: EmbeddingDocument } | null
  const document = payload?.document
  if (!document) {
    throw new Error("Embedding job payload missing document.")
  }

  return {
    id: row.id,
    document,
    status: row.status,
    retryCount: row.retry_count,
    attempts: row.attempts ?? undefined,
    lastError: row.last_error ?? undefined,
    vectorRecordId: row.vector_record_id ?? undefined,
    embeddingModel: row.embedding_model ?? undefined,
    vectorDimension: row.vector_dimension ?? undefined,
    sourceMode: row.source_mode === "live" ? "live" : "fallback",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  }
}

function toRow(job: EmbeddingJob): Partial<EmbeddingJobRow> {
  return {
    id: job.id,
    status: job.status,
    retry_count: job.retryCount,
    attempts: job.attempts ?? null,
    last_error: job.lastError ?? null,
    vector_record_id: job.vectorRecordId ?? null,
    payload: { document: job.document },
    document_id: job.document.id,
    document_type: job.document.type,
    embedding_model: job.embeddingModel ?? null,
    vector_dimension: job.vectorDimension ?? null,
    source_mode: job.sourceMode ?? "fallback",
    completed_at: job.completedAt ?? null,
    updated_at: job.updatedAt,
  }
}

export type EmbeddingJobsRepository = {
  createJob(params: { job: EmbeddingJob }): Promise<ApiResult<EmbeddingJob>>
  getJob(id: string): Promise<ApiResult<EmbeddingJob | null>>
  listJobs(status?: EmbeddingStatus): Promise<ApiResult<EmbeddingJob[]>>
  updateStatus(params: {
    id: string
    status: EmbeddingStatus
    patch?: Partial<EmbeddingJob>
  }): Promise<ApiResult<EmbeddingJob>>
  markProcessing(id: string): Promise<ApiResult<EmbeddingJob>>
  markCompleted(params: {
    id: string
    vectorRecordId: string
    embeddingModel: string
    vectorDimension: number
    sourceMode: "live" | "fallback"
  }): Promise<ApiResult<EmbeddingJob>>
  markFailed(params: { id: string; error: string }): Promise<ApiResult<EmbeddingJob>>
  retryFailedJobs(): Promise<ApiResult<number>>
  findJobByDocumentId(documentId: string): Promise<ApiResult<EmbeddingJob | null>>
}

export function createEmbeddingJobsRepository(): EmbeddingJobsRepository {
  return {
    async createJob({ job }) {
      const supabase = getSupabaseClient()
      if (!supabase) return err("Supabase unavailable.", "SUPABASE_UNAVAILABLE")

      const row = toRow(job)
      const { data, error } = await supabase
        .from("embedding_jobs")
        .upsert({
          ...row,
          created_at: job.createdAt,
        })
        .select("*")
        .single()

      if (error) return err(error.message, "EMBEDDING_JOB_CREATE_FAILED")
      return ok(toJob(data as EmbeddingJobRow))
    },

    async getJob(id) {
      const supabase = getSupabaseClient()
      if (!supabase) return ok(null)

      const { data, error } = await supabase
        .from("embedding_jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle()

      if (error) return err(error.message, "EMBEDDING_JOB_GET_FAILED")
      if (!data) return ok(null)
      return ok(toJob(data as EmbeddingJobRow))
    },

    async findJobByDocumentId(documentId) {
      const supabase = getSupabaseClient()
      if (!supabase) return ok(null)

      const { data, error } = await supabase
        .from("embedding_jobs")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) return err(error.message, "EMBEDDING_JOB_GET_FAILED")
      if (!data) return ok(null)
      return ok(toJob(data as EmbeddingJobRow))
    },

    async listJobs(status) {
      const supabase = getSupabaseClient()
      if (!supabase) return ok([])

      const query = supabase.from("embedding_jobs").select("*").order("created_at", { ascending: false })
      const { data, error } = status ? await query.eq("status", status) : await query

      if (error) return err(error.message, "EMBEDDING_JOB_LIST_FAILED")
      return ok((data ?? []).map((row) => toJob(row as EmbeddingJobRow)))
    },

    async updateStatus({ id, status, patch }) {
      const supabase = getSupabaseClient()
      if (!supabase) return err("Supabase unavailable.", "SUPABASE_UNAVAILABLE")

      const currentRes = await this.getJob(id)
      if (currentRes.ok === false) return currentRes
      if (!currentRes.data) return err("Embedding job not found.", "EMBEDDING_JOB_NOT_FOUND")

      const next: EmbeddingJob = {
        ...currentRes.data,
        ...patch,
        status,
        updatedAt: nowIso(),
      }

      const row = toRow(next)
      const { data, error } = await supabase
        .from("embedding_jobs")
        .update(row)
        .eq("id", id)
        .select("*")
        .single()

      if (error) return err(error.message, "EMBEDDING_JOB_UPDATE_FAILED")
      return ok(toJob(data as EmbeddingJobRow))
    },

    async markProcessing(id) {
      return this.updateStatus({ id, status: "processing" })
    },

    async markCompleted({ id, vectorRecordId, embeddingModel, vectorDimension, sourceMode }) {
      return this.updateStatus({
        id,
        status: "completed",
        patch: {
          vectorRecordId,
          embeddingModel,
          vectorDimension,
          sourceMode,
          lastError: undefined,
          completedAt: nowIso(),
        },
      })
    },

    async markFailed({ id, error: message }) {
      const currentRes = await this.getJob(id)
      if (currentRes.ok === false) return currentRes
      if (!currentRes.data) return err("Embedding job not found.", "EMBEDDING_JOB_NOT_FOUND")

      const attempts = (currentRes.data.attempts ?? 0) + 1
      const retryCount = currentRes.data.retryCount + 1

      return this.updateStatus({
        id,
        status: "failed",
        patch: {
          lastError: message,
          attempts,
          retryCount,
        },
      })
    },

    async retryFailedJobs() {
      const supabase = getSupabaseClient()
      if (!supabase) return err("Supabase unavailable.", "SUPABASE_UNAVAILABLE")

      const { data, error } = await supabase
        .from("embedding_jobs")
        .update({
          status: "pending",
          last_error: null,
          updated_at: nowIso(),
        })
        .eq("status", "failed")
        .select("id")

      if (error) return err(error.message, "EMBEDDING_JOB_RETRY_FAILED")
      return ok((data ?? []).length)
    },
  }
}

export const embeddingJobsRepository = createEmbeddingJobsRepository()

