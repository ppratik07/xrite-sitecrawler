// import * as cheerio from 'cheerio';

// export class ContentExtractor {
//   extractVisibleText(html: string): string {
//     const $ = cheerio.load(html);

//     // Remove script, style, and other non-visible elements
//     $('script, style, noscript, svg, canvas, embed, object, iframe, form, input, textarea, select, button').remove();
    
//     // Remove elements that are typically hidden
//     $('[style*="display:none"], [style*="display: none"], .sr-only, .visually-hidden, [aria-hidden="true"]').remove();
    
//     // Get text from the body, or fall back to the entire document
//     const bodyText = $('body').length > 0 ? $('body').text() : $.text();
    
//     // Clean up the text
//     return this.cleanText(bodyText);
//   }

//   private cleanText(text: string): string {
//     return text
//       // Replace multiple whitespace with single spaces
//       .replace(/\s+/g, ' ')
//       // Remove excessive punctuation
//       .replace(/[^\w\s\u00C0-\u017F\u0104-\u0119\u0141-\u0144\u015A-\u017C.,!?;:()\-"']/g, '')
//       // Trim leading/trailing whitespace
//       .trim();
//   }

//   extractSentences(text: string): string[] {
//     // Split by sentence-ending punctuation, but be careful with abbreviations
//     return text
//       .split(/[.!?]+\s+/)
//       .map(sentence => sentence.trim())
//       .filter(sentence => sentence.length > 10); // Filter out very short fragments
//   }
// }


// // The extractVisibleText method loads HTML into cheerio, removes non-visible elements, and extracts text from the <body> (or entire document if <body> is absent).
// // The cleanText method normalizes the text to make it suitable for analysis.
// // The extractSentences method splits text into sentences using punctuation ([.!?]+) and filters out very short fragments.
import * as cheerio from 'cheerio';

export class ContentExtractor {
  extractVisibleText(html: string): string {
    const $ = cheerio.load(html);

    // Remove only non-content elements
    $('script, style, noscript, svg, canvas').remove();
    
    // Get text from the body, or fall back to the entire document
    const bodyText = $('body').length > 0 ? $('body').text() : $.text();
    
    // Clean up the text
    return this.cleanText(bodyText);
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single spaces
      .replace(/[^\w\s\u00C0-\u017F\u0104-\u0119\u0141-\u0144\u015A-\u017C.,!?;:()\-"']/g, '') // Keep accented characters
      .trim();
  }

  extractSentences(text: string): string[] {
    return text
      .split(/[.!?]+\s+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 5); // Lowered threshold to capture shorter sentences
  }
}