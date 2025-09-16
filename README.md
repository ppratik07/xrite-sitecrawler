Overview
The application performs three main phases:

URL Discovery: Crawls the website starting from a configured URL to find relevant pages to analyze.
Page Analysis: Analyzes the text content of each discovered page to detect the languages used (focusing on Polish and English) and their proportions.
Report Generation: Compiles the analysis results into JSON files and generates a summary of the findings.

The code is modular, with separate classes for each major functionality, and uses TypeScript for type safety. It relies on external libraries like axios for HTTP requests, cheerio for HTML parsing, and franc for language detection.

Key Components and Their Roles
1.⁠ ⁠Configuration (config.ts)

Defines the CrawlerConfig interface and a configuration object specifying:

startUrl: The starting point for crawling (https://www.xrite.com/pl-pl).
maxUrls: Maximum number of URLs to analyze (10).
requestDelay: Delay between HTTP requests (1 second) to respect rate limits.
pathFilter: Restricts crawling to URLs containing /pl-pl.
outputFile: File to save analysis results (language-analysis-results.json).
englishContentFile: File to save English content details (english-content-report.json).
userAgent: Identifies the crawler to servers (Mozilla/5.0 (compatible; LanguageCrawler/1.0; +https://example.com/bot)).



2.⁠ ⁠HTTP Client (http-client.ts)

Purpose: Handles HTTP requests to fetch web page content.
Key Features:

Uses axios to create an HTTP client with predefined headers (e.g., User-Agent, Accept-Language) to mimic a browser.
Implements rate-limiting via respectRateLimit, ensuring a delay (configured as 1 second) between requests to avoid overwhelming the server.
Logs success (✅ Successfully fetched) or failure (❌ Failed to fetch) for each request.


How It Works:

The get method sends an HTTP GET request to the provided URL and returns the response.
If a request fails, it logs the error and rethrows it for upstream handling.



3.⁠ ⁠URL Discovery (url-discovery.ts)

Purpose: Discovers URLs to analyze by crawling the website starting from startUrl.
Key Features:

Uses cheerio to parse HTML and extract links (<a href>).
Maintains a visitedUrls set to avoid revisiting pages and a discoveredUrls set to collect valid URLs.
Limits crawling to maxUrls (10) and restricts URLs to those:

On the same domain (www.xrite.com).
Containing the pathFilter (/pl-pl).
Not ending in excluded file extensions (e.g., .pdf, .jpg).


Resolves relative URLs to absolute URLs using the URL API.


How It Works:

Starts with startUrl and recursively crawls links found on each page (breadth-first approach).
For each page, it:

Fetches the HTML using HttpClient.
Extracts all <a href> links.
Filters valid URLs using isValidUrl.
Adds valid URLs to discoveredUrls if they haven’t been visited and the maxUrls limit isn’t reached.


Limits the number of links processed per page to 10 to prevent exponential growth.
Returns a list of up to maxUrls valid URLs for analysis.



4.⁠ ⁠Content Extractor (content-extractor.ts)

Purpose: Extracts visible text from HTML content for language analysis.
Key Features:

Uses cheerio to parse HTML and remove non-visible elements (e.g., <script>, <style>, hidden elements).
Cleans extracted text by:

Replacing multiple whitespaces with a single space.
Removing excessive punctuation, keeping only allowed characters (letters, numbers, basic punctuation, and Polish diacritics).
Trimming leading/trailing whitespace.


Provides a method to split text into sentences for language detection.


How It Works:

The extractVisibleText method loads HTML into cheerio, removes non-visible elements, and extracts text from the <body> (or entire document if <body> is absent).
The cleanText method normalizes the text to make it suitable for analysis.
The extractSentences method splits text into sentences using punctuation ([.!?]+) and filters out very short fragments.



5.⁠ ⁠Language Detector (language-detector.ts)

Purpose: Detects the language(s) of text content and calculates their proportions.
Key Features:

Uses the franc library to detect languages at the sentence level.
Converts franc language codes (e.g., pol, eng) to ISO 639-1 codes (pl, en) or marks unknown languages.
Collects English-specific content (sentences and words) for detailed reporting.
Calculates language percentages and determines the dominant language.


How It Works:

detectLanguageStats:

Splits text into sentences.
For each sentence (minimum 10 characters), uses franc to detect the language.
Counts words per language and stores English sentences and words.


getEnglishContent: Returns collected English sentences, words, and word count.
calculatePercentages:

Computes the percentage of Polish, English, and other languages based on word counts.
Rounds percentages to two decimal places.
Filters minor languages (less than 0.5%) and sorts others by percentage.


getDominantLanguage: Labels the page as:

pl if Polish > 60%.
en if English > 60%.
mixed otherwise.


Helper methods:

splitIntoSentences: Splits text into sentences.
countWords: Counts words in a text segment.
extractWords: Extracts lowercase English words (only letters, length > 2).
getLanguageName: Maps language codes to names using iso-639-1.





6.⁠ ⁠Page Analyzer (page-analyzer.ts)

Purpose: Coordinates the analysis of a single web page.
Key Features:

Fetches page content using HttpClient.
Extracts visible text using ContentExtractor.
Detects languages using LanguageDetector.
Skips pages with insufficient text (< 50 characters).
Logs analysis progress and results.


How It Works:

The analyzePage method:

Fetches the page’s HTML.
Extracts visible text.
If text is too short, logs a warning and returns null.
Detects language stats and calculates percentages.
Determines the dominant language.
Compiles a PageAnalysis object with:

URL.
Dominant language (pl, en, or mixed).
Language percentages (Polish, English, others).
Total word count.
English content details (if any English words are detected).


Logs the analysis results (dominant language, percentages, total words).
Returns the PageAnalysis object or null on error.





7.⁠ ⁠Report Generator (report-generator.ts)

Purpose: Saves analysis results and generates a summary report.
Key Features:

Saves all analysis results to a JSON file (language-analysis-results.json).
Generates a separate English content report (english-content-report.json) with details on pages containing English.
Produces a CrawlSummary with:

Total pages analyzed.
Average Polish and English percentages.
Pages with >30% English content.
Pages with no Polish content.


Logs a formatted summary to the console.


How It Works:

saveResults:

Writes all PageAnalysis objects to outputFile as JSON.
Calls saveEnglishContentReport to generate the English content report.


saveEnglishContentReport:

Filters pages with English content.
Creates an EnglishContentReport for each, including:

URL.
English percentage.
English sentences and words.
Total English word count.
Sample sentences (first 5).


Sorts by English percentage and saves to englishContentFile.


generateSummary:

Calculates average Polish and English percentages.
Identifies pages with >30% English content and no Polish content.


logSummary:

Prints a detailed summary, including total pages, average percentages, and lists of notable pages.





8.⁠ ⁠Main Crawler (index.ts)

Purpose: Orchestrates the entire crawling process.
Key Features:

Initializes UrlDiscovery, PageAnalyzer, and ReportGenerator.
Executes the three phases: URL discovery, page analysis, and report generation.
Tracks progress and logs timing information.


How It Works:

The run method:

Logs configuration details (start URL, max URLs, output file).
Phase 1: Calls UrlDiscovery.discoverUrls to get a list of URLs.
Phase 2: Iterates over URLs, calling PageAnalyzer.analyzePage for each, and collects results.
Logs progress every 10 pages.
Phase 3: Calls ReportGenerator.saveResults to save results and logSummary to print the summary.
Tracks and logs the total duration of the crawl.


Handles errors by logging them and exiting with a failure code.
Creates a WebsiteLanguageCrawler instance and runs it.



9.⁠ ⁠Types (types.ts)

Defines TypeScript interfaces for:

PageAnalysis: Structure of page analysis results.
LanguageStats: Word counts by language.
EnglishContentReport: Details of English content on a page.
CrawlerConfig: Crawler configuration.
CrawlSummary: Summary of the crawl results.




How the Code Works Together

Initialization:

The WebsiteLanguageCrawler in index.ts is instantiated and runs the run method.
It initializes UrlDiscovery, PageAnalyzer, and ReportGenerator with their dependencies (HttpClient, ContentExtractor, LanguageDetector).


URL Discovery Phase:

UrlDiscovery starts at startUrl (https://www.xrite.com/pl-pl).
It crawls pages, extracting links and filtering them to ensure they:

Belong to www.xrite.com.
Include /pl-pl in the path.
Aren’t excluded file types.


Collects up to 10 URLs (maxUrls).


Page Analysis Phase:

For each URL, PageAnalyzer:

Fetches the page using HttpClient (with a 1-second delay between requests).
Extracts visible text using ContentExtractor.
Analyzes the text using LanguageDetector to identify language proportions and collect English content.
Creates a PageAnalysis object with the results.


Skips pages with insufficient text (< 50 characters).


Report Generation Phase:

ReportGenerator saves all PageAnalysis results to language-analysis-results.json.
Generates an english-content-report.json for pages with English content, including sentences and words.
Produces a CrawlSummary with averages and notable pages (e.g., >30% English, no Polish).
Logs a detailed summary to the console.


Error Handling:

Each component logs errors and handles them gracefully:

HttpClient rethrows errors for PageAnalyzer or UrlDiscovery to handle.
PageAnalyzer returns null for failed analyses, allowing the crawler to continue.
WebsiteLanguageCrawler catches top-level errors, logs them, and exits.






Key Features and Design Choices

Modularity: The code is split into distinct classes (HttpClient, UrlDiscovery, etc.), each handling a specific responsibility, making it maintainable and testable.
Rate Limiting: The 1-second delay between requests (requestDelay) prevents server overload and respects website policies.
Language Detection: Uses franc for sentence-level language detection, ensuring accurate identification of mixed-language content.
Text Cleaning: Removes non-visible elements and normalizes text to improve language detection accuracy.
Filtering: Restricts crawling to a specific domain and path, excluding irrelevant file types.
Reporting: Generates both detailed JSON outputs and a human-readable console summary.
Type Safety: Uses TypeScript interfaces to enforce consistent data structures.


Potential Improvements

Configurability:

Allow dynamic configuration (e.g., via command-line arguments or a config file).
Support additional languages beyond Polish and English.


Error Handling:

Add retry logic for failed HTTP requests.
Handle specific HTTP status codes (e.g., 429 for rate-limiting).


Performance:

Parallelize page analysis for faster processing (while respecting rate limits).
Cache frequently accessed pages or language detection results.


Language Detection:

Improve handling of short sentences or mixed-language sentences.
Use a more robust library than franc for better accuracy with Polish diacritics.


Reporting:

Add visualizations (e.g., charts) to the summary.
Allow filtering of reports by specific criteria (e.g., minimum English percentage).


URL Discovery:

Implement a more sophisticated crawling strategy (e.g., prioritize high-value pages).
Handle JavaScript-rendered content using a headless browser.