
import { GoogleGenAI } from "@google/genai";
import { Language } from '../types';

export const runtime = 'nodejs';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { firstUserMessage, firstAiResponse, language } = await req.json();

    if (!firstUserMessage || !firstAiResponse || !language) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const prompt = `Based on the following conversation, create a short, 3-5 word summary title for the chat in the language "${language}". The title should be concise and accurately reflect the main topic of the conversation.\n\nCONVERSATION:\nUser: ${firstUserMessage}\nAI: ${firstAiResponse}\n\nTITLE:`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert at creating concise, relevant titles for conversations. Respond ONLY with the generated title, without any extra text, quotation marks, or labels like "TITLE:".',
          temperature: 0.2
        },
    });
    
    const title = response.text.trim().replace(/["'.]/g, '');

    return new Response(JSON.stringify({ title }), {
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in generateTitle API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
