// src/services/qdrantService.ts
import dotenv from "dotenv";
import type { Article } from "../services/ragIngestionService.ts";
import { qdrantClient } from "../config/qdrant.ts";

dotenv.config();
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "news_articles"


// Create collection if it does not exist
export const createCollection = async () => {
  try {
    const exists = await qdrantClient.getCollection(COLLECTION_NAME)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      console.log(`Collection "${COLLECTION_NAME}" already exists.`);
      return;
    }

    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 1024,         // embedding dimension (matches Jina embeddings)
        distance: "Cosine", // similarity metric
      },
      optimizers_config: {
        default_segment_number: 1,
      },
      replication_factor: 1,
    });

    console.log(`Collection "${COLLECTION_NAME}" created successfully.`);
  } catch (err) {
    console.error("Error creating collection:", err);
    throw err;
  }
};

// Upsert articles along with their embeddings
export const upsertArticles = async (
  articlesWithEmbeddings: {
    article: Article;
    embedding: number[];
  }[]
) => {
  try {
    const points = articlesWithEmbeddings.map(({ article, embedding }) => ({
      id: article.id,
      vector: embedding,
      payload: {
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt,
        content: article.content,
      },
    }));

    const res = await qdrantClient.upsert(COLLECTION_NAME, { points });
    console.log(`Upserted ${points.length} articles into "${COLLECTION_NAME}".`);
    return res;
  } catch (err) {
    console.error("Error upserting article embeddings:", err);
    throw err;
  }
};

// Search articles by embedding vector
export const searchArticles = async (queryVector: number[], topK: number = 5) => {
  try {
    const result = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryVector,
      limit: topK,
    });

    // result includes point id, score, and payload
    return result;
  } catch (err) {
    console.error("Error searching articles:", err);
    throw err;
  }
};
