import dotenv from 'dotenv';
import mongoose, { Schema } from 'mongoose';
import fs from 'fs/promises';
import { normalize } from './normalize.js';
import { filterPositive } from './filterPositive.js';
import { NewsItem, RawNews } from './types.js';

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

async function loadRawNews(): Promise<RawNews[]> {
  if (process.env.RAW_NEWS_PATH) {
    const fileData = await fs.readFile(process.env.RAW_NEWS_PATH, 'utf-8');
    return JSON.parse(fileData) as RawNews[];
  }

  return [
    {
      source: 'demo',
      rawTitle: 'Счастье в городе',
      rawText: 'Горожане помогли открыть новый центр добра.',
      rawUrl: 'https://example.com/positive',
      rawDate: new Date().toISOString(),
    },
  ];
}

async function runParser(): Promise<void> {
  await mongoose.connect(
    process.env.MONGO_URI || 'mongodb://localhost:27017/positive_news',
  );

  const rawNews = await loadRawNews();
  const normalized = normalize(rawNews);
  const positiveNews = filterPositive(normalized);

  const withSentiment = normalized.map((item) => ({
    ...item,
    sentiment: getSentiment(item),
  }));

  if (withSentiment.length > 0) {
    await NewsModel.insertMany(withSentiment);
  }

  console.log(`✅ Parsed ${normalized.length} news items`);
  console.log(`✅ Positive news count: ${positiveNews.length}`);
  await mongoose.disconnect();
}

runParser().catch((error) => {
  console.error('❌ Parser failed:', error);
  process.exit(1);
});
