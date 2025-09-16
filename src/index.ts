import { UrlDiscovery } from './url-discovery';
import { PageAnalyzer } from './page-analyzer';
import { ReportGenerator } from './report-generator';
import { PageAnalysis } from './types';
import { config } from './config';

class WebsiteLanguageCrawler {
  private urlDiscovery: UrlDiscovery;
  private pageAnalyzer: PageAnalyzer;
  private reportGenerator: ReportGenerator;

  private constructor(urlDiscovery: UrlDiscovery, pageAnalyzer: PageAnalyzer, reportGenerator: ReportGenerator) {
    this.urlDiscovery = urlDiscovery;
    this.pageAnalyzer = pageAnalyzer;
    this.reportGenerator = reportGenerator;
  }

  // Static async factory method to create an initialized instance
  static async create(): Promise<WebsiteLanguageCrawler> {
    const urlDiscovery = new UrlDiscovery();
    const pageAnalyzer = new PageAnalyzer();
    const reportGenerator = new ReportGenerator();
    
    // Ensure HttpClient instances are initialized
    await (urlDiscovery as any).httpClient.initialized;
    await (pageAnalyzer as any).httpClient.initialized;
    
    return new WebsiteLanguageCrawler(urlDiscovery, pageAnalyzer, reportGenerator);
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Website Language Crawler');
    console.log(`📍 Target: ${config.startUrl}`);
    console.log(`🎯 Max URLs: ${config.maxUrls}`);
    console.log(`📁 Output: ${config.outputFile}`);
    console.log(`📝 English Content Report: ${config.englishContentFile}`);
    console.log('-'.repeat(60));

    const startTime = Date.now();

    try {
      console.log('\n📡 Phase 1: URL Discovery');
      const urls = await this.urlDiscovery.discoverUrls();
      
      if (urls.length === 0) {
        console.log('❌ No URLs found to analyze. Exiting.');
        return;
      }

      console.log(`\n🔬 Phase 2: Analyzing ${urls.length} pages`);
      const results: PageAnalysis[] = [];
      let processed = 0;

      for (const url of urls) {
        processed++;
        console.log(`\n[${processed}/${urls.length}] Processing...`);
        
        const analysis = await this.pageAnalyzer.analyzePage(url);
        if (analysis) {
          results.push(analysis);
        }

        if (processed % 10 === 0) {
          const percentage = Math.round((processed / urls.length) * 100);
          console.log(`\n📊 Progress: ${processed}/${urls.length} (${percentage}%)`);
        }
      }

      console.log('\n📝 Phase 3: Generating Report');
      await this.reportGenerator.saveResults(results);
      
      const summary = this.reportGenerator.generateSummary(results);
      this.reportGenerator.logSummary(summary);

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      console.log(`\n✅ Crawl completed in ${duration} seconds`);
      console.log(`📊 Successfully analyzed ${results.length}/${urls.length} pages`);

    } catch (error: any) {
      console.error(`❌ Crawler failed: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    } finally {
      await (this.urlDiscovery as any).httpClient.close();
      await (this.pageAnalyzer as any).httpClient.close();
    }
  }
}

// Run the crawler
WebsiteLanguageCrawler.create()
  .then(crawler => crawler.run())
  .catch(console.error);