import { useCallback, useEffect, useState } from "react"

import type { ApiError } from "@/lib/api"
import { auditSystemHealth } from "@/services/systemHealth/systemHealthService"
import type { SystemHealthReport } from "@/services/systemHealth/types"

export function useSystemHealth() {
  const [report, setReport] = useState<SystemHealthReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const next = await auditSystemHealth()
      setReport(next)
    } catch (cause) {
      setError({
        message: cause instanceof Error ? cause.message : "System health audit failed.",
        code: "SYSTEM_HEALTH_AUDIT_FAILED",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    report,
    loading,
    error,
    refresh,
  }
}

