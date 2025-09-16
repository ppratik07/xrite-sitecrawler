export interface PageAnalysis {
  url: string;
  dominant_language: 'pl' | 'en' | 'mixed';
  percentages: {
    polish: number;
    english: number;
    others: Array<{
      language: string;
      percentage: number;
    }>;
  };
  total_words: number;
  english_content?: {
    sentences: string[];
    words: string[];
    word_count: number;
  };
}

export interface LanguageStats {
  [languageCode: string]: number;
}

export interface EnglishContentReport {
  url: string;
  english_percentage: number;
  english_sentences: string[];
  english_words: string[];
  total_english_words: number;
  sample_sentences: string[];
}

export interface CrawlerConfig {
  startUrl: string;
  maxUrls: number;
  requestDelay: number;
  pathFilter: string;
  outputFile: string;
  englishContentFile: string;
  userAgent: string;
}

export interface CrawlSummary {
  totalPages: number;
  averagePolishPercentage: number;
  averageEnglishPercentage: number;
  pagesWithHighEnglishContent: Array<{
    url: string;
    englishPercentage: number;
  }>;
  pagesWithoutPolish: string[];
}