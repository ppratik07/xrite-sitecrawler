import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from './config';

export class HttpClient {
  private client: AxiosInstance;
  private lastRequestTime: number = 0;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
  }

  async get(url: string): Promise<AxiosResponse<string>> {
    await this.respectRateLimit();
    
    try {
      console.log(`📥 Fetching: ${url}`);
      const response = await this.client.get<string>(url);
      console.log(`✅ Successfully fetched: ${url} (${response.status})`);
      return response;
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
}