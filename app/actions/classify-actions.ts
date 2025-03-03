/**
 * @file classify-actions.ts
 * @description
 * This file provides a server-side action for classifying a block of text
 * as either 'productive', 'unproductive', or 'break' using OpenAI or a user-selected
 * AI provider (e.g., screenpipe-cloud).
 *
 * Exports:
 * - classifyBlock: A server action that:
 *   1. Receives chunked text and a user role (ex: "I'm a dev, classify text as dev-productive or unproductive").
 *   2. Optionally calls the OpenAI Moderation endpoint to verify the text is safe to process.
 *   3. Calls the Chat Completion API with a system prompt to label the text.
 *   4. Returns a JSON object with classification, summary, and reason.
 *
 * @notes
 * - If moderation is flagged, we currently default to 'unproductive'.
 * - The classification logic is intentionally simplified to demonstrate how to integrate with LLM.
 */

"use server";

import { pipe } from "@screenpipe/js";
import { OpenAI } from "openai";

/**
 * Classification result type
 */
export type ClassificationResult = {
  classification: "productive" | "unproductive" | "break";
  shortSummary: string;
  reason: string;
};

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
 * @returns A ClassificationResult object with classification, summary, and reason
 *
 * @example
 * const result = await classifyBlock("Browsing stackoverflow about React hooks", "I'm a dev focusing on web dev tasks");
 * // returns { classification: "productive", shortSummary: "Researching React hooks on Stack Overflow", reason: "Directly related to web development tasks" }
 */
export async function classifyBlock(
  text: string,
  role: string = "I'm a developer"
): Promise<ClassificationResult> {
  // Early exit if there's no text or it's just whitespace
  if (!text || !text.trim()) {
    return {
      classification: "unproductive",
      shortSummary: "Empty or whitespace-only input",
      reason: "No meaningful content was detected to classify",
    };
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
      return {
        classification: "unproductive",
        shortSummary: "Content flagged by moderation",
        reason: "The content was flagged by the content moderation system",
      };
    }

    // Classification via chat completion
    const systemPrompt = `
      You are a classification assistant. 
      The user is: ${role}.
      You will analyze the provided text and determine if it represents a productive, unproductive, or break activity.
      
      Respond ONLY with a JSON object in the following format:
      {
        "classification": "productive" | "unproductive" | "break",
        "shortSummary": "A brief, 5-10 word summary of what was done in this time block",
        "reason": "A short explanation of why you classified it this way"
      }
      
      Guidelines:
      - "productive" means the text is relevant to user tasks or job.
      - "unproductive" means not relevant or is a distraction.
      - "break" means the user is clearly taking a designated break.
      - Keep shortSummary to 5-10 words max
      - Keep reason to 1-2 sentences max
    `.trim();

    const userPrompt = `
      Text:
      """ 
      ${text}
      """
      Classify this activity for ${role} in JSON format as specified.
    `.trim();

    const chatResp = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or user-defined in settings
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.0,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const responseContent = chatResp.choices?.[0]?.message?.content || "";

    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(
        responseContent
      ) as ClassificationResult;

      // Validate classification is one of the allowed values
      if (
        !["productive", "unproductive", "break"].includes(
          parsedResponse.classification
        )
      ) {
        parsedResponse.classification = "unproductive";
      }

      // Ensure all required fields exist
      return {
        classification: parsedResponse.classification,
        shortSummary: parsedResponse.shortSummary || "Unknown activity",
        reason: parsedResponse.reason || "No reason provided",
      };
    } catch (parseError) {
      console.error("Error parsing LLM response:", parseError, responseContent);
      // Return default on parse error
      return {
        classification: "unproductive",
        shortSummary: "Error analyzing activity",
        reason: "Could not properly analyze the content",
      };
    }
  } catch (error) {
    console.error("Error in classifyBlock:", error);
    // On any error, default to 'unproductive' with explanation
    return {
      classification: "unproductive",
      shortSummary: "Error processing content",
      reason: "An error occurred during classification",
    };
  }
}
