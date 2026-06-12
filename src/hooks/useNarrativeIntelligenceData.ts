import { useCallback, useEffect, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { cmcServices } from "@/services/cmc"
import type { NarrativeMetric } from "@/services/cmc/types"

export function useNarrativeIntelligenceData() {
  const [data, setData] = useState<NarrativeMetric[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const res = await cmcServices.narratives.getNarratives()
    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return
    }

    setData(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, retry: load }
}

