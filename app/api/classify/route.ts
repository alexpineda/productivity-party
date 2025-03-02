/**
 * @file route.ts
 * @description
 * A RESTful API route for classifying text blocks as 'productive' or 'unproductive'.
 *
 * Endpoint: POST /api/classify
 * Body: { text: string, role?: string }
 *
 * Returns JSON:
 * {
 *   classification: "productive" | "unproductive"
 * }
 *
 * @notes
 * - This wraps the classifyBlock() server action from "classify-actions.ts".
 * - You may call it from external clients or from your Next.js front-end.
 * - If no text is provided, defaults to 'unproductive'.
 */

import { NextRequest, NextResponse } from "next/server";
import { classifyBlock } from "@/app/actions/classify-actions";

export async function POST(request: NextRequest) {
  try {
    const { text, role } = await request.json();

    // Basic validation
    if (typeof text !== "string") {
      return NextResponse.json(
        { error: "missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    const classification = await classifyBlock(text, role);

    return NextResponse.json({ classification });
  } catch (error) {
    console.error("Error in /api/classify route:", error);
    return NextResponse.json({ error: "failed to classify" }, { status: 500 });
  }
}
