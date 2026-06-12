import { Link } from "react-router-dom"
import { ArrowRight, FileText, Radar, Sparkles, TimerReset } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg border bg-card/70 shadow-glass-sm">
              <div className="h-3 w-3 rounded-sm bg-primary" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold tracking-tight">
                AlphaOS
              </div>
              <div className="text-xs text-muted-foreground">
                Market Intelligence Operating System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/research" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Ver relatórios
              </Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                Explorar o alpha de hoje
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="mt-14">
          <div className="rounded-2xl border bg-card/40 p-10 shadow-glass-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Premium</Badge>
              <Badge variant="secondary">Explainable research</Badge>
              <Badge variant="secondary">Mock-first</Badge>
            </div>

            <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              The Market Intelligence Operating System
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              Descubra oportunidades antes que elas virem narrativas. AlphaOS organiza memória de
              mercado, evidências e evolução de estratégia como um produto institucional — não um bot.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Explorar o alpha de hoje
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/research" className="flex items-center gap-2">
                  View Research Reports
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-background/40 p-4">
                <div className="text-xs text-muted-foreground">Sinal</div>
                <div className="mt-1 font-display text-lg font-semibold">Não</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Hipóteses explicáveis, não “calls”.
                </div>
              </div>
              <div className="rounded-xl border bg-background/40 p-4">
                <div className="text-xs text-muted-foreground">Memória</div>
                <div className="mt-1 font-display text-lg font-semibold">Sim</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Snapshots diários e analogias históricas.
                </div>
              </div>
              <div className="rounded-xl border bg-background/40 p-4">
                <div className="text-xs text-muted-foreground">Evidência</div>
                <div className="mt-1 font-display text-lg font-semibold">Sempre</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Sem black-box. Cada score vem com reasoning.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Plataforma
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl">
                Memória, narrativas e evolução
              </h2>
            </div>
            <div className="hidden text-sm text-muted-foreground md:block">
              Visual premium. Fluxos claros. Densidade controlada.
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
                <CardDescription>Timeline premium + mercados similares.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Armazene snapshots diários e compare períodos como um sistema operacional de
                pesquisa.
              </CardContent>
            </Card>

            <Card className="bg-card/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radar className="h-4 w-4 text-primary" />
                  Narrative Intelligence
                </CardTitle>
                <CardDescription>Velocidade, força, rotação e correlação.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Entenda para onde atenção e capital estão migrando — antes do consenso.
              </CardContent>
            </Card>

            <Card className="bg-card/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Alpha Discovery
                </CardTitle>
                <CardDescription>Hipóteses explicáveis, não recomendações.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Evidências + analogias + “why now” em uma interface institucional.
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

