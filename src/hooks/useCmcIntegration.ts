import { useCallback, useState } from "react"

import type { ApiError } from "@/lib/api"
import { getCmcInfraStatus } from "@/lib/env"
import { isErr } from "@/lib/api"
import { ingestCurrentCmcSnapshot } from "@/services/cmc"
import { getCmcRuntimeStatus } from "@/services/cmc/runtime"

export function useCmcIntegration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [lastIngestion, setLastIngestion] = useState<{
    snapshotTitle: string
    documentsQueued: number
    mode: "edge-proxy" | "mock"
    queuedDocumentIds: string[]
  } | null>(null)

  const runIngestion = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await ingestCurrentCmcSnapshot()
    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return
    }
    setLastIngestion(res.data)
    setLoading(false)
  }, [])

  return {
    status: getCmcInfraStatus(),
    runtimeStatus: getCmcRuntimeStatus(),
    loading,
    error,
    lastIngestion,
    runIngestion,
  }
}

