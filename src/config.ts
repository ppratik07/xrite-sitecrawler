import { CrawlerConfig } from './types';

export const config: CrawlerConfig = {
  startUrl: 'https://www.xrite.com/pl-pl',
  maxUrls: 10,
  requestDelay: 1000, // 1 second between requests
  pathFilter: '/pl-pl',
  outputFile: 'language-analysis-results.json',
  englishContentFile: 'english-content-report.json',
  userAgent: 'Mozilla/5.0 (compatible; LanguageCrawler/1.0; +https://example.com/bot)'
};