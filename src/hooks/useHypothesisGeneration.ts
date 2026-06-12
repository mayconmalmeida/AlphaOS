import { useCallback, useState } from "react"

import type { ApiError, ApiResult } from "@/lib/api"
import { isErr } from "@/lib/api"
import { hypothesesService } from "@/services/hypotheses"
import type { HypothesisDetail } from "@/services/hypotheses"

export function useHypothesisGeneration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const generate = useCallback(async (focus?: string): Promise<ApiResult<HypothesisDetail>> => {
    setLoading(true)
    setError(null)

    const res = await hypothesesService.generate({ focus })
    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return res
    }

    setLoading(false)
    return res
  }, [])

  return { generate, loading, error }
}

