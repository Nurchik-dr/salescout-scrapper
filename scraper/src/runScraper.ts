import { scrapeRss } from './sources/rssScraper';
import { scrapeSite } from './sources/siteScraper';
import { scrapeInstagram } from './sources/instagramScraper';
import { RawNews } from './types';

export async function runScraper(): Promise<RawNews[]> {
  const rssSources = ['https://news.un.org/feed/subscribe/en/news/all/rss.xml'];
  const siteSources = ['https://www.un.org/en'];

  const rssResults = await Promise.all(rssSources.map((url) => scrapeRss(url)));
  const siteResults = await Promise.all(
    siteSources.map((url) => scrapeSite(url)),
  );
  const instagramResults = await scrapeInstagram();

  const rawNews = [
    ...rssResults.flat(),
    ...siteResults.flat(),
    ...instagramResults,
  ];

  console.log(`✅ Scraped ${rawNews.length} raw items`);
  return rawNews;
}

runScraper().catch((error) => {
  console.error('❌ Scraper failed:', error);
  process.exit(1);
});
