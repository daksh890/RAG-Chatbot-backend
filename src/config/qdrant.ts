import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
dotenv.config();

const QDRANT_HOST = process.env.QDRANT_HOST;
const API_KEY = process.env.QDRANT_API_KEY

// Initialize Qdrant client
export const qdrantClient = new QdrantClient({
  url: QDRANT_HOST,
  timeout: 10000,
  apiKey:API_KEY
});