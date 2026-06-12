import { Link } from "react-router-dom"
import { ArrowRight, FileText, Radar, Sparkles, TimerReset } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { demoBuild } from "@/config/demoBuild"

export default function Landing() {
  const journeyStart = "/journey"

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg border bg-card/70 shadow-glass-sm">
              <img
                src="/AlphaOS_Logo.png"
                alt="AlphaOS"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold tracking-tight">
                AlphaOS
              </div>
              <div className="text-xs text-muted-foreground">
                The Autonomous Market Research Agent
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
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
          </div>
        </header>

        <section className="mt-10 sm:mt-14">
          <div className="rounded-2xl border bg-card/40 p-6 shadow-glass-sm backdrop-blur sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Premium</Badge>
              <Badge variant="secondary">Explainable research</Badge>
              <Badge variant="secondary">CoinMarketCap Intelligence</Badge>
            </div>

            <div className="mt-6 text-sm font-medium text-muted-foreground">AlphaOS</div>
            <h1 className="mt-6 max-w-3xl font-display text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              {demoBuild.landingHeroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">
              {demoBuild.landingSubheadline} AlphaOS turns market memory, evidence, and strategy
              evolution into an institutional-grade research workflow.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to={journeyStart} className="flex items-center gap-2">
                  Explore Today&apos;s Best Opportunity
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/research" className="flex items-center gap-2">
                  View Research Reports
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-background/40 p-4">
                <div className="text-xs text-muted-foreground">Trading calls</div>
                <div className="mt-1 font-display text-lg font-semibold">No</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Explainable hypotheses, not speculative calls.
                </div>
              </div>
              <div className="rounded-xl border bg-background/40 p-4">
                <div className="text-xs text-muted-foreground">Market memory</div>
                <div className="mt-1 font-display text-lg font-semibold">Yes</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Daily snapshots and historical analogs.
                </div>
              </div>
              <div className="rounded-xl border bg-background/40 p-4">
                <div className="text-xs text-muted-foreground">Evidence</div>
                <div className="mt-1 font-display text-lg font-semibold">Always</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  No black box. Every score includes reasoning.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 sm:mt-14">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Platform
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                Market memory, narratives, and strategy evolution
              </h2>
            </div>
            <div className="hidden text-sm text-muted-foreground md:block">
              Premium design, clear workflows, and controlled information density.
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-card/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TimerReset className="h-4 w-4 text-primary" />
                  Market Memory
                </CardTitle>
                <CardDescription>Historical snapshots with similar-market retrieval.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Store daily market snapshots and compare regimes like a real research operating
                system.
              </CardContent>
            </Card>

            <Card className="bg-card/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radar className="h-4 w-4 text-primary" />
                  Narrative Intelligence
                </CardTitle>
                <CardDescription>Track velocity, strength, rotation, and correlation.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                See where attention and capital are moving before the market consensus forms.
              </CardContent>
            </Card>

            <Card className="bg-card/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Alpha Discovery
                </CardTitle>
                <CardDescription>Explainable hypotheses, not recommendations.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Evidence, analogs, and clear why-now logic in one institutional interface.
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="mt-16 border-t pt-8 text-xs text-muted-foreground">
          Research &amp; simulation only. Not financial advice.
        </footer>
      </div>
    </div>
  )
}

