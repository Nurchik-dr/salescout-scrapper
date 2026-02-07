import Parser from 'rss-parser';
import { RawNews } from '../types';

const rssParser = new Parser();

export async function scrapeRss(url: string): Promise<RawNews[]> {
  const feed = await rssParser.parseURL(url);

  return (feed.items || []).map((item) => ({
    source: feed.title || url,
    rawTitle: item.title ?? undefined,
    rawText: item.contentSnippet ?? item.content ?? undefined,
    rawUrl: item.link ?? undefined,
    rawDate: item.isoDate ?? item.pubDate ?? undefined,
    rawImage:
      item.enclosure?.url ??
      (item as { image?: { url?: string } }).image?.url ??
      undefined,
  }));
}
