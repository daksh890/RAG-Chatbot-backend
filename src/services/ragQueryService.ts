// src/services/ragQueryService.ts
import { getEmbeddings } from "./jinaEmbeddings";
import { searchArticles } from "./qdrantService";
import gemini from "../config/gemini";


export const queryArticles = async (query: string, topK: number = 5) => {
    try {
        // 1️⃣ Generate embedding for query
        const [queryEmbedding] = await getEmbeddings([query]);

        // 2️⃣ Search in Qdrant
        const results = await searchArticles(queryEmbedding, topK);

        // 3️⃣ Map results into useful structure
        const context = results.map(r =>
            `Title: ${r.payload?.title}\nContent: ${r.payload?.content}`
        ).join("\n\n");

        // 4️⃣ Send to LLM API (example with OpenAI)
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [`Context:\n${context}\n\nUser question: ${query}`],
            config: {
                systemInstruction: "You are a helpful assistant answering questions based on the above news context.",
            },
          });
       
        if(response.text){
            return response.text;
        }else{
            return "Loading...."
        }
    } catch(err) {
        return "Server is busy, Please try again later."
    }
}
