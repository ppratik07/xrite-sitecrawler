export interface PageAnalysis {
  url: string;
  dominant_language: string; // Changed to string to support any language code
  percentages: {
    primary: number; // Primary language (e.g., pl, it, fr)
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
  primaryLanguage: string; // Added to specify the primary language
}

export interface CrawlSummary {
  totalPages: number;
  averagePrimaryPercentage: number; // Changed from averagePolishPercentage
  averageEnglishPercentage: number;
  pagesWithHighEnglishContent: Array<{
    url: string;
    englishPercentage: number;
  }>;
  pagesWithoutPrimary: string[]; // Changed from pagesWithoutPolish
}