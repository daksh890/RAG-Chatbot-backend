import type { Request, Response } from "express";
import { handleMessage, clearSession as clearHistory, getHistory } from "../services/chatService";
import { queryArticles } from "../services/ragQueryService";
import type { Message } from "../types/chat";

const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body as { sessionId: string; message: string };
    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message are required" });
    }

    // Store user message
    const userMsg: Message = { sender: "user", message };
    await handleMessage(sessionId, userMsg);

    // Generate bot reply (replace with RAG later)
    const reply = await queryArticles(message);
    const botMsg: Message = { sender: "bot", message: reply||"" };
    await handleMessage(sessionId, botMsg);

    // Fetch full chat history
    const history = await getHistory(sessionId);

    res.json({ reply: reply, sessionId:sessionId, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const clearSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body as { sessionId: string };
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    await clearHistory(sessionId);
    res.json({ status: "cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getSessionHistory = async (req:Request, res:Response)=>{
  try{
    const { sessionId } = req.body as { sessionId: string};
    const history = await getHistory(sessionId);
    return res.status(200).json({sessionId, history})
  } catch(err){
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
}

export default { sendMessage, clearSession, getSessionHistory };
