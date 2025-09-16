import { CrawlerConfig } from './types';

const polishConfig: CrawlerConfig = {
  startUrl: 'https://www.xrite.com/pl-pl',
  maxUrls: 10,
  requestDelay: 1000,
  pathFilter: '/pl-pl',
  outputFile: 'language-analysis-results-poland.json',
  englishContentFile: 'english-content-report-poland.json',
  userAgent: 'Mozilla/5.0 (compatible; LanguageCrawler/1.0; +https://example.com/bot)',
  primaryLanguage: 'pl',
};

const italianConfig: CrawlerConfig = {
  startUrl: 'https://www.xrite.com/it-it',
  maxUrls: 10,
  requestDelay: 1000,
  pathFilter: '/it-it',
  outputFile: 'language-analysis-results-italy.json',
  englishContentFile: 'english-content-report-italy.json',
  userAgent: 'Mozilla/5.0 (compatible; LanguageCrawler/1.0; +https://example.com/bot)',
  primaryLanguage: 'it',
};

const frenchConfig: CrawlerConfig = {
  startUrl: 'https://www.xrite.com/fr-fr',
  maxUrls: 10,
  requestDelay: 1000,
  pathFilter: '/fr-fr',
  outputFile: 'language-analysis-results-france.json',
  englishContentFile: 'english-content-report-france.json',
  userAgent: 'Mozilla/5.0 (compatible; LanguageCrawler/1.0; +https://example.com/bot)',
  primaryLanguage: 'fr',
};

export const config = polishConfig;