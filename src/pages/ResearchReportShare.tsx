import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Printer } from "lucide-react"

import { ResearchReportLayout } from "@/components/research/ResearchReportLayout"
import { Button } from "@/components/ui/button"
import type { ApiError } from "@/lib/api"
import { researchService } from "@/services/research"
import type { ResearchReport } from "@/services/research"

export default function ResearchReportShare() {
  const { id } = useParams()
  const [report, setReport] = useState<ResearchReport | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!id) {
        setError({ message: "Relatório inválido", code: "RESEARCH_REPORT_INVALID" })
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      const res = await researchService.getById(id)
      if (res.ok === false) {
        setError(res.error)
        setLoading(false)
        return
      }

      setReport(res.data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6">
        <div className="h-[520px] animate-pulse rounded-xl border bg-background/30" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6">
        <div className="rounded-xl border bg-background/35 p-5 text-sm text-muted-foreground">
          {error.message}
        </div>
        <Button asChild variant="outline">
          <Link to="/research">Voltar ao Research Center</Link>
        </Button>
      </div>
    )
  }

  if (!report) return null

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button asChild variant="outline">
          <Link to="/research">Voltar ao Research Center</Link>
        </Button>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </Button>
      </div>
      <ResearchReportLayout report={report} />
    </div>
  )
}

