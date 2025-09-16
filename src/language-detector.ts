import { franc } from 'franc';
import ISO6391 from 'iso-639-1';
import { LanguageStats } from './types';
import { config } from './config';

export class LanguageDetector {
  private englishSentences: string[] = [];
  private englishWords: string[] = [];

  detectLanguageStats(text: string): LanguageStats {
    const sentences = this.splitIntoSentences(text);
    const wordCounts: LanguageStats = {};

    this.englishSentences = [];
    this.englishWords = [];

    for (const sentence of sentences) {
      if (sentence.length < 5) continue; // Lowered from 10
      const detectedLang = franc(sentence, { minLength: 5 }); // Lowered from 10
      let langCode = detectedLang;
      if (detectedLang === 'pol') langCode = 'pl';
      else if (detectedLang === 'eng') langCode = 'en';
      else if (detectedLang === 'fra') langCode = 'fr';
      else if (detectedLang === 'ita') langCode = 'it'; // Explicit mapping for Italian
      else if (ISO6391.validate(detectedLang)) langCode = detectedLang;
      else langCode = 'unknown';
      console.log(`📝 Sentence: "${sentence.slice(0, 50)}..." -> Detected: ${langCode}`);

      if (langCode === 'en') {
        this.englishSentences.push(sentence.trim());
        const words = this.extractWords(sentence);
        this.englishWords.push(...words);
      }

      const wordCount = this.countWords(sentence);
      wordCounts[langCode] = (wordCounts[langCode] || 0) + wordCount;
    }
    console.log(`📊 Language stats: ${JSON.stringify(wordCounts, null, 2)}`);
    return wordCounts;
  }

  getEnglishContent(): {
    sentences: string[];
    words: string[];
    word_count: number;
  } {
    return {
      sentences: [...this.englishSentences],
      words: [...this.englishWords],
      word_count: this.englishWords.length,
    };
  }

  calculatePercentages(languageStats: LanguageStats): {
    primary: number;
    english: number;
    others: Array<{ language: string; percentage: number }>;
  } {
    const totalWords = Object.values(languageStats).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalWords === 0) {
      return { primary: 0, english: 0, others: [] };
    }

    const primary = ((languageStats[config.primaryLanguage] || 0) / totalWords) * 100;
    const english = ((languageStats['en'] || 0) / totalWords) * 100;

    const others = Object.entries(languageStats)
      .filter(([lang]) => lang !== config.primaryLanguage && lang !== 'en')
      .map(([language, count]) => ({
        language: this.getLanguageName(language),
        percentage: (count / totalWords) * 100,
      }))
      .filter((item) => item.percentage > 0.5)
      .sort((a, b) => b.percentage - a.percentage);

    return {
      primary: Math.round(primary * 100) / 100,
      english: Math.round(english * 100) / 100,
      others,
    };
  }

  getDominantLanguage(percentages: {
    primary: number;
    english: number;
  }): string {
    const threshold = 60;
    if (percentages.primary > threshold) return config.primaryLanguage;
    if (percentages.english > threshold) return 'en';
    return 'mixed';
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 5);
  }

  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  private extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .filter((word) => /^[a-z]+$/.test(word));
  }

  private getLanguageName(code: string): string {
    const name = ISO6391.getName(code);
    return name || code;
  }
}