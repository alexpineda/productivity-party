"use server";

import { getOpenAiClient } from "./classify-actions";

/**
 * @function summarizeText
 * @description Calls your AI provider to generate a short summary (1-2 sentences)
 * of the given text.
 */
export async function summarizeText(text: string): Promise<string> {
  if (!text || !text.trim()) {
    return "";
  }

  try {
    // Reuse the same OpenAI config from your classify-actions or write your own
    const openai = await getOpenAiClient();

    // Provide a short system prompt telling the model to generate a concise summary
    const userPrompt = `Please generate a concise summary (1-2 sentences max) of the following text:\n\n"${text}"\n`;

    const chatResp = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or whatever your default is
      messages: [
        {
          role: "system",
          content:
            "You are a helpful summarizer. Output a short summary only, in plain text.",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const rawSummary = chatResp.choices?.[0]?.message?.content || "";
    return rawSummary.trim();
  } catch (error) {
    console.error("Error in summarizeText:", error);
    return "";
  }
}
