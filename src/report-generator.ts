import * as fs from 'fs/promises';
import { PageAnalysis, CrawlSummary, EnglishContentReport } from './types';
import { config } from './config';
import ISO6391 from 'iso-639-1';

export class ReportGenerator {
  async saveResults(results: PageAnalysis[]): Promise<void> {
    try {
      const jsonData = JSON.stringify(results, null, 2);
      await fs.writeFile(config.outputFile, jsonData, 'utf8');
      console.log(`💾 Results saved to ${config.outputFile}`);
      
      await this.saveEnglishContentReport(results);
    } catch (error: any) {
      console.error(`❌ Failed to save results: ${error.message}`);
      throw error;
    }
  }

  async saveEnglishContentReport(results: PageAnalysis[]): Promise<void> {
    try {
      const englishReport: EnglishContentReport[] = results
        .filter(page => page.english_content && page.english_content.word_count > 0)
        .map(page => ({
          url: page.url,
          english_percentage: page.percentages.english,
          english_sentences: page.english_content!.sentences,
          english_words: [...new Set(page.english_content!.words)].sort(),
          total_english_words: page.english_content!.word_count,
          sample_sentences: page.english_content!.sentences.slice(0, 5)
        }))
        .sort((a, b) => b.english_percentage - a.english_percentage);

      const jsonData = JSON.stringify(englishReport, null, 2);
      await fs.writeFile(config.englishContentFile, jsonData, 'utf8');
      console.log(`📝 English content report saved to ${config.englishContentFile}`);
      console.log(`🔍 Found English content on ${englishReport.length} pages`);
    } catch (error: any) {
      console.error(`❌ Failed to save English content report: ${error.message}`);
    }
  }

  generateSummary(results: PageAnalysis[]): CrawlSummary {
    const totalPages = results.length;
    
    if (totalPages === 0) {
      return {
        totalPages: 0,
        averagePrimaryPercentage: 0,
        averageEnglishPercentage: 0,
        pagesWithHighEnglishContent: [],
        pagesWithoutPrimary: []
      };
    }

    const totalPrimaryPercentage = results.reduce((sum, page) => sum + page.percentages.primary, 0);
    const totalEnglishPercentage = results.reduce((sum, page) => sum + page.percentages.english, 0);

    const averagePrimaryPercentage = Math.round((totalPrimaryPercentage / totalPages) * 100) / 100;
    const averageEnglishPercentage = Math.round((totalEnglishPercentage / totalPages) * 100) / 100;

    const pagesWithHighEnglishContent = results
      .filter(page => page.percentages.english > 30)
      .map(page => ({
        url: page.url,
        englishPercentage: page.percentages.english
      }))
      .sort((a, b) => b.englishPercentage - a.englishPercentage);

    const pagesWithoutPrimary = results
      .filter(page => page.percentages.primary === 0)
      .map(page => page.url);

    return {
      totalPages,
      averagePrimaryPercentage,
      averageEnglishPercentage,
      pagesWithHighEnglishContent,
      pagesWithoutPrimary
    };
  }

  logSummary(summary: CrawlSummary): void {
    const primaryLanguageName = ISO6391.getName(config.primaryLanguage) || config.primaryLanguage;
    console.log('\n' + '='.repeat(60));
    console.log('📊 CRAWL SUMMARY');
    console.log('='.repeat(60));
    console.log(`📄 Total pages analyzed: ${summary.totalPages}`);
    console.log(`🌐 Average ${primaryLanguageName} content: ${summary.averagePrimaryPercentage}%`);
    console.log(`🇬🇧 Average English content: ${summary.averageEnglishPercentage}%`);
    
    const pagesWithEnglishContent = summary.totalPages - summary.pagesWithoutPrimary.length;
    console.log(`📝 Pages with English content: ${pagesWithEnglishContent}/${summary.totalPages}`);
    
    console.log(`\n📈 Pages with >30% English content (${summary.pagesWithHighEnglishContent.length}):`);
    summary.pagesWithHighEnglishContent.forEach(page => {
      console.log(`   - ${page.englishPercentage}%: ${page.url}`);
    });

    console.log(`\n❌ Pages with no ${primaryLanguageName} content (${summary.pagesWithoutPrimary.length}):`);
    summary.pagesWithoutPrimary.forEach(url => {
      console.log(`   - ${url}`);
    });

    console.log(`\n📄 Detailed English content saved to: ${config.englishContentFile}`);
    console.log('\n' + '='.repeat(60));
  }
}