import { Server, Socket } from "socket.io";
import { handleMessage, getHistory, clearSession } from "../services/chatService.ts";
import { queryArticles } from "../services/ragQueryService.ts";

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  console.log("Client connected:", socket.id);

  // Send mesage and stream bot reply 
  socket.on("send_message", async (data: { sessionId: string; message: string }) => {
    const { sessionId, message } = data;
    if (!sessionId || !message) return;

    try {
      // Store user message from UI
      await handleMessage(sessionId, { sender: "user", message });

      // Notification UI -> bot is typing
      socket.emit("bot_typing", { sessionId, status: true });

      // Generate bot reply from RAG
      const replyText = await queryArticles(message);
      const replyChars = replyText.split("");

      // Stream reply character by character
      for (let i = 0; i < replyChars.length; i++) {
        socket.emit("bot_reply", { sessionId, char: replyChars[i] });
        await new Promise((res) => setTimeout(res, 20)); // 10ms delay between chars
      }

      // Store final bot message in Redis
      await handleMessage(sessionId, { sender: "bot", message: replyText });

      // Notification UI-> Send full updated history
      const history = await getHistory(sessionId);
      socket.emit("chat_history", { sessionId, history });

      // Notification UI -> bot done
      socket.emit("bot_done", { sessionId, status: false });
    } catch (err) {
      console.error("Error in send_message:", err);
    }
  });

  // Fetch full history for a session
  socket.on("get_history", async (sessionId: string) => {
    if (!sessionId) return;
    try {
      const history = await getHistory(sessionId);
      socket.emit("chat_history", { sessionId, history });
    } catch (err) {
      console.error("Error in get_history:", err);
    }
  });

  // Clear a session 
  socket.on("clear_session", async (sessionId: string) => {
    if (!sessionId) return;
    try {
      await clearSession(sessionId);
      socket.emit("chat_cleared", { sessionId });
    } catch (err) {
      console.error("Error in clear_session:", err);
    }
  });

  // Handle Scoket disconnect 
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
};
