// src/scripts/indexArticles.ts
import { fetchRSSArticles } from "../services/ragIngestionService.ts";
import type { Article } from "../services/ragIngestionService.ts";
import { getEmbeddings } from "../services/jinaEmbeddings.ts";
import { createCollection, upsertArticles } from "../services/qdrantService.ts";

export const run = async () => {
  try {
    // Fetch articles
    const articles: Article[] = await fetchRSSArticles();
    if (!articles.length) {
      console.log("No articles to index.");
      return;
    }

    //  Embedding article contents
    const contents = articles.map((a) => a.content);
    const embeddings = await getEmbeddings(contents);

    if (embeddings.length !== articles.length) {
      throw new Error("Mismatch between number of articles and embeddings returned.");
    }

    await createCollection();

    // articles + embeddings
    const articlesWithEmbeddings = articles.map((article, i) => ({
      article,
      embedding: embeddings[i],
    }));

    // Inserting all articles into qdrant
    await upsertArticles(articlesWithEmbeddings);

    console.log("✅ Indexing completed.");
  } catch (err) {
    console.error("Error indexing articles:", err);
  }
};

