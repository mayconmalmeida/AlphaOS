export type GuidedJourneyStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type GuidedJourneyState = {
  active: boolean
  step: GuidedJourneyStep
  hypothesisId: string | null
}

const TOTAL_STEPS = 7

const STEP_META: Record<GuidedJourneyStep, { title: string; matters: string }> = {
  1: {
    title: "Opportunity",
    matters: "Start with a single opportunity so the value is obvious in seconds.",
  },
  2: {
    title: "Why Now",
    matters: "Explain what changed recently so the thesis matters now, not later.",
  },
  3: {
    title: "Evidence Graph",
    matters: "Show auditable evidence and how each signal supports the conviction.",
  },
  4: {
    title: "Historical Analogue",
    matters: "Ground the thesis with a comparable historical setup and outcome.",
  },
  5: {
    title: "Market Replay",
    matters: "Replay shows what followed a similar setup and which narratives won.",
  },
  6: {
    title: "Strategy Candidate",
    matters: "Turn the thesis into a testable, risk-controlled strategy outline.",
  },
  7: {
    title: "Research Report",
    matters: "Package the full chain into a research artifact a team can share and act on.",
  },
}

function clampStep(value: number): GuidedJourneyStep {
  if (value <= 1) return 1
  if (value >= TOTAL_STEPS) return 7
  return value as GuidedJourneyStep
}

export function parseGuidedJourney(search: string): GuidedJourneyState {
  const params = new URLSearchParams(search)
  const active =
    params.get("journey") === "1" ||
    params.get("journey") === "true" ||
    params.get("guided") === "1" ||
    params.get("guided") === "true"
  const stepParam = Number(params.get("step") ?? "1")

  return {
    active,
    step: clampStep(Number.isFinite(stepParam) ? stepParam : 1),
    hypothesisId: params.get("hypothesisId"),
  }
}

export function buildGuidedJourneySearch(params: {
  step: GuidedJourneyStep
  hypothesisId?: string | null
}) {
  const next = new URLSearchParams()
  next.set("journey", "1")
  next.set("step", String(params.step))
  if (params.hypothesisId) next.set("hypothesisId", params.hypothesisId)
  return `?${next.toString()}`
}

export function buildGuidedJourneyHref(params: {
  step?: GuidedJourneyStep
  hypothesisId?: string | null
}) {
  return `/journey${buildGuidedJourneySearch({
    step: params.step ?? 1,
    hypothesisId: params.hypothesisId,
  })}`
}

export function getGuidedJourneyMeta(step: GuidedJourneyStep) {
  return STEP_META[step]
}

export function getGuidedJourneyTotalSteps() {
  return TOTAL_STEPS
}

export function getGuidedJourneyEstimatedTime(step: GuidedJourneyStep) {
  const remainingSteps = Math.max(0, TOTAL_STEPS - step)
  const remainingSeconds = Math.max(10, remainingSteps * 12)
  return remainingSeconds >= 60
    ? `${Math.ceil(remainingSeconds / 60)} min remaining`
    : `~${remainingSeconds}s remaining`
}

