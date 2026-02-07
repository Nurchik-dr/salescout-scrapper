import axios from 'axios';
import * as cheerio from 'cheerio';
import { RawNews } from '../types';

export async function scrapeSite(url: string): Promise<RawNews[]> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; PositiveNewsBot/1.0; +https://example.com/bot)',
    },
  });
  const $ = cheerio.load(response.data);
  const baseUrl = new URL(url);

  const articles = $('article');
  const items = (articles.length ? articles : $('a')).toArray().slice(0, 20);

  return items.map((element) => {
    const title =
      $(element).find('h1, h2, h3').first().text().trim() ||
      $(element).text().trim();
    const link =
      $(element).attr('href') ||
      $(element).find('a').first().attr('href') ||
      '';
    const resolvedUrl = link ? new URL(link, baseUrl).toString() : undefined;
    const text = $(element).find('p').first().text().trim();
    const image =
      $(element).find('img').first().attr('src') ||
      $(element).find('img').first().attr('data-src') ||
      undefined;

    return {
      source: baseUrl.hostname,
      rawTitle: title || undefined,
      rawText: text || undefined,
      rawUrl: resolvedUrl,
      rawImage: image ? new URL(image, baseUrl).toString() : undefined,
    };
  });
}
