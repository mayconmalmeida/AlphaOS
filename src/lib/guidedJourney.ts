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
    matters: "Start with a single opportunity so the product’s value is instantly obvious.",
  },
  2: {
    title: "Why Now",
    matters: "Timing turns a narrative into asymmetry before consensus forms.",
  },
  3: {
    title: "Evidence Graph",
    matters: "Evidence makes the thesis auditable, not just persuasive.",
  },
  4: {
    title: "Historical Analogue",
    matters: "History stress-tests whether today’s setup rhymes with past regimes.",
  },
  5: {
    title: "Market Replay",
    matters: "Replay shows how narratives evolved and what happened next.",
  },
  6: {
    title: "Strategy Candidate",
    matters: "A strategy candidate turns research into testable execution logic.",
  },
  7: {
    title: "Research Report",
    matters: "A report packages the full chain into something a team can share and act on.",
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

export function getGuidedJourneyPath(params: {
  step: GuidedJourneyStep
  hypothesisId?: string | null
}) {
  const hypothesisId = params.hypothesisId
  if (params.step === 1) return "/dashboard"
  if (params.step === 2 || params.step === 3 || params.step === 4) {
    return hypothesisId ? `/hypotheses/${hypothesisId}` : "/hypotheses"
  }
  if (params.step === 5) return "/market-replay"
  if (params.step === 6) return "/strategy-lab"
  return "/research"
}

