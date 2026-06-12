import { FastForward, Pause, Play, RotateCcw, Sparkles, TimerReset } from "lucide-react"
import { useLocation } from "react-router-dom"

import { GuidedJourneyBanner } from "@/components/journey/GuidedJourneyBanner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMarketReplay } from "@/hooks/useMarketReplay"
import { parseGuidedJourney } from "@/lib/guidedJourney"

function toneClass(tone: "positive" | "neutral" | "negative") {
  if (tone === "positive") return "text-primary"
  if (tone === "negative") return "text-red-400"
  return "text-yellow-300"
}

export default function MarketReplay() {
  const location = useLocation()
  const journey = parseGuidedJourney(location.search)
  const {
    scenario,
    currentFrame,
    currentIndex,
    isPlaying,
    speed,
    progressPct,
    visibleEvents,
    loading,
    error,
    retry,
    togglePlay,
    reset,
    stepForward,
    cycleSpeed,
    setFrameIndex,
  } = useMarketReplay()

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Market Replay
        </div>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Replay how market narratives unfolded
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Step through past market regimes with context, capital rotation, signals, and lessons.
        </p>
      </div>

      {journey.active ? <GuidedJourneyBanner hypothesisId={journey.hypothesisId} /> : null}

      <Card className="bg-card/40">
        <CardHeader>
          <CardTitle>{scenario?.title ?? "Market Replay"}</CardTitle>
          <CardDescription>
            {scenario?.dateRange ?? "Loading scenario..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="grid gap-4">
              <div className="h-[110px] animate-pulse rounded-xl border bg-background/30" />
              <div className="h-[220px] animate-pulse rounded-xl border bg-background/30" />
              <div className="h-[260px] animate-pulse rounded-xl border bg-background/30" />
            </div>
          ) : error ? (
            <div className="rounded-xl border bg-background/35 p-5">
              <div className="text-sm font-medium">Failed to load replay</div>
              <div className="mt-1 text-sm text-muted-foreground">{error.message}</div>
              <Button variant="outline" className="mt-3" onClick={retry}>
                Retry
              </Button>
            </div>
          ) : scenario && currentFrame ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button size="icon" variant="outline" aria-label="Replay" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Step forward"
                  onClick={stepForward}
                >
                  <TimerReset className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" aria-label="Speed" onClick={cycleSpeed}>
                  <FastForward className="h-4 w-4" />
                </Button>
                <Badge variant="secondary">Speed {speed.toFixed(1)}x</Badge>
                <Badge variant="outline">
                  {currentFrame.timestampLabel} / Day {scenario.durationDays}
                </Badge>
                <Badge variant="outline">{Math.round(progressPct)}%</Badge>
              </div>

              <div className="rounded-xl border bg-background/35 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">Timeline Scrubber</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Move through each frame to see narrative and capital rotation evolve.
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{currentFrame.timestampLabel}</div>
                </div>
                <div className="mt-4">
                  <input
                    type="range"
                    min={0}
                    max={scenario.frames.length - 1}
                    step={1}
                    value={currentIndex}
                    onChange={(e) => setFrameIndex(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-12">
                <Card className="bg-background/20 lg:col-span-7">
                  <CardHeader>
                    <CardTitle>Current Frame</CardTitle>
                    <CardDescription>{scenario.thesis}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border bg-card/40 p-4">
                        <div className="text-xs text-muted-foreground">Narrative Leader</div>
                        <div className="mt-1 font-display text-lg font-semibold tracking-tight">
                          {currentFrame.narrativeLeader}
                        </div>
                      </div>
                      <div className="rounded-xl border bg-card/40 p-4">
                        <div className="text-xs text-muted-foreground">Rotation</div>
                        <div className="mt-1 text-sm text-foreground/90">
                          {currentFrame.rotation}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-xl border bg-card/40 p-4">
                        <div className="text-xs text-muted-foreground">Narrative Strength</div>
                        <div className="mt-1 font-display text-lg font-semibold tracking-tight">
                          {currentFrame.narrativeStrength}
                        </div>
                      </div>
                      <div className="rounded-xl border bg-card/40 p-4">
                        <div className="text-xs text-muted-foreground">Sentiment</div>
                        <div className="mt-1 font-display text-lg font-semibold tracking-tight">
                          {currentFrame.sentiment}
                        </div>
                      </div>
                      <div className="rounded-xl border bg-card/40 p-4">
                        <div className="text-xs text-muted-foreground">Breadth</div>
                        <div className="mt-1 font-display text-lg font-semibold tracking-tight">
                          {currentFrame.marketBreadth}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card/40 p-4">
                      <div className="text-xs text-muted-foreground">Volume Trend</div>
                      <div className="mt-1 text-sm text-foreground/90">
                        {currentFrame.volumeTrend}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {currentFrame.notableAssets.map((asset) => (
                        <Badge key={asset} variant="secondary">
                          {asset}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/20 lg:col-span-5">
                  <CardHeader>
                    <CardTitle>Scenario Context</CardTitle>
                    <CardDescription>{scenario.context}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scenario.outcomes.map((item) => (
                      <div key={item.label} className="rounded-xl border bg-card/40 p-4">
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div
                          className={[
                            "mt-1 font-display text-lg font-semibold tracking-tight",
                            toneClass(item.tone),
                          ].join(" ")}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-12">
                <Card className="bg-background/20 lg:col-span-7">
                  <CardHeader>
                    <CardTitle>Events Timeline</CardTitle>
                    <CardDescription>Events revealed up to the current frame.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {visibleEvents.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-start justify-between gap-4 rounded-lg border bg-card/50 p-3"
                      >
                        <div className="min-w-[68px] text-xs text-muted-foreground">
                          {row.timestampLabel}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-sm font-medium">{row.title}</div>
                            <Badge variant="outline">{row.category}</Badge>
                            <Badge variant="secondary">{row.impact}</Badge>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {row.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-background/20 lg:col-span-5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Lessons
                    </CardTitle>
                    <CardDescription>Key lessons from this replay.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scenario.lessons.map((lesson) => (
                      <div key={lesson} className="rounded-xl border bg-card/40 p-4 text-sm text-foreground/90">
                        {lesson}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card/40">
                <CardHeader>
                  <CardTitle>What Happened Next</CardTitle>
                  <CardDescription>
                    30, 60, and 90-day follow-through transforms replay into a learning engine.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {scenario.followThrough.map((item) => (
                    <div key={item.horizon} className="rounded-xl border bg-background/35 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-display text-base font-semibold tracking-tight">
                          {item.horizon.toUpperCase()}
                        </div>
                        <Badge variant="secondary">{item.horizon}</Badge>
                      </div>
                      <div className="mt-3 text-sm text-foreground/90">{item.whatHappenedNext}</div>
                      <div className="mt-3 text-xs text-muted-foreground">Market Evolution</div>
                      <div className="mt-1 text-sm text-muted-foreground">{item.marketEvolution}</div>
                      <div className="mt-4 text-xs text-muted-foreground">Winning Narratives</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.winningNarratives.map((winner) => (
                          <Badge key={winner}>{winner}</Badge>
                        ))}
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground">Losing Narratives</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.losingNarratives.map((loser) => (
                          <Badge key={loser} variant="outline">
                            {loser}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

