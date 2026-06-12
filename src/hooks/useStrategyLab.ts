import { useCallback, useEffect, useMemo, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { hypothesesService } from "@/services/hypotheses"
import type { Hypothesis } from "@/services/hypotheses"
import { strategiesService } from "@/services/strategies"
import type { PipelineStep, StrategyCandidate, StrategyComparison } from "@/services/strategies"

export function useStrategyLab() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const [selectedHypothesisId, setSelectedHypothesisId] = useState("")
  const [pipeline, setPipeline] = useState<PipelineStep[]>([])
  const [candidates, setCandidates] = useState<StrategyCandidate[]>([])
  const [comparison, setComparison] = useState<StrategyComparison | null>(null)
  const [selectedIds, setSelectedIds] = useState<[string, string] | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [generationError, setGenerationError] = useState<ApiError | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const hypothesesRes = await hypothesesService.list({ status: "all" })
    if (isErr(hypothesesRes)) {
      setError(hypothesesRes.error)
      setLoading(false)
      return
    }

    setHypotheses(hypothesesRes.data)

    const activeHypothesisId =
      selectedHypothesisId || hypothesesRes.data.find((item) => item.status !== "closed")?.id || hypothesesRes.data[0]?.id || ""

    if (!selectedHypothesisId && activeHypothesisId) {
      setSelectedHypothesisId(activeHypothesisId)
    }

    if (!activeHypothesisId) {
      setPipeline([])
      setCandidates([])
      setSelectedIds(null)
      setLoading(false)
      return
    }

    const [pipelineRes, candidatesRes] = await Promise.all([
      strategiesService.getPipeline({
        hypothesisId: activeHypothesisId,
        hypothesisCount: hypothesesRes.data.length,
      }),
      strategiesService.listCandidates({ search, status, hypothesisId: activeHypothesisId }),
    ])

    if (isErr(pipelineRes)) {
      setError(pipelineRes.error)
      setLoading(false)
      return
    }
    if (isErr(candidatesRes)) {
      setError(candidatesRes.error)
      setLoading(false)
      return
    }

    setPipeline(pipelineRes.data)
    setCandidates(candidatesRes.data)

    const first = candidatesRes.data[0]
    const second = candidatesRes.data[1]
    setSelectedIds(first && second ? [first.id, second.id] : null)
    setLoading(false)
  }, [search, selectedHypothesisId, status])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    async function loadComparison() {
      if (!selectedIds) {
        setComparison(null)
        return
      }
      const res = await strategiesService.compare(selectedIds)
      if (isErr(res)) {
        setError(res.error)
        return
      }
      setComparison(res.data)
    }
    loadComparison()
  }, [selectedIds])

  const generateStrategies = useCallback(async () => {
    if (!selectedHypothesisId) {
      setGenerationError({
        message: "Select a hypothesis before generating strategies.",
        code: "STRATEGY_HYPOTHESIS_REQUIRED",
      })
      return
    }

    setGenerating(true)
    setGenerationError(null)

    const res = await strategiesService.generateFromHypothesis({
      hypothesisId: selectedHypothesisId,
      variationCount: 12,
    })

    if (isErr(res)) {
      setGenerationError(res.error)
      setGenerating(false)
      return
    }

    const pipelineRes = await strategiesService.getPipeline({
      hypothesisId: selectedHypothesisId,
      hypothesisCount: hypotheses.length,
    })
    if (isErr(pipelineRes)) {
      setGenerationError(pipelineRes.error)
      setGenerating(false)
      return
    }

    setPipeline(pipelineRes.data)
    setCandidates(res.data)
    const first = res.data[0]
    const second = res.data[1]
    setSelectedIds(first && second ? [first.id, second.id] : null)
    setGenerating(false)
  }, [hypotheses.length, selectedHypothesisId])

  const topRanked = useMemo(() => candidates.slice(0, 8), [candidates])
  const activeHypothesis =
    hypotheses.find((item) => item.id === selectedHypothesisId) ?? null

  return {
    search,
    setSearch,
    status,
    setStatus,
    hypotheses,
    activeHypothesis,
    selectedHypothesisId,
    setSelectedHypothesisId,
    pipeline,
    candidates,
    topRanked,
    comparison,
    selectedIds,
    setSelectedIds,
    loading,
    generating,
    error,
    generationError,
    generateStrategies,
    retry: load,
  }
}

