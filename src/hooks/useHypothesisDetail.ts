import { useCallback, useEffect, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { hypothesesService } from "@/services/hypotheses"
import type { HypothesisDetail } from "@/services/hypotheses"

export function useHypothesisDetail(id?: string) {
  const [data, setData] = useState<HypothesisDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const load = useCallback(async () => {
    if (!id) {
      setError({ message: "Invalid hypothesis", code: "HYPOTHESIS_INVALID" })
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const res = await hypothesesService.getById(id)
    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return
    }

    setData(res.data)
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, retry: load }
}

