import { GoogleGenAI, Chat } from "@google/genai";
import { Message, Sender } from '../types';
import { MODEL_NAME } from '../constants';

// Helper to get API key safely
const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY not found in environment variables");
    return '';
  }
  return apiKey;
};

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return client;
};

export const createChatSession = (systemInstruction: string): Chat => {
  const ai = getClient();
  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7, // Balanced creativity and precision
    },
  });
};

export const sendMessageStream = async (
  chat: Chat,
  message: string,
  onChunk: (text: string) => void
): Promise<void> => {
  try {
    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error streaming message:", error);
    throw error;
  }
};
