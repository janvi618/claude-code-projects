import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

interface PageText {
  page: number;
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const { pages } = (await request.json()) as { pages: PageText[] };

    if (!pages || pages.length === 0) {
      return NextResponse.json(
        { error: "No page text provided" },
        { status: 400 }
      );
    }

    // Build a single text block with page markers
    const fullText = pages
      .map((p) => `--- PAGE ${p.page} ---\n${p.text}`)
      .join("\n\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `You are an expert executive-briefing analyst. Analyze the following document and return ONLY valid JSON (no markdown, no code fences, no commentary) with this exact structure:

{
  "title": "The document's title or a concise descriptive title",
  "thesis": "The single core argument or purpose of the document in 1-2 sentences",
  "key_takeaways": ["3-5 of the most important points, each as a single clear sentence"],
  "so_what": ["2-4 statements explaining why this matters to a senior leader"],
  "now_what": ["2-4 concrete next-step recommendations"],
  "receipts": [{"page": 1, "snippet": "exact short quote from that page that supports a key takeaway"}]
}

Rules:
- key_takeaways: 3-5 items
- so_what: 2-4 items explaining strategic significance
- now_what: 2-4 actionable recommendations
- receipts: 3-6 items, each with the page number and a verbatim short snippet (under 150 chars) from the document that supports a takeaway
- Return ONLY the JSON object, nothing else

DOCUMENT:
${fullText}`,
        },
      ],
    });

    // Extract text from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON (handle potential markdown code fences just in case)
    const cleaned = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const analysis = JSON.parse(cleaned);

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
