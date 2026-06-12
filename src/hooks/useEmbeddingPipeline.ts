import { useCallback, useEffect, useMemo, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { embeddingService } from "@/services/embeddings"
import type { EmbeddingJob, EmbeddingVectorRecord } from "@/services/embeddings"

export function useEmbeddingPipeline() {
  const [jobs, setJobs] = useState<EmbeddingJob[]>([])
  const [records, setRecords] = useState<EmbeddingVectorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [jobsRes, recordsRes] = await Promise.all([
      embeddingService.listJobs(),
      embeddingService.listRecords(),
    ])

    if (isErr(jobsRes)) {
      setError(jobsRes.error)
      setLoading(false)
      return
    }
    if (isErr(recordsRes)) {
      setError(recordsRes.error)
      setLoading(false)
      return
    }

    setJobs(jobsRes.data)
    setRecords(recordsRes.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const seed = useCallback(async () => {
    setProcessing(true)
    const res = await embeddingService.seedQueue()
    if (isErr(res)) {
      setError(res.error)
      setProcessing(false)
      return
    }
    await load()
    setProcessing(false)
  }, [load])

  const processNext = useCallback(async () => {
    setProcessing(true)
    const res = await embeddingService.processNextPending()
    if (isErr(res)) {
      setError(res.error)
      setProcessing(false)
      return
    }
    await load()
    setProcessing(false)
  }, [load])

  const retryJob = useCallback(
    async (jobId: string) => {
      setProcessing(true)
      const retryRes = await embeddingService.retryFailed(jobId)
      if (isErr(retryRes)) {
        setError(retryRes.error)
        setProcessing(false)
        return
      }
      await embeddingService.processNextPending()
      await load()
      setProcessing(false)
    },
    [load]
  )

  const stats = useMemo(() => {
    const pending = jobs.filter((job) => job.status === "pending").length
    const processingCount = jobs.filter((job) => job.status === "processing").length
    const completed = jobs.filter((job) => job.status === "completed").length
    const failed = jobs.filter((job) => job.status === "failed").length
    const dimensionMismatches = records.filter((record) => record.dimensions !== 1536).length
    const lastGenerated = records[0]?.updatedAt ?? null
    const lastCompletedJob = jobs.find((job) => job.status === "completed") ?? null
    const lastFailedJob = jobs.find((job) => job.status === "failed") ?? null
    return {
      pending,
      processing: processingCount,
      completed,
      failed,
      totalRecords: records.length,
      dimensionMismatches,
      lastGenerated,
      lastSuccessfulEmbedding: lastCompletedJob?.completedAt ?? lastCompletedJob?.updatedAt ?? null,
      lastFailedEmbedding: lastFailedJob?.updatedAt ?? null,
      embeddingModel: lastCompletedJob?.embeddingModel ?? null,
      vectorDimension: lastCompletedJob?.vectorDimension ?? null,
      vectorQuality:
        records.length === 0
          ? "Awaiting vectors"
          : dimensionMismatches === 0
            ? "Healthy"
            : "Dimension mismatch detected",
    }
  }, [jobs, records])

  const retryFailedJobs = useCallback(async () => {
    setProcessing(true)
    const res = await embeddingService.retryFailedJobs()
    if (isErr(res)) {
      setError(res.error)
      setProcessing(false)
      return
    }
    await load()
    setProcessing(false)
  }, [load])

  return {
    jobs,
    records,
    loading,
    processing,
    error,
    stats,
    seed,
    processNext,
    retryJob,
    retryFailedJobs,
    refresh: load,
  }
}

