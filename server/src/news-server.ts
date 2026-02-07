import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose, { Schema } from 'mongoose';
import { runScraper } from '../../scraper/src/runScraper.js';
import { normalize } from '../../parser/src/normalize.js';
import { filterPositive } from '../../parser/src/filterPositive.js';
import type { NewsItem } from '../../parser/src/types.js';

dotenv.config();

const positiveWords = ['успех', 'открыли', 'помогли', 'добро', 'счастье'];
const negativeWords = ['авария', 'смерть', 'катастрофа', 'война'];

const newsSchema = new Schema(
  {
    source: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    url: { type: String, required: true },
    publishedAt: { type: String, required: true },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      required: true,
    },
  },
  { collection: 'news', timestamps: true },
);

const NewsModel =
  mongoose.models.News || mongoose.model('News', newsSchema);

function countMatches(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce(
    (count, word) => count + (lower.includes(word) ? 1 : 0),
    0,
  );
}

function getSentiment(item: NewsItem): 'positive' | 'neutral' | 'negative' {
  const content = `${item.title} ${item.text}`;
  const positiveScore = countMatches(content, positiveWords);
  const negativeScore = countMatches(content, negativeWords);
  if (positiveScore > negativeScore) {
    return 'positive';
  }
  if (negativeScore > positiveScore) {
    return 'negative';
  }
  return 'neutral';
}

async function runScrapePipeline(): Promise<NewsItem[]> {
  const rawNews = await runScraper();
  const normalized = normalize(rawNews);
  const withSentiment = normalized.map((item) => ({
    ...item,
    sentiment: getSentiment(item),
  }));

  if (withSentiment.length > 0) {
    await NewsModel.insertMany(withSentiment);
  }

  return normalized;
}

async function startServer(): Promise<void> {
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/positive_news',
  );

  const app = express();
  app.use(express.json());

  app.get('/api/news', async (_req: Request, res: Response) => {
    const news = await NewsModel.find().sort({ createdAt: -1 }).lean();
    res.json(news);
  });

  app.get('/api/news/positive', async (_req: Request, res: Response) => {
    const news = await NewsModel.find({ sentiment: 'positive' })
      .sort({ createdAt: -1 })
      .lean();
    res.json(news);
  });

  app.post('/api/scrape', async (_req: Request, res: Response) => {
    try {
      const normalized = await runScrapePipeline();
      const positive = filterPositive(normalized);
      res.json({
        total: normalized.length,
        positive: positive.length,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Scrape failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    console.log(`✅ API running on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});
