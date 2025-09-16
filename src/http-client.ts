import puppeteer, { Browser, Page } from 'puppeteer';
import { config } from './config';

export class HttpClient {
  private browser: Browser | null = null;
  private lastRequestTime: number = 0;
  private initialized: Promise<void>;

  constructor() {
    this.initialized = this.initializeBrowser();
  }

  private async initializeBrowser(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({ headless: true });
      console.log('🌐 Browser initialized successfully');
    } catch (error: any) {
      console.error(`❌ Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  async get(url: string): Promise<{ data: string; status: number }> {
    await this.initialized;

    if (!this.browser) {
      throw new Error('Browser failed to initialize');
    }

    try {
      await this.respectRateLimit();
      console.log(`📥 Fetching: ${url}`);
      const page: Page = await this.browser.newPage();
      await page.setUserAgent(config.userAgent);
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': `${config.primaryLanguage}-${config.primaryLanguage.toUpperCase()},${config.primaryLanguage};q=0.9,en-US;q=0.8,en;q=0.7`,
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      });
      // Wait for DOM and network to stabilize
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 70000 });
      // Wait an additional 2 seconds for dynamic content
      const html = await page.content();
      await page.close();
      console.log(`✅ Successfully fetched: ${url} (200)`);
      return { data: html, status: 200 };
    } catch (error: any) {
      console.log(`❌ Failed to fetch: ${url} - ${error.message}`);
      throw error;
    }
  }

  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < config.requestDelay) {
      const delay = config.requestDelay - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    this.lastRequestTime = Date.now();
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🌐 Browser closed');
    }
  }
}