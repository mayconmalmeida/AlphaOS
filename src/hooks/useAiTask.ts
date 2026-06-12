import { useCallback, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { aiService } from "@/services/ai"
import type { AiRequest, AiResponse } from "@/services/ai"

export function useAiTask<T = unknown>() {
  const [data, setData] = useState<AiResponse<T> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [lastRequest, setLastRequest] = useState<AiRequest | null>(null)

  const run = useCallback(async (request: AiRequest) => {
    setLastRequest(request)
    setLoading(true)
    setError(null)

    const res = await aiService.generate<T>(request)
    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return
    }

    setData(res.data)
    setLoading(false)
  }, [])

  const retry = useCallback(async () => {
    if (!lastRequest) return
    await run(lastRequest)
  }, [lastRequest, run])

  return {
    data,
    loading,
    error,
    run,
    retry,
    lastRequest,
    status: aiService.getStatus(),
  }
}

