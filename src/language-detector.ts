import { franc } from 'franc';
import ISO6391 from 'iso-639-1';
import { LanguageStats } from './types';

export class LanguageDetector {
  private englishSentences: string[] = [];
  private englishWords: string[] = [];

  detectLanguageStats(text: string): LanguageStats {
    const sentences = this.splitIntoSentences(text);
    const wordCounts: LanguageStats = {};
    
    // Reset English content for new analysis
    this.englishSentences = [];
    this.englishWords = [];
    
    for (const sentence of sentences) {
      if (sentence.length < 10) continue; // Skip very short sentences
      
      const detectedLang = franc(sentence, { minLength: 10 });
      let langCode = detectedLang;
      
      // Convert franc codes to standard ISO codes
      if (detectedLang === 'pol') langCode = 'pl';
      else if (detectedLang === 'eng') langCode = 'en';
      else if (ISO6391.validate(detectedLang)) langCode = detectedLang;
      else langCode = 'unknown';
      
      // Collect English content
      if (langCode === 'en') {
        this.englishSentences.push(sentence.trim());
        const words = this.extractWords(sentence);
        this.englishWords.push(...words);
      }
      
      const wordCount = this.countWords(sentence);
      wordCounts[langCode] = (wordCounts[langCode] || 0) + wordCount;
    }
    
    return wordCounts;
  }

  getEnglishContent(): { sentences: string[]; words: string[]; word_count: number } {
    return {
      sentences: [...this.englishSentences],
      words: [...this.englishWords],
      word_count: this.englishWords.length
    };
  }

  calculatePercentages(languageStats: LanguageStats): {
    polish: number;
    english: number;
    others: Array<{ language: string; percentage: number }>;
  } {
    const totalWords = Object.values(languageStats).reduce((sum, count) => sum + count, 0);
    
    if (totalWords === 0) {
      return { polish: 0, english: 0, others: [] };
    }
    
    const polish = ((languageStats['pl'] || 0) / totalWords) * 100;
    const english = ((languageStats['en'] || 0) / totalWords) * 100;
    
    const others = Object.entries(languageStats)
      .filter(([lang]) => lang !== 'pl' && lang !== 'en')
      .map(([language, count]) => ({
        language: this.getLanguageName(language),
        percentage: (count / totalWords) * 100
      }))
      .filter(item => item.percentage > 0.5) // Only include languages with >0.5%
      .sort((a, b) => b.percentage - a.percentage);
    
    return {
      polish: Math.round(polish * 100) / 100,
      english: Math.round(english * 100) / 100,
      others
    };
  }

  getDominantLanguage(percentages: { polish: number; english: number }): 'pl' | 'en' | 'mixed' {
    const threshold = 60; // Consider it mixed if no language has >60%
    
    if (percentages.polish > threshold) return 'pl';
    if (percentages.english > threshold) return 'en';
    return 'mixed';
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+\s+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 5);
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter out very short words
      .filter(word => /^[a-z]+$/.test(word)); // Only English letters
  }

  private getLanguageName(code: string): string {
    const name = ISO6391.getName(code);
    return name || code;
  }
}