import * as fs from 'fs/promises';
import { PageAnalysis, CrawlSummary, EnglishContentReport } from './types';
import { config } from './config';
// How It Works:

// saveResults:

// Writes all PageAnalysis objects to outputFile as JSON.
// Calls saveEnglishContentReport to generate the English content report.


// saveEnglishContentReport:

// Filters pages with English content.
// Creates an EnglishContentReport for each, including:

// URL.
// English percentage.
// English sentences and words.
// Total English word count.
// Sample sentences (first 5).


// Sorts by English percentage and saves to englishContentFile.


// generateSummary:

// Calculates average Polish and English percentages.
// Identifies pages with >30% English content and no Polish content.


// logSummary:

// Prints a detailed summary, including total pages, average percentages, and lists of notable pages.
export class ReportGenerator {
  async saveResults(results: PageAnalysis[]): Promise<void> {
    try {
      const jsonData = JSON.stringify(results, null, 2);
      await fs.writeFile(config.outputFile, jsonData, 'utf8');
      console.log(`💾 Results saved to ${config.outputFile}`);
      
      // Generate and save English content report
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
          english_words: [...new Set(page.english_content!.words)].sort(), // Remove duplicates and sort
          total_english_words: page.english_content!.word_count,
          sample_sentences: page.english_content!.sentences.slice(0, 5) // First 5 sentences as samples
        }))
        .sort((a, b) => b.english_percentage - a.english_percentage); // Sort by English percentage

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
        averagePolishPercentage: 0,
        averageEnglishPercentage: 0,
        pagesWithHighEnglishContent: [],
        pagesWithoutPolish: []
      };
    }

    const totalPolishPercentage = results.reduce((sum, page) => sum + page.percentages.polish, 0);
    const totalEnglishPercentage = results.reduce((sum, page) => sum + page.percentages.english, 0);

    const averagePolishPercentage = Math.round((totalPolishPercentage / totalPages) * 100) / 100;
    const averageEnglishPercentage = Math.round((totalEnglishPercentage / totalPages) * 100) / 100;

    const pagesWithHighEnglishContent = results
      .filter(page => page.percentages.english > 30)
      .map(page => ({
        url: page.url,
        englishPercentage: page.percentages.english
      }))
      .sort((a, b) => b.englishPercentage - a.englishPercentage);

    const pagesWithoutPolish = results
      .filter(page => page.percentages.polish === 0)
      .map(page => page.url);

    return {
      totalPages,
      averagePolishPercentage,
      averageEnglishPercentage,
      pagesWithHighEnglishContent,
      pagesWithoutPolish
    };
  }

  logSummary(summary: CrawlSummary): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CRAWL SUMMARY');
    console.log('='.repeat(60));
    console.log(`📄 Total pages analyzed: ${summary.totalPages}`);
    console.log(`🇵🇱 Average Polish content: ${summary.averagePolishPercentage}%`);
    console.log(`🇬🇧 Average English content: ${summary.averageEnglishPercentage}%`);
    
    const pagesWithEnglishContent = summary.totalPages - summary.pagesWithoutPolish.length;
    console.log(`📝 Pages with English content: ${pagesWithEnglishContent}/${summary.totalPages}`);
    
    console.log(`\n📈 Pages with >30% English content (${summary.pagesWithHighEnglishContent.length}):`);
    summary.pagesWithHighEnglishContent.forEach(page => {
      console.log(`   - ${page.englishPercentage}%: ${page.url}`);
    });

    console.log(`\n❌ Pages with no Polish content (${summary.pagesWithoutPolish.length}):`);
    summary.pagesWithoutPolish.forEach(url => {
      console.log(`   - ${url}`);
    });

    console.log(`\n📄 Detailed English content saved to: ${config.englishContentFile}`);
    console.log('\n' + '='.repeat(60));
  }
}