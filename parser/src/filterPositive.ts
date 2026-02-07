import { NewsItem } from './types.js';

const positiveWords = ['успех', 'открыли', 'помогли', 'добро', 'счастье'];
const negativeWords = ['авария', 'смерть', 'катастрофа', 'война'];

function countMatches(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce(
    (count, word) => count + (lower.includes(word) ? 1 : 0),
    0,
  );
}

export function filterPositive(news: NewsItem[]): NewsItem[] {
  return news.filter((item) => {
    const content = `${item.title} ${item.text}`;
    const positiveScore = countMatches(content, positiveWords);
    const negativeScore = countMatches(content, negativeWords);
    return positiveScore > negativeScore;
  });
}
