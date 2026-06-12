import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildGuidedJourneySearch,
  getGuidedJourneyMeta,
  getGuidedJourneyPath,
  getGuidedJourneyTotalSteps,
  parseGuidedJourney,
  type GuidedJourneyStep,
} from "@/lib/guidedJourney"

type GuidedJourneyBannerProps = {
  hypothesisId?: string | null
  onFinish?: () => void
}

export function GuidedJourneyBanner({ hypothesisId, onFinish }: GuidedJourneyBannerProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const state = parseGuidedJourney(location.search)

  if (!state.active) return null

  const step = state.step
  const meta = getGuidedJourneyMeta(step)
  const total = getGuidedJourneyTotalSteps()
  const resolvedHypothesisId = hypothesisId ?? state.hypothesisId

  const progressPct = Math.round((step / total) * 100)
  const canGoBack = step > 1
  const canGoNext = step < total

  const goToStep = (nextStep: GuidedJourneyStep) => {
    navigate(
      `${getGuidedJourneyPath({ step: nextStep, hypothesisId: resolvedHypothesisId })}${buildGuidedJourneySearch(
        {
          step: nextStep,
          hypothesisId: resolvedHypothesisId,
        }
      )}`
    )
  }

  const exit = () => {
    navigate("/dashboard")
  }

  return (
    <Card className="bg-card/40">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Guided Journey</Badge>
            <div className="text-xs text-muted-foreground">
              Step {step} of {total}
            </div>
          </div>
          <div className="mt-2 font-display text-lg font-semibold tracking-tight">{meta.title}</div>
          <div className="mt-1 text-sm text-muted-foreground">{meta.matters}</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full border bg-background/30">
            <div className="h-full bg-primary/70" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={exit} className="gap-2">
            <X className="h-4 w-4" />
            Exit
          </Button>
          {canGoBack ? (
            <Button variant="outline" onClick={() => goToStep((step - 1) as GuidedJourneyStep)} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : null}
          {canGoNext ? (
            <Button onClick={() => goToStep((step + 1) as GuidedJourneyStep)} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onFinish} className="gap-2">
              Finish
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

