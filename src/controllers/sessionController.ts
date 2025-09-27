import { getSessions, createSession } from "../services/chatService";
import type { Request, Response } from "express";

const getAllSessions = async (req: Request, res: Response) => {
    try {
        const sessions = await getSessions();
        return res.status(200).json({ sessions })
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch sessions" })
    }
}

const createNewSession = async (req: Request, res: Response) => {
    try {
        const newSessionId = await createSession();
        if (!newSessionId.trim()) return res.status(500).json({error: "Failed to create session"})
        return res.status(200).json({ sessionId: newSessionId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to create session" });
    }
};

export default { getAllSessions, createNewSession };