import type { ReactNode } from "react"

import { Download, Sparkles } from "lucide-react"

import { OpportunityIntelligencePanel } from "@/components/opportunity/OpportunityIntelligencePanel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ResearchReport } from "@/services/research"

export function ResearchReportLayout({
  report,
  actions,
  onExportMarkdown,
}: {
  report: ResearchReport
  actions?: ReactNode
  onExportMarkdown?: () => void
}) {
  const sections = report.sections.filter((section) => section.title !== "Opportunity Intelligence")

  return (
    <Card className="bg-card/40">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Research Viewer</CardTitle>
            <CardDescription>Institutional layout inspired by top-tier global research desks.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{report.tone}</Badge>
            <Badge variant="secondary">{report.author}</Badge>
            <Badge variant="outline">{report.reportType}</Badge>
            {actions}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="rounded-2xl border bg-background/35 p-4 sm:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Institutional Research
                </div>
                <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  {report.title}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {report.createdAt} · {report.author}
                </div>
              </div>
              {onExportMarkdown ? (
                <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={onExportMarkdown}>
                  <Download className="h-4 w-4" />
                  Export Markdown
                </Button>
              ) : null}
            </div>
            <div className="mt-5 rounded-xl border bg-card/40 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Executive Summary
              </div>
              <div className="mt-2 text-sm leading-6 text-foreground/90">
                {report.executiveSummary}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {report.opportunityIntelligence ? (
              <div className="lg:col-span-2">
                <OpportunityIntelligencePanel
                  intelligence={report.opportunityIntelligence}
                  title="Opportunity Intelligence"
                  description="Institutional summary of conviction, narrative exposure, beneficiaries, and invalidating conditions."
                />
              </div>
            ) : null}
            {sections.map((section) => (
              <div key={section.id} className="rounded-xl border bg-background/35 p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </div>
                <div className="mt-3 text-sm leading-6 text-foreground/90">
                  {section.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

