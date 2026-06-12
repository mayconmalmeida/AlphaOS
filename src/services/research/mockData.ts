import type { ResearchReport } from "@/services/research/types"

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
      "AI infrastructure mantém liderança narrativa, sustentada por rotação de capital, melhora de sentimento e concentração em ativos de maior qualidade.",
    sections: [
      {
        id: "summary",
        title: "Executive Summary",
        body:
          "O fluxo de mercado migra de beta especulativo para infraestrutura, sugerindo continuidade temática com menor dispersão positiva.",
      },
      {
        id: "evidence",
        title: "Evidence",
        body:
          "Força narrativa persistente, expansão de volume nos líderes, aceleração de headlines e similaridade histórica com fases anteriores de consolidação de tese.",
      },
      {
        id: "narratives",
        title: "Narratives",
        body:
          "AI e infraestrutura seguem dominando atenção, enquanto temas secundários perdem profundidade e fluxo marginal.",
      },
      {
        id: "opportunities",
        title: "Opportunities",
        body:
          "Buscar ativos líderes com liquidez robusta e sensibilidade direta à tese principal, evitando caudas frágeis com baixa sustentação de volume.",
      },
      {
        id: "risks",
        title: "Risks",
        body:
          "Concentração excessiva, perda de breadth e fadiga narrativa podem reduzir a assimetria e exigir realização parcial.",
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
      "O mercado opera em expansão construtiva, porém com sinais iniciais de concentração e seletividade crescente na alocação.",
    sections: [
      {
        id: "summary",
        title: "Executive Summary",
        body:
          "A leitura dominante é de bull expansion com rotação interna e menor participação fora dos líderes narrativos.",
      },
      {
        id: "evidence",
        title: "Evidence",
        body:
          "Sentimento melhora gradualmente, volume confirma continuidade e breadth estabiliza sem novo impulso amplo.",
      },
      {
        id: "narratives",
        title: "Narratives",
        body:
          "Narrativas fortes permanecem concentradas em poucos clusters, reforçando seletividade institucional.",
      },
      {
        id: "opportunities",
        title: "Opportunities",
        body:
          "Oportunidade mais clara está em capturar continuidade nos clusters com maior qualidade de execução e liquidez.",
      },
      {
        id: "risks",
        title: "Risks",
        body:
          "Mudança abrupta de regime ou realização dos líderes pode contaminar ativos correlacionados mais rapidamente que o esperado.",
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
      "A leitura de ciclo sugere continuidade seletiva, mas com necessidade maior de disciplina em entradas e controle de risco.",
    sections: [
      {
        id: "summary",
        title: "Executive Summary",
        body:
          "O ciclo altcoin avança de forma menos homogênea, com compressão de oportunidades fora dos temas líderes.",
      },
      {
        id: "evidence",
        title: "Evidence",
        body:
          "Aumento de dispersão entre vencedores e perdedores, queda de tração em segmentos marginais e maior dependência de narrativa.",
      },
      {
        id: "narratives",
        title: "Narratives",
        body:
          "O mercado passa a premiar coerência temática e liquidez, em vez de expansão ampla de beta.",
      },
      {
        id: "opportunities",
        title: "Opportunities",
        body:
          "Posicionamento tático em ativos que combinam força relativa, tese clara e evidência narrativa sustentável.",
      },
      {
        id: "risks",
        title: "Risks",
        body:
          "Sobreposição entre concentração temática e menor breadth eleva o risco de reversões rápidas em ativos frágeis.",
      },
    ],
  },
]

