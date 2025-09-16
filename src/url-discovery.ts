// /Discovers URLs to analyze by crawling the website starting from startUrl.

import * as cheerio from 'cheerio';
import { HttpClient } from './http-client';
import { config } from './config';

export class UrlDiscovery {
  private httpClient: HttpClient;
  private visitedUrls: Set<string> = new Set();
  private discoveredUrls: Set<string> = new Set();

  constructor() {
    this.httpClient = new HttpClient();
  }
//   For each page, it:
// Fetches the HTML using HttpClient.
// Extracts all <a href> links.
// Filters valid URLs using isValidUrl.
// Adds valid URLs to discoveredUrls if they haven’t been visited and the maxUrls limit isn’t reached.

  async discoverUrls(): Promise<string[]> {
    console.log(`🚀 Starting URL discovery from: ${config.startUrl}`);
    console.log(`📊 Target: ${config.maxUrls} URLs under path: ${config.pathFilter}`);
    
    await this.crawlForUrls(config.startUrl);
    
    const urls = Array.from(this.discoveredUrls).slice(0, config.maxUrls);
    console.log(`✅ URL discovery complete! Found ${urls.length} URLs to analyze.`);
    
    return urls;
  }

  //Starts with startUrl and recursively crawls links found on each page (breadth-first approach).
  private async crawlForUrls(url: string): Promise<void> {
    if (this.visitedUrls.has(url) || this.discoveredUrls.size >= config.maxUrls) {
      return;
    }

    this.visitedUrls.add(url);

    try {
      const response = await this.httpClient.get(url);
      const $ = cheerio.load(response.data);
      
      // Add current URL if it matches our criteria
      if (this.isValidUrl(url)) {
        this.discoveredUrls.add(url);
      }

      // Find all links on the page
      const links: string[] = [];
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          const absoluteUrl = this.resolveUrl(href, url);
          if (this.isValidUrl(absoluteUrl) && !this.visitedUrls.has(absoluteUrl)) {
            links.push(absoluteUrl);
          }
        }
      });

      console.log(`🔗 Found ${links.length} potential links on ${url}`);

      // Crawl found links (breadth-first approach)
      for (const link of links.slice(0, 10)) { // Limit to prevent exponential growth
        if (this.discoveredUrls.size >= config.maxUrls) {
          break;
        }
        await this.crawlForUrls(link);
      }

    } catch (error: any) {
      console.log(`⚠️  Failed to crawl ${url}: ${error.message}`);
    }
  }

  private resolveUrl(href: string, baseUrl: string): string {
    try {
      const url = new URL(href, baseUrl);
      // Remove hash fragment to avoid duplicate URLs
      url.hash = '';
      return url.toString();
    } catch {
      return '';
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Must be from the same domain
      if (urlObj.hostname !== 'www.xrite.com') {
        return false;
      }

      // Must include the path filter
      if (!urlObj.pathname.includes(config.pathFilter)) {
        return false;
      }

      // Exclude certain file types
      const excludeExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.doc', '.docx', '.xls', '.xlsx'];
      if (excludeExtensions.some(ext => urlObj.pathname.toLowerCase().endsWith(ext))) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}