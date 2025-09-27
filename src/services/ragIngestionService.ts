// src/services/ragIngestionService.ts
import Parser from "rss-parser";
import dotenv from "dotenv";
dotenv.config();

export type Article = {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  content: string;
};

// Get feeds from .env (comma-separated)
const FEEDS = (process.env.RSS_FEEDS || "").split(",").map((f) => f.trim()).filter(Boolean);

if (FEEDS.length === 0) {
  console.warn("No RSS feeds configured in .env (RSS_FEEDS).");
}

export const fetchRSSArticles = async (): Promise<Article[]> => {
  const parser = new Parser();
  const articles: Article[] = [];

  for (const feedUrl of FEEDS) {
    try {
      const response = await fetch(feedUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
          Accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch feed: ${feedUrl}, status: ${response.status}`);
        continue;
      }

      const xml = await response.text();
      const feed = await parser.parseString(xml);

      feed.items.forEach((item) => {
        articles.push({
          id: crypto.randomUUID(),
          title: item.title || "",
          url: item.link || "",
          publishedAt: item.pubDate || new Date().toISOString(),
          content: item.contentSnippet || item.content || "",
        });
      });
    } catch (err) {
      console.error(`❌ Error fetching feed ${feedUrl}:`, err);
    }
  }

  console.log(`Fetched ${articles.length} articles from ${FEEDS.length} feeds.`);
  return articles;
};
