import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  FileText,
  Layers3,
  LineChart,
  Radar,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const journeyStart = "/journey"

const workflowSteps = [
  "Opportunity",
  "Why Now",
  "Evidence",
  "Historical Analogue",
  "Market Replay",
  "Strategy",
  "Research Report",
]

const researchWorkflow = [
  {
    icon: Search,
    title: "Detect the opportunity",
    body: "Ranks explainable setups from CoinMarketCap market, category, and narrative signals.",
  },
  {
    icon: Radar,
    title: "Explain why now",
    body: "Surfaces timing, momentum, sentiment, and catalyst logic in one guided workflow.",
  },
  {
    icon: ShieldCheck,
    title: "Prove with evidence",
    body: "Connects claims to traceable quotes, technicals, news, and supporting context.",
  },
  {
    icon: Layers3,
    title: "Compare historical analogues",
    body: "Matches current regimes against market memory so each thesis has precedent.",
  },
  {
    icon: BrainCircuit,
    title: "Generate strategy candidates",
    body: "Turns research into simulated paths, assumptions, risks, and decision criteria.",
  },
  {
    icon: FileText,
    title: "Produce research reports",
    body: "Packages the thesis into an institutional-grade report ready for review.",
  },
]

const beforeAlphaOS = [
  "Charts scattered across tools",
  "News and sentiment disconnected",
  "Narratives tracked manually",
  "Research takes hours",
  "Conclusions are hard to audit",
]

const afterAlphaOS = [
  "One guided research workflow",
  "CoinMarketCap intelligence connected",
  "Evidence and analogues explained",
  "Reports generated in minutes",
  "Every thesis is traceable",
]

const intelligenceInputs = ["Quotes", "Technicals", "News", "Sentiment", "Categories", "Narratives"]

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg border bg-card/70 shadow-glass-sm">
        <img src="/AlphaOS_Logo.png" alt="AlphaOS" className="h-full w-full object-contain" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-base font-semibold tracking-tight">AlphaOS</div>
        <div className="text-xs text-muted-foreground">Autonomous Market Research Agent</div>
      </div>
    </div>
  )
}

function WorkflowPreview() {
  return (
    <div className="rounded-xl border bg-card/45 p-3 shadow-glass-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b pb-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Research workflow
          </div>
          <div className="mt-1 font-display text-lg font-semibold tracking-tight">
            Signal to decision-ready report
          </div>
        </div>
        <Badge variant="success">Live Intelligence</Badge>
      </div>

      <div className="mt-4 grid gap-2">
        {workflowSteps.map((step, index) => (
          <div
            key={step}
            className="group grid gap-2 rounded-lg border bg-background/35 p-3 transition-colors hover:bg-background/45 sm:grid-cols-[28px_minmax(0,1fr)_24px] sm:items-center"
          >
            <div className="grid h-7 w-7 place-items-center rounded-md border bg-card/70 font-display text-xs font-semibold text-primary">
              {index + 1}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{step}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {index === 0
                  ? "Prioritized market setup"
                  : index === 1
                    ? "Timing and catalyst logic"
                    : index === 2
                      ? "Auditable source trail"
                      : index === 3
                        ? "Comparable regimes"
                        : index === 4
                          ? "Scenario simulation"
                          : index === 5
                            ? "Candidate paths and risks"
                            : "Institutional output"}
              </div>
            </div>
            <ChevronRight className="hidden h-4 w-4 justify-self-end text-muted-foreground sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body?: string
}) {
  return (
    <div className="max-w-3xl">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{eyebrow}</div>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      {body ? <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">{body}</p> : null}
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <BrandMark />

          <nav className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link to="/research" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                View Research Reports
              </Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link to={journeyStart} className="flex items-center gap-2">
                Explore Today&apos;s Best Opportunity
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </header>

        <main>
          <section className="grid gap-8 py-10 md:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge>CoinMarketCap Intelligence</Badge>
                <Badge variant="secondary">Research and simulation only</Badge>
              </div>

              <div className="mt-6 text-sm font-medium text-muted-foreground">AlphaOS</div>
              <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
                Turn CoinMarketCap Intelligence Into Investment Research
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Discover opportunities, understand why they matter, compare historical analogues, and generate
                institutional-grade research reports in minutes.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to={journeyStart} className="flex items-center gap-2">
                    Explore Today&apos;s Best Opportunity
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                  <a href="#workflow" className="flex items-center gap-2">
                    View Research Workflow
                    <Route className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["Agent type", "Market research"],
                  ["Primary output", "Research report"],
                  ["Advice status", "Not financial advice"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border bg-card/35 px-3 py-2.5">
                    <div className="text-[11px] text-muted-foreground">{label}</div>
                    <div className="mt-1 font-display text-base font-semibold tracking-tight">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <WorkflowPreview />
          </section>

          <section id="workflow" className="border-t py-10 md:py-14">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="From signal to research"
                title="A guided workflow for explainable opportunities"
                body="AlphaOS turns market signals into a structured research path with evidence, analogues, simulated strategy candidates, and traceable reports."
              />
              <Button asChild variant="outline" className="w-full md:w-auto">
                <Link to={journeyStart} className="flex items-center gap-2">
                  Start Workflow
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {researchWorkflow.map((item) => (
                <div key={item.title} className="rounded-xl border bg-card/40 p-4 shadow-glass-sm">
                  <item.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 border-t py-10 md:grid-cols-2 md:py-14">
            <div className="rounded-xl border bg-card/35 p-5">
              <div className="font-display text-xl font-semibold tracking-tight">Before AlphaOS</div>
              <div className="mt-5 grid gap-3">
                {beforeAlphaOS.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card/50 p-5 shadow-glass-sm">
              <div className="font-display text-xl font-semibold tracking-tight">After AlphaOS</div>
              <div className="mt-5 grid gap-3">
                {afterAlphaOS.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-7 border-t py-10 md:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeading
              eyebrow="Intelligence layer"
              title="Powered by CoinMarketCap Intelligence"
              body="AlphaOS transforms market inputs into explainable opportunities, historical memory, strategy candidates, and institutional research reports."
            />

            <div className="rounded-xl border bg-card/40 p-4 shadow-glass-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                {intelligenceInputs.map((input, index) => (
                  <div key={input} className="flex items-center justify-between rounded-lg border bg-background/35 px-3 py-3">
                    <div className="flex items-center gap-2">
                      {index % 2 === 0 ? (
                        <BarChart3 className="h-4 w-4 text-primary" />
                      ) : (
                        <LineChart className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-sm font-medium">{input}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">verified</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border bg-background/35 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Transformed into</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Opportunity", "Why now", "Analogue", "Strategy", "Report"].map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="border-t py-10 md:py-14">
            <SectionHeading
              eyebrow="Product preview"
              title="A real research terminal, not a generic AI wrapper"
              body="The landing page now mirrors the density and confidence of the dashboard: prioritized opportunities, evidence context, market memory, and report output in one product experience."
            />

            <div className="mt-7 rounded-xl border bg-card/45 p-3 shadow-glass-sm">
              <div className="grid gap-3 lg:grid-cols-12">
                <div className="rounded-lg border bg-background/35 p-4 lg:col-span-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground">Today&apos;s Alpha Opportunity</div>
                      <div className="mt-1 font-display text-xl font-semibold tracking-tight">
                        Narrative rotation with technical confirmation
                      </div>
                    </div>
                    <Badge>Confidence 86%</Badge>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {["Why Now", "Evidence", "Analogue"].map((item) => (
                      <div key={item} className="rounded-lg border bg-card/45 p-3">
                        <div className="text-[11px] text-muted-foreground">{item}</div>
                        <div className="mt-2 h-2 rounded bg-primary/70" />
                        <div className="mt-2 h-2 w-2/3 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border bg-card/45 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BookOpenCheck className="h-4 w-4 text-primary" />
                      Research Report
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Thesis, evidence trail, historical comparison, assumptions, risk notes, and simulated strategy
                      candidates.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 lg:col-span-5">
                  <div className="rounded-lg border bg-background/35 p-4">
                    <div className="text-[11px] text-muted-foreground">Market Replay</div>
                    <div className="mt-3 flex h-28 items-end gap-2">
                      {[42, 64, 52, 74, 68, 88, 76, 92].map((height, index) => (
                        <div
                          key={`${height}-${index}`}
                          className="flex-1 rounded-t bg-primary/70"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-background/35 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Strategy candidates</div>
                        <div className="mt-1 font-display text-lg font-semibold tracking-tight">3 scenarios</div>
                      </div>
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="mt-3 grid gap-2">
                      {["Base", "Expansion", "Stress"].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-md border bg-card/45 px-3 py-2 text-sm">
                          <span>{item}</span>
                          <span className="text-muted-foreground">simulated</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t py-8 text-xs text-muted-foreground">
          Research and simulation only. Not financial advice.
        </footer>
      </div>
    </div>
  )
}
