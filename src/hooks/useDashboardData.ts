import { useCallback, useEffect, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { cmcServices } from "@/services/cmc"
import { getCmcRuntimeStatus } from "@/services/cmc/runtime"
import type { MarketPulse, NarrativeRadarPoint } from "@/services/cmc/types"

export type DashboardData = {
  marketPulse: MarketPulse
  narrativeRadar: NarrativeRadarPoint[]
  cmcStatus: ReturnType<typeof getCmcRuntimeStatus>
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [pulseRes, radarRes] = await Promise.all([
      cmcServices.sentiment.getMarketPulse(),
      cmcServices.narratives.getNarrativeRadar(),
    ])

    if (isErr(pulseRes)) {
      setError(pulseRes.error)
      setLoading(false)
      return
    }
    if (isErr(radarRes)) {
      setError(radarRes.error)
      setLoading(false)
      return
    }

    setData({
      marketPulse: pulseRes.data,
      narrativeRadar: radarRes.data,
      cmcStatus: getCmcRuntimeStatus(),
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, retry: load }
}

