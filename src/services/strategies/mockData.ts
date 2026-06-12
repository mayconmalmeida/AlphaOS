import type { PipelineStep, StrategyCandidate, StrategyStage, StrategyStatus } from "@/services/strategies/types"

const adjectives = [
  "Rotation",
  "Narrative",
  "Momentum",
  "Quality",
  "Liquidity",
  "Resilience",
  "Conviction",
  "Tactical",
  "Adaptive",
  "Regime",
]

const nouns = [
  "Catcher",
  "Allocator",
  "Overlay",
  "Explorer",
  "Balancer",
  "Filter",
  "Selector",
  "Framework",
  "Stack",
  "Matrix",
]

const universes = [
  ["BTC", "ETH", "SOL"],
  ["ETH", "SOL", "LINK"],
  ["BTC", "ETH", "ARB", "OP"],
  ["ETH", "ONDO", "LINK"],
  ["BTC", "ETH", "TAO"],
]

const stages: StrategyStage[] = ["approved", "critic", "backtest", "generate", "hypothesis"]
const statuses: StrategyStatus[] = ["approved", "warning", "candidate"]

export const mockStrategyCandidates: StrategyCandidate[] = Array.from({ length: 50 }).map(
  (_, index) => {
    const stage = stages[index % stages.length]
    const status = stage === "approved" ? "approved" : statuses[index % statuses.length]
    const name = `${adjectives[index % adjectives.length]} ${nouns[index % nouns.length]} v${
      (index % 5) + 1
    }`
    const universe = universes[index % universes.length]
    const totalReturn = 0.14 + ((index * 7) % 31) / 100
    const maxDrawdown = 0.06 + ((index * 3) % 11) / 100
    const sharpeProxy = 0.9 + ((index * 5) % 12) / 10
    const winRate = 0.46 + ((index * 2) % 15) / 100
    const profitFactor = 1.1 + ((index * 4) % 9) / 10
    const tradeCount = 18 + ((index * 5) % 44)
    const score = Math.round(
      (totalReturn * 100 * 0.38 +
        (1 - maxDrawdown) * 100 * 0.22 +
        sharpeProxy * 12 +
        winRate * 20 +
        profitFactor * 8) *
        0.9
    )

    return {
      id: `strategy-${index + 1}`,
      hypothesisId: "214",
      hypothesisTitle: "AI Infrastructure Expansion",
      pipelineStage: stage,
      status,
      score,
      origin: "mock",
      spec: {
        strategyName: name,
        objective: "Capture narrative continuation with disciplined drawdown control.",
        universe,
        entryRules: [
          "Enter when narrative strength is above 60",
          "Require volume above the 20-session average",
          "Confirm a favorable market regime before allocating",
        ],
        exitRules: [
          "Reduce exposure when narrative velocity starts to slow",
          "Exit when invalidating conditions are triggered",
        ],
        positionSizing: index % 2 === 0 ? "Volatility-adjusted" : "Equal-risk allocation",
        rebalanceFrequency: index % 3 === 0 ? "Weekly" : "Every 3 days",
        riskControls: [
          "Cap exposure by narrative",
          "Use drawdown-based stops",
          "Apply a minimum-liquidity filter",
        ],
        stopConditions: [
          "Volatility exceeds threshold",
          "Volume drops more than two standard deviations",
          "An abrupt regime shift appears",
        ],
        benchmark: "BTC + ETH blend",
        timeHorizon: index % 2 === 0 ? "30-60 Days" : "45-90 Days",
      },
      metrics: {
        totalReturn,
        maxDrawdown,
        sharpeProxy,
        winRate,
        profitFactor,
        tradeCount,
      },
    }
  }
)

export const mockPipeline: PipelineStep[] = [
  { label: "Hypothesis", status: "ready", count: 1 },
  { label: "Generate", status: "active", count: 50 },
  { label: "Backtest", status: "mock", count: 50 },
  { label: "Critic", status: "mock", count: 50 },
  { label: "Approved", status: "mock", count: mockStrategyCandidates.filter((s) => s.status === "approved").length },
]

