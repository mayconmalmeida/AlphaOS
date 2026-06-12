import { useCallback, useEffect, useMemo, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { marketMemoryService } from "@/services/marketMemory"
import type { MarketSnapshot, SimilarSnapshot, SnapshotComparison } from "@/services/marketMemory"

export function useMarketMemory() {
  const [search, setSearch] = useState("")
  const [snapshots, setSnapshots] = useState<MarketSnapshot[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [compareId, setCompareId] = useState<string | null>(null)

  const [selected, setSelected] = useState<MarketSnapshot | null>(null)
  const [similar, setSimilar] = useState<SimilarSnapshot[]>([])
  const [comparison, setComparison] = useState<SnapshotComparison | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const reloadList = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await marketMemoryService.listSnapshots({ search })
    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return
    }
    setSnapshots(res.data)
    setSelectedId((prev) => prev ?? res.data[0]?.id ?? null)
    setLoading(false)
  }, [search])

  useEffect(() => {
    reloadList()
  }, [reloadList])

  const loadSelected = useCallback(async (id: string | null) => {
    setSelected(null)
    setSimilar([])
    if (!id) return

    const [sRes, simRes] = await Promise.all([
      marketMemoryService.getSnapshot(id),
      marketMemoryService.findSimilarSnapshots(id),
    ])

    if (isErr(sRes)) {
      setError(sRes.error)
      return
    }
    if (isErr(simRes)) {
      setError(simRes.error)
      return
    }

    setSelected(sRes.data)
    setSimilar(simRes.data)
  }, [])

  useEffect(() => {
    loadSelected(selectedId)
  }, [selectedId, loadSelected])

  useEffect(() => {
    async function loadCompare() {
      setComparison(null)
      if (!selectedId || !compareId) return
      const res = await marketMemoryService.compare(selectedId, compareId)
      if (isErr(res)) {
        setError(res.error)
        return
      }
      setComparison(res.data)
    }
    loadCompare()
  }, [selectedId, compareId])

  const availableCompareTargets = useMemo(
    () => snapshots.filter((s) => s.id !== selectedId),
    [snapshots, selectedId]
  )

  return {
    search,
    setSearch,
    snapshots,
    selectedId,
    setSelectedId,
    compareId,
    setCompareId,
    availableCompareTargets,
    selected,
    similar,
    comparison,
    loading,
    error,
    retry: reloadList,
  }
}

