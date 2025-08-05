
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS, Language, Role } from './constants.server.js';

// Use the Node.js runtime
export const runtime = 'nodejs';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { messages, language } = await req.json();

    if (!Array.isArray(messages) || !language) {
      return new Response(JSON.stringify({ error: 'Missing messages or language' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenerativeAI({ apiKey: process.env.API_KEY! });
    const systemInstruction = SYSTEM_PROMPTS[language as Language];
    
    const contents = messages.map((msg: Message) => ({
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    const result = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: contents,
        config: { systemInstruction: systemInstruction }
    });

    const stream = new ReadableStream({
        async start(controller) {
            for await (const chunk of result) {
                const chunkText = chunk.text;
                if (chunkText) {
                    controller.enqueue(new TextEncoder().encode(chunkText));
                }
            }
            controller.close();
        },
        cancel() {
            console.log("Stream cancelled by client.");
        }
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error('Error in sendMessage API:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
