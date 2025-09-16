import { HttpClient } from './http-client';
import { ContentExtractor } from './content-extractor';
import { LanguageDetector } from './language-detector';
import { PageAnalysis } from './types';

export class PageAnalyzer {
  private httpClient: HttpClient;
  private contentExtractor: ContentExtractor;
  private languageDetector: LanguageDetector;

  constructor() {
    this.httpClient = new HttpClient();
    this.contentExtractor = new ContentExtractor();
    this.languageDetector = new LanguageDetector();
  }
// The analyzePage method:

// Fetches the page’s HTML.
// Extracts visible text.
// If text is too short, logs a warning and returns null.
// Detects language stats and calculates percentages.
// Determines the dominant language.
// Compiles a PageAnalysis object with:

// URL.
// Dominant language (pl, en, or mixed).
// Language percentages (Polish, English, others).
// Total word count.
// English content details (if any English words are detected).


// Logs the analysis results (dominant language, percentages, total words).
// Returns the PageAnalysis object or null on error.
  async analyzePage(url: string): Promise<PageAnalysis | null> {
    try {
      console.log(`🔍 Analyzing: ${url}`);
      
      const response = await this.httpClient.get(url);
      const visibleText = this.contentExtractor.extractVisibleText(response.data);
      
      if (visibleText.length < 50) {
        console.log(`⚠️  Skipping ${url}: insufficient text content`);
        return null;
      }

      const languageStats = this.languageDetector.detectLanguageStats(visibleText);
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
      console.log(`   - Polish: ${percentages.polish}%, English: ${percentages.english}%`);
      console.log(`   - Total words: ${totalWords}`);

      return analysis;

    } catch (error: any) {
      console.log(`❌ Failed to analyze ${url}: ${error.message}`);
      return null;
    }
  }
}