import redisClient from "../config/redis.ts";
import type { Message } from "../types/chat.ts";
import dotenv from "dotenv";
dotenv.config();

const SESSION_SET_KEY = process.env.SESSION_SET_KEY || "chat:sessions";
const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL) || 3600; // 1 hour TTL

/** Create a new session */
export const createSession = async (): Promise<string> => {
  try{
    const sessionId = crypto.randomUUID();
    const now = Date.now();
  
    // Add session to ZSET with current timestamp as score
    await redisClient.zAdd(SESSION_SET_KEY, { score: now, value: sessionId });
  
    // Initialize empty chat list with TTL
    await redisClient.expire(`chat:${sessionId}`, SESSION_TTL_SECONDS);
    return sessionId;
  } catch (err){
    console.log(err);
    return "";
  }

};

/** Add a message to a session and refresh TTL */
export const handleMessage = async (sessionId: string, msg: Message) => {
  try{
    const now = Date.now();
  
    // Append message
    await redisClient.rPush(`chat:${sessionId}`, JSON.stringify(msg));
  
    // Update last activity timestamp in ZSET
    await redisClient.zAdd(SESSION_SET_KEY, { score: now, value: sessionId });
  
    // Reset TTL on chat list
    await redisClient.expire(`chat:${sessionId}`, SESSION_TTL_SECONDS);
  } catch (err){
    console.log(err);
  }
};

/** Fetch messages for a session */
export const getHistory = async (sessionId: string): Promise<Message[]> => {
  try{
    const messages = await redisClient.lRange(`chat:${sessionId}`, 0, -1);
    return messages.map((m) => JSON.parse(m));
  } catch(err){
    console.log(err);
    return [];
  }
};

/** Clear a session */
export const clearSession = async (sessionId: string) => {
  try{
    await redisClient.del(`chat:${sessionId}`);
    await redisClient.zRem(SESSION_SET_KEY, sessionId);
  } catch(err){
    console.log(err);
  }
};

/** Get all active sessions and clean up expired ones */
export const getSessions = async (): Promise<string[]> => {
  const now = Date.now();
  const cutoff = now - SESSION_TTL_SECONDS * 1000;

  try {
    // Find expired sessions
    const expiredSessions = await redisClient.zRangeByScore(SESSION_SET_KEY, 0, cutoff);
    // Cleanup expired sessions
    if (expiredSessions.length > 0) {
      await redisClient.zRemRangeByScore(SESSION_SET_KEY, 0, cutoff);
      for (const sid of expiredSessions) {
        await redisClient.del(`chat:${sid}`);
      }
    }
    
    // Return only active sessions
    const activeSessions = await redisClient.zRange(SESSION_SET_KEY, 0, -1, { REV: true });;
    console.log("expired", expiredSessions, activeSessions)
    return activeSessions;
  } catch (err) {
    console.error("Error fetching sessions:", err);
    return [];
  }
};
