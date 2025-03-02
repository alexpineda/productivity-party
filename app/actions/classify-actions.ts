/**
 * @file classify-actions.ts
 * @description
 * This file provides a server-side action for classifying a block of text
 * as either 'productive' or 'unproductive' using OpenAI or a user-selected
 * AI provider (e.g., screenpipe-cloud).
 *
 * Exports:
 * - classifyBlock: A server action that:
 *   1. Receives chunked text and a user role (ex: "I'm a dev, classify text as dev-productive or unproductive").
 *   2. Optionally calls the OpenAI Moderation endpoint to verify the text is safe to process.
 *   3. Calls the Chat Completion API with a short system prompt to label the text.
 *   4. Returns 'productive' or 'unproductive' based on the LLM reply.
 *
 * @notes
 * - If moderation is flagged, we currently default to 'unproductive'.
 * - If the LLM returns anything other than "productive", we default to "unproductive".
 * - This approach can be refined as needed (e.g., break handling or partial scoring).
 * - The classification logic is intentionally simplified to demonstrate how to integrate with LLM.
 */

"use server";

import { pipe } from "@screenpipe/js";
import { OpenAI } from "openai";

/**
 * Helper function: fetch openai or screenpipe-cloud config from user settings
 */
export async function getOpenAiClient() {
  const settings = await pipe.settings.getAll();

  // Decide which key to use
  const apiKey =
    settings.aiProviderType === "screenpipe-cloud"
      ? settings?.user?.token
      : settings?.openaiApiKey;

  if (!apiKey) {
    throw new Error(
      `No valid API key found. Please configure your OpenAI or screenpipe-cloud settings.`
    );
  }

  // If user has a custom aiUrl, e.g. local proxy or alternate base
  const baseURL = settings.aiUrl || "https://api.openai.com/v1";

  // Return an OpenAI client
  // openai@4.x usage
  const openai = new OpenAI({
    apiKey,
    baseURL,
  });
  return openai;
}

/**
 * classifyBlock
 *
 * Server Action that classifies a text block as 'productive' or 'unproductive'.
 *
 * @param text The chunked text from the user's screen usage
 * @param role A brief descriptor (e.g., "I'm a dev focusing on coding tasks")
 *
 * @returns The classification string: 'productive' | 'unproductive'
 *
 * @example
 * const result = await classifyBlock("Browsing stackoverflow about React hooks", "I'm a dev focusing on web dev tasks");
 * // returns "productive"
 */
export async function classifyBlock(
  text: string,
  role: string = "I'm a developer"
): Promise<"productive" | "unproductive"> {
  // Early exit if there's no text or it's just whitespace
  if (!text || !text.trim()) {
    return "unproductive";
  }

  try {
    const openai = await getOpenAiClient();

    // Moderation check
    let isFlagged = false;
    try {
      const modResp = await openai.moderations.create({
        model: "text-moderation-latest",
        input: text,
      });

      const [result] = modResp.results;
      isFlagged = result.flagged;
    } catch (modErr) {
      console.warn("OpenAI moderation check failed:", modErr);
      // On moderation error, we'll continue but be cautious
    }

    // If content was flagged, return unproductive immediately
    if (isFlagged) {
      return "unproductive";
    }

    // Classification via chat completion
    const systemPrompt = `
      You are a classification assistant. 
      The user is: ${role}.
      You ONLY output "productive" or "unproductive" (nothing else).
      "productive" means the text is relevant to user tasks or job.
      "unproductive" means not relevant or is a distraction.
    `.trim();

    const userPrompt = `
      Text:
      """ 
      ${text}
      """
      Decide if this is 'productive' or 'unproductive' for ${role}.
    `.trim();

    const chatResp = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or user-defined in settings
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.0,
      max_tokens: 10,
    });

    const rawAnswer =
      chatResp.choices?.[0]?.message?.content?.toLowerCase() || "";

    // Only return 'productive' if it explicitly contains the word 'productive'
    // This ensures any other response (including empty or unexpected) defaults to 'unproductive'
    return rawAnswer.includes("productive") ? "productive" : "unproductive";
  } catch (error) {
    console.error("Error in classifyBlock:", error);
    // On any error, default to 'unproductive'
    return "unproductive";
  }
}
