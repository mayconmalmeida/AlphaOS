import { useCallback, useState } from "react"

import type { ApiError } from "@/lib/api"
import { isErr } from "@/lib/api"
import { generateRagAnswer } from "@/services/rag"
import type { RagResponse } from "@/services/rag"

export function useRagResearch() {
  const [question, setQuestion] = useState("What is the market not seeing yet in AI infrastructure?")
  const [data, setData] = useState<RagResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)

    const res = await generateRagAnswer(question)
    if (isErr(res)) {
      setError(res.error)
      setLoading(false)
      return
    }

    setData(res.data)
    setLoading(false)
  }, [question])

  return {
    question,
    setQuestion,
    data,
    loading,
    error,
    run,
  }
}

