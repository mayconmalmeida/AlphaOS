import { useCallback, useEffect, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { criticService } from "@/services/critic"
import type { CriticReport } from "@/services/critic"
import type { StrategyCandidate } from "@/services/strategies"

export function useCriticReport(strategy: StrategyCandidate | null) {
  const [data, setData] = useState<CriticReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const load = useCallback(async () => {
    if (!strategy) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const res = await criticService.reviewStrategy(strategy)
    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return
    }

    setData(res.data)
    setLoading(false)
  }, [strategy])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, retry: load }
}

