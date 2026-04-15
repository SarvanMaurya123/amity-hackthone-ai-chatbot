import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const systemInstruction = `You are Luminous AI, a helpful, brilliant, and friendly AI assistant. You are knowledgeable across many domains including coding, science, math, writing, and general knowledge. 

When writing code:
- Always use proper markdown code blocks with the language specified
- Provide clean, well-commented code
- Explain what the code does

Be concise but thorough. Use markdown formatting (headers, bold, lists, code blocks) to structure your responses when appropriate.`;

export type ChatHistoryItem = {
  role: "user" | "model";
  parts: { text: string }[];
};

export async function* streamGeminiResponse(
  userMessage: string,
  history: ChatHistoryItem[]
): AsyncGenerator<string> {
  if (!API_KEY) {
    yield "⚠️ **API Key Missing**: Please set `NEXT_PUBLIC_GEMINI_API_KEY` in your `.env.local` file to enable AI responses.\n\nFor now, here's a demo response: I'm **Luminous AI**, ready to help you with coding, writing, analysis, and much more!";
    return;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
      safetySettings,
    });

    const chat = model.startChat({
      history: history.slice(0, -1), // exclude current message
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    const result = await chat.sendMessageStream(userMessage);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err.message?.includes("API_KEY_INVALID")) {
      yield "⚠️ **Invalid API Key**: Please check your Gemini API key in `.env.local`.";
    } else if (err.message?.includes("quota")) {
      yield "⚠️ **Quota Exceeded**: Your Gemini API quota has been reached. Please try again later.";
    } else {
      yield `⚠️ **Error**: ${err.message || "An unexpected error occurred. Please try again."}`;
    }
  }
}
