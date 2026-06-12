import type { ResearchReport } from "@/services/research/types"
import {
  buildOpportunityIntelligence,
  buildOpportunityReportSection,
} from "@/services/opportunityIntelligence"

const aiInfrastructureOpportunity = buildOpportunityIntelligence({
  id: "report-ai-infra",
  title: "AI Infrastructure Expansion",
  description:
    "AI infrastructure remains the clearest opportunity as compute demand and narrative leadership keep reinforcing one another.",
  confidence: 87,
  riskScore: 34,
  marketRegime: "Bull Expansion",
  relatedNarratives: ["AI Infrastructure"],
  relatedAssets: ["RNDR", "TAO", "AKT", "FET"],
  evidenceCount: 5,
  whyNow:
    "Capital is rotating into quality infrastructure exposure while narrative breadth remains narrow enough to reward leaders.",
  invalidatingConditions: [
    "Narrative momentum drops below 60",
    "Volume expansion disappears",
    "BTC dominance rises sharply",
  ],
})

const rwaOpportunity = buildOpportunityIntelligence({
  id: "report-regime",
  title: "RWA Narrative Acceleration",
  description:
    "RWA is strengthening as regulated market structure and tokenization use cases keep gaining institutional attention.",
  confidence: 78,
  riskScore: 38,
  marketRegime: "Narrative Rotation",
  relatedNarratives: ["RWA"],
  relatedAssets: ["ONDO", "CFG", "POLYX"],
  evidenceCount: 4,
  whyNow:
    "The market is rewarding tokenization narratives with clearer distribution and practical institutional use cases.",
  invalidatingConditions: [
    "Regulatory momentum reverses",
    "Institutional participation slows materially",
    "Category rotation falls below 55",
  ],
})

const layer2Opportunity = buildOpportunityIntelligence({
  id: "report-cycle",
  title: "Layer 2 Selectivity",
  description:
    "Layer 2 exposure remains investable only where activity, liquidity, and ecosystem retention still hold.",
  confidence: 71,
  riskScore: 42,
  marketRegime: "Selective Expansion",
  relatedNarratives: ["Layer 2"],
  relatedAssets: ["ARB", "OP", "MNT", "STRK"],
  evidenceCount: 4,
  whyNow:
    "Breadth is narrowing, so only scaling ecosystems with durable activity retain narrative exposure quality.",
  invalidatingConditions: [
    "Activity concentration shifts away from rollups",
    "Relative strength deteriorates across leaders",
    "Capital rotation remains weak for scaling narratives",
  ],
})

export const mockResearchReports: ResearchReport[] = [
  {
    id: "report-ai-infra",
    title: "AI Infrastructure Report",
    reportType: "Narrative Rotation",
    createdAt: "2026-06-11",
    tone: "constructive",
    author: "AlphaOS Research Desk",
    tags: ["AI", "Infrastructure", "Rotation"],
    executiveSummary:
      "AI infrastructure remains the leading narrative, supported by capital rotation, improving sentiment, and concentration in higher-quality assets.",
    opportunityIntelligence: aiInfrastructureOpportunity,
    sections: [
      {
        id: "opportunity-intelligence",
        title: "Opportunity Intelligence",
        body: buildOpportunityReportSection(aiInfrastructureOpportunity),
      },
      {
        id: "summary",
        title: "Executive Summary",
        body:
          "Market flow is migrating from speculative beta into infrastructure, suggesting thematic continuation with lower positive dispersion.",
      },
      {
        id: "evidence",
        title: "Evidence",
        body:
          "Persistent narrative strength, volume expansion in category leaders, accelerating headlines, and historical similarity to prior thesis-consolidation phases.",
      },
      {
        id: "narratives",
        title: "Narratives",
        body:
          "AI and infrastructure continue to dominate attention while secondary themes lose depth and marginal flow.",
      },
      {
        id: "opportunities",
        title: "Opportunities",
        body:
          "Focus on category leaders with robust liquidity and direct sensitivity to the core thesis while avoiding fragile long-tail names with weak volume support.",
      },
      {
        id: "risks",
        title: "Risks",
        body:
          "Excessive concentration, weaker breadth, and narrative fatigue can compress asymmetry and justify partial profit-taking.",
      },
    ],
  },
  {
    id: "report-regime",
    title: "Market Regime Briefing",
    reportType: "Regime",
    createdAt: "2026-06-10",
    tone: "neutral",
    author: "AlphaOS Research Desk",
    tags: ["Regime", "Liquidity", "Risk"],
    executiveSummary:
      "The market remains in a constructive expansion, but early signs of concentration and growing selectivity are appearing in allocation decisions.",
    opportunityIntelligence: rwaOpportunity,
    sections: [
      {
        id: "opportunity-intelligence",
        title: "Opportunity Intelligence",
        body: buildOpportunityReportSection(rwaOpportunity),
      },
      {
        id: "summary",
        title: "Executive Summary",
        body:
          "The dominant read remains bull expansion with internal rotation and lower participation outside narrative leaders.",
      },
      {
        id: "evidence",
        title: "Evidence",
        body:
          "Sentiment is improving gradually, volume confirms continuation, and breadth is stabilizing without a fresh broad impulse.",
      },
      {
        id: "narratives",
        title: "Narratives",
        body:
          "Strong narratives remain concentrated in a few clusters, reinforcing an increasingly selective institutional market.",
      },
      {
        id: "opportunities",
        title: "Opportunities",
        body:
          "The clearest opportunity is capturing continuation in clusters with the strongest execution quality and liquidity.",
      },
      {
        id: "risks",
        title: "Risks",
        body:
          "An abrupt regime change or sharp profit-taking in leaders could hit correlated assets faster than expected.",
      },
    ],
  },
  {
    id: "report-cycle",
    title: "Altcoin Cycle Notes",
    reportType: "Cycle",
    createdAt: "2026-06-08",
    tone: "cautious",
    author: "AlphaOS Research Desk",
    tags: ["Altcoins", "Cycle", "Breadth"],
    executiveSummary:
      "The cycle still supports selective continuation, but it now demands tighter entry discipline and stronger risk control.",
    opportunityIntelligence: layer2Opportunity,
    sections: [
      {
        id: "opportunity-intelligence",
        title: "Opportunity Intelligence",
        body: buildOpportunityReportSection(layer2Opportunity),
      },
      {
        id: "summary",
        title: "Executive Summary",
        body:
          "The altcoin cycle is advancing less uniformly, with fewer high-quality opportunities outside the leading themes.",
      },
      {
        id: "evidence",
        title: "Evidence",
        body:
          "Wider dispersion between winners and losers, weakening traction in marginal segments, and greater dependence on narrative support.",
      },
      {
        id: "narratives",
        title: "Narratives",
        body:
          "The market is rewarding thematic coherence and liquidity rather than broad beta expansion.",
      },
      {
        id: "opportunities",
        title: "Opportunities",
        body:
          "Tactical positioning works best in assets that combine relative strength, a clear thesis, and durable narrative evidence.",
      },
      {
        id: "risks",
        title: "Risks",
        body:
          "The overlap between thematic concentration and weaker breadth raises the risk of fast reversals in fragile assets.",
      },
    ],
  },
]

