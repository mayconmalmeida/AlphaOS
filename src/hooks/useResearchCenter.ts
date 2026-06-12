import { useCallback, useEffect, useMemo, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { hypothesesService } from "@/services/hypotheses"
import type { Hypothesis } from "@/services/hypotheses"
import { researchService } from "@/services/research"
import type { ResearchReport } from "@/services/research"

export function useResearchCenter() {
  const [reports, setReports] = useState<ResearchReport[]>([])
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const [selectedHypothesisId, setSelectedHypothesisId] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [reportsRes, hypothesesRes] = await Promise.all([
      researchService.listReports(),
      hypothesesService.list({ status: "all" }),
    ])

    if (isErr(reportsRes)) {
      setError(reportsRes.error)
      setLoading(false)
      return
    }
    if (isErr(hypothesesRes)) {
      setError(hypothesesRes.error)
      setLoading(false)
      return
    }

    setReports(reportsRes.data)
    setHypotheses(hypothesesRes.data)

    const defaultHypothesis =
      hypothesesRes.data.find((h) => h.status !== "closed")?.id ||
      hypothesesRes.data[0]?.id ||
      ""
    setSelectedHypothesisId((prev) => prev || defaultHypothesis)

    setSelectedId((prev) => prev ?? reportsRes.data[0]?.id ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const generateReport = useCallback(async () => {
    setGenerating(true)
    const res = await researchService.generateReport({
      hypothesisId: selectedHypothesisId || undefined,
    })
    if (isErr(res)) {
      setError(res.error)
      setGenerating(false)
      return
    }

    setReports((prev) => [res.data, ...prev])
    setSelectedId(res.data.id)
    setGenerating(false)
  }, [selectedHypothesisId])

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedId) ?? null,
    [reports, selectedId]
  )

  return {
    reports,
    hypotheses,
    selectedHypothesisId,
    setSelectedHypothesisId,
    selectedReport,
    selectedId,
    setSelectedId,
    loading,
    generating,
    error,
    retry: load,
    generateReport,
  }
}

