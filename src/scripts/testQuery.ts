// src/scripts/testQuery.ts
import { queryArticles } from "../services/ragQueryService";

const run = async () => {
  const results = await queryArticles("Russia Ukraine war news", 5);
  console.log("🔍 Search results:");
  console.dir(results, { depth: null });
};
const query = async ()=>{
  await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sessionId: "12345",
      message: "What is happening in indian politics today ?"
    })
  })
  .then(res => res.json())
  .then(console.log);
}

query().catch(console.error);
