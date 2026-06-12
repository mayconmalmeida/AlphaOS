import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RagAnswer, RagEvidenceItem } from "@/services/rag"

type EvidencePanelProps = {
  evidence: RagEvidenceItem[]
  answer: RagAnswer | null
}

export function EvidencePanel({ evidence, answer }: EvidencePanelProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <Card className="bg-card/40 lg:col-span-5">
        <CardHeader>
          <CardTitle>Evidence Panel</CardTitle>
          <CardDescription>Evidence retrieved before the answer is generated.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {evidence.map((item) => (
            <div key={item.id} className="rounded-xl border bg-background/35 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {item.sourceType} · {Math.round(item.relevanceScore * 100)}%
                  </div>
                </div>
                <Badge variant="outline">{item.sourceType}</Badge>
              </div>
              <div className="mt-3 text-sm text-foreground/90">{item.content}</div>
              <div className="mt-3 text-xs text-muted-foreground">{item.reasoning}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/40 lg:col-span-7">
        <CardHeader>
          <CardTitle>Answer With Citations</CardTitle>
          <CardDescription>
            The answer uses only the context retrieved by the RAG engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {answer ? (
            <>
              <div className="rounded-xl border bg-background/35 p-5">
                <div className="text-sm leading-7 text-foreground/95">{answer.answer}</div>
                <div className="mt-4 text-xs text-muted-foreground">{answer.reasoning}</div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {answer.evidenceUsed.map((citation) => (
                  <div key={citation.evidenceId} className="rounded-xl border bg-background/35 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium">{citation.title}</div>
                      <Badge variant="secondary">
                        {Math.round(citation.relevanceScore * 100)}%
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {citation.sourceType}
                    </div>
                    <div className="mt-3 text-sm text-foreground/90">{citation.reasoning}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
                Unsupported claims blocked: {answer.unsupportedClaimsBlocked ? "yes" : "no"}
              </div>
            </>
          ) : (
            <div className="rounded-xl border bg-background/35 p-4 text-sm text-muted-foreground">
              Generate an answer to inspect citations and reasoning by evidence item.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

