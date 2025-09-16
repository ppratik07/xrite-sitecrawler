import { HttpClient } from './http-client';
import { ContentExtractor } from './content-extractor';
import { LanguageDetector } from './language-detector';
import { PageAnalysis } from './types';
import { config } from './config';

export class PageAnalyzer {
  private httpClient: HttpClient;
  private contentExtractor: ContentExtractor;
  private languageDetector: LanguageDetector;

  constructor() {
    this.httpClient = new HttpClient();
    this.contentExtractor = new ContentExtractor();
    this.languageDetector = new LanguageDetector();
  }

  async analyzePage(url: string): Promise<PageAnalysis | null> {
    try {
      console.log(`🔍 Analyzing: ${url}`);
      
      const response = await this.httpClient.get(url);
      const visibleText = this.contentExtractor.extractVisibleText(response.data);
      
      console.log(`📜 Extracted text (first 500 chars): ${visibleText.slice(0, 500)}`); // Debug text
      if (visibleText.length < 50) {
        console.log(`⚠️  Skipping ${url}: insufficient text content`);
        return null;
      }

      const languageStats = this.languageDetector.detectLanguageStats(visibleText);
      console.log(`📊 Language stats: ${JSON.stringify(languageStats, null, 2)}`); // Debug stats
      const percentages = this.languageDetector.calculatePercentages(languageStats);
      const dominantLanguage = this.languageDetector.getDominantLanguage(percentages);
      const totalWords = Object.values(languageStats).reduce((sum, count) => sum + count, 0);
      const englishContent = this.languageDetector.getEnglishContent();

      const analysis: PageAnalysis = {
        url,
        dominant_language: dominantLanguage,
        percentages,
        total_words: totalWords
      };

      if (englishContent.word_count > 0) {
        analysis.english_content = englishContent;
      }

      console.log(`✅ Analysis complete for ${url}:`);
      console.log(`   - Dominant: ${dominantLanguage}`);
      console.log(`   - ${config.primaryLanguage}: ${percentages.primary}%, English: ${percentages.english}%`);
      console.log(`   - Total words: ${totalWords}`);

      return analysis;

    } catch (error: any) {
      console.log(`❌ Failed to analyze ${url}: ${error.message}`);
      return null;
    }
  }
}