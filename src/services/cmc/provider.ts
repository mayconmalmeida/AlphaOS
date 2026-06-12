import type {
  CmcCategoryDto,
  CmcMarketPulseDto,
  CmcNarrativeDto,
  CmcNewsItemDto,
  CmcTechnicalDto,
  CmcQuoteDto,
} from "@/services/cmc/dto"

export type CmcProvider = {
  getMarketPulse(): Promise<CmcMarketPulseDto>
  getNarratives(): Promise<CmcNarrativeDto[]>
  getNews(): Promise<CmcNewsItemDto[]>
  getCategories(): Promise<CmcCategoryDto[]>
  getTechnicals(symbols: string[]): Promise<CmcTechnicalDto[]>
  getQuotes(symbols: string[]): Promise<CmcQuoteDto[]>
}

