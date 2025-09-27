import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const gemini = new GoogleGenAI({apiKey:`${process.env.GOOGLE_API_KEY}`});



export default gemini;
