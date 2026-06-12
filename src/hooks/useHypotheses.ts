import { useCallback, useEffect, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { hypothesesService } from "@/services/hypotheses"
import type { Hypothesis } from "@/services/hypotheses"

export function useHypotheses() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [data, setData] = useState<Hypothesis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const res = await hypothesesService.list({ search, status })
    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return
    }

    setData(res.data)
    setLoading(false)
  }, [search, status])

  useEffect(() => {
    load()
  }, [load])

  return {
    search,
    setSearch,
    status,
    setStatus,
    data,
    loading,
    error,
    retry: load,
  }
}

