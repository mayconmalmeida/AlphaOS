import { useCallback, useEffect, useMemo, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { marketReplayService } from "@/services/marketReplay"
import type { ReplayFrame, ReplayScenario } from "@/services/marketReplay"

const SPEED_OPTIONS = [0.5, 1, 1.5, 2] as const

export function useMarketReplay() {
  const [scenario, setScenario] = useState<ReplayScenario | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const res = await marketReplayService.getScenarioById("march-2024-ai-rotation")
    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return
    }

    setScenario(res.data)
    setCurrentIndex(0)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const frames = scenario?.frames ?? []
  const currentFrame: ReplayFrame | null = frames[currentIndex] ?? null
  const speed = SPEED_OPTIONS[speedIndex]

  useEffect(() => {
    if (!isPlaying || frames.length === 0) return
    if (currentIndex >= frames.length - 1) {
      setIsPlaying(false)
      return
    }

    const ms = Math.round(1800 / speed)
    const timer = window.setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, frames.length - 1))
    }, ms)

    return () => window.clearTimeout(timer)
  }, [currentIndex, frames.length, isPlaying, speed])

  const visibleEvents = useMemo(() => {
    if (!scenario || !currentFrame) return []
    return scenario.events.filter((event) => event.day <= currentFrame.day)
  }, [currentFrame, scenario])

  const progressPct = useMemo(() => {
    if (frames.length <= 1) return 0
    return (currentIndex / (frames.length - 1)) * 100
  }, [currentIndex, frames.length])

  function togglePlay() {
    if (!frames.length) return
    setIsPlaying((prev) => !prev)
  }

  function reset() {
    setCurrentIndex(0)
    setIsPlaying(false)
  }

  function stepForward() {
    setCurrentIndex((prev) => Math.min(prev + 1, frames.length - 1))
  }

  function cycleSpeed() {
    setSpeedIndex((prev) => (prev + 1) % SPEED_OPTIONS.length)
  }

  function setFrameIndex(index: number) {
    setCurrentIndex(index)
    setIsPlaying(false)
  }

  return {
    scenario,
    currentFrame,
    currentIndex,
    isPlaying,
    speed,
    progressPct,
    visibleEvents,
    loading,
    error,
    retry: load,
    togglePlay,
    reset,
    stepForward,
    cycleSpeed,
    setFrameIndex,
  }
}

