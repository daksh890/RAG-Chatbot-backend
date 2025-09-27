// src/services/jinaEmbeddingService.ts
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const getEmbeddings = async (texts: string[]): Promise<number[][]> => {
  return axios
    .post(
      `${process.env.JINA_URL!}`,
      {
        model: "jina-embeddings-v3",
        task: "text-matching",
        input: texts,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        },
      }
    )
    .then((res) => {
      return res.data.data.map((item: { embedding: number[] }) => item.embedding);
    })
    .catch((err) => {
      console.error("Error fetching embeddings:", err.response?.data || err.message);
      throw err;
    });
};
