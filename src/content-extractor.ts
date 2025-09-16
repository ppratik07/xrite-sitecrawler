import * as cheerio from 'cheerio';

export class ContentExtractor {
  extractVisibleText(html: string): string {
    const $ = cheerio.load(html);

    // Remove script, style, and other non-visible elements
    $('script, style, noscript, svg, canvas, embed, object, iframe, form, input, textarea, select, button').remove();
    
    // Remove elements that are typically hidden
    $('[style*="display:none"], [style*="display: none"], .sr-only, .visually-hidden, [aria-hidden="true"]').remove();
    
    // Get text from the body, or fall back to the entire document
    const bodyText = $('body').length > 0 ? $('body').text() : $.text();
    
    // Clean up the text
    return this.cleanText(bodyText);
  }

  private cleanText(text: string): string {
    return text
      // Replace multiple whitespace with single spaces
      .replace(/\s+/g, ' ')
      // Remove excessive punctuation
      .replace(/[^\w\s\u00C0-\u017F\u0104-\u0119\u0141-\u0144\u015A-\u017C.,!?;:()\-"']/g, '')
      // Trim leading/trailing whitespace
      .trim();
  }

  extractSentences(text: string): string[] {
    // Split by sentence-ending punctuation, but be careful with abbreviations
    return text
      .split(/[.!?]+\s+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10); // Filter out very short fragments
  }
}