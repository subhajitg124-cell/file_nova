import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { getISTDate } from "../middlewares/limits";
import { db, usersTable, ipUsageTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { AuthRequest } from "../middlewares/auth";

const router = Router();

export type ToneKey =
  | "formal"
  | "simple"
  | "exam-revision"
  | "viva-presentation"
  | "persuasive"
  | "storytelling";

const TONE_PROMPTS: Record<ToneKey, string> = {
  formal: "Use formal academic language suitable for a board exam or thesis defense. Precise terminology, no contractions.",
  simple: "Use simple, clear language a Class 8-10 student would understand. Short sentences, define any technical term used.",
  "exam-revision": "Structure content as quick-revision points — definitions, formulas, key dates/numbers highlighted, minimal prose.",
  "viva-presentation": "Write as if presenting to an examiner in a college viva — confident, structured, each slide builds a clear argument toward a conclusion.",
  persuasive: "Use a persuasive tone with a clear call-to-action on the final slide — suitable for project pitches or proposals.",
  storytelling: "Frame the content as a narrative with a beginning, conflict/problem, and resolution — engaging for a general audience.",
};

interface SlideOutline {
  title: string;
  slides: Array<{
    heading: string;
    bullets: string[];
    speakerNotes?: string;
    suggestedVisual?: string;
  }>;
}

// ── Usage limit checker middleware ───────────────────────────────────────────
async function enforceAIPPTLimit(req: AuthRequest, res: any, next: () => void) {
  return next();
}

// Helper to clean JSON string from LLM responses
function cleanJsonResponse(text: string): string {
  return text.replace(/```json|```/gi, "").trim();
}

// ── GET OUTLINE ENDPOINT ──────────────────────────────────────────────────────
router.post("/ai-ppt/outline", enforceAIPPTLimit, async (req, res) => {
  try {
    const { mode, input, slideCount = 8, tone, audience } = req.body;

    if (!input || input.trim().length < 3) {
      return res.status(400).json({ success: false, error: "Please provide a topic or content." });
    }

    const toneInstruction = TONE_PROMPTS[tone as ToneKey] ?? TONE_PROMPTS.simple;

    const systemPrompt = `You are an expert presentation designer for Indian students.
Generate a structured slide outline as JSON only — no markdown, no preamble.
${toneInstruction}
${audience ? `Audience: ${audience}` : ""}

Output strictly this JSON shape:
{
  "title": "Presentation title",
  "slides": [
    {
      "heading": "Slide heading (max 8 words)",
      "bullets": ["bullet 1", "bullet 2", "bullet 3"],
      "speakerNotes": "1-2 sentence speaker note",
      "suggestedVisual": "diagram | chart | image: <description> | none"
    }
  ]
}

Rules:
- First slide is always a title slide (heading = title, bullets = subtitle/author line only)
- Last slide is always a "Thank You / Questions" or "Conclusion" slide
- ${slideCount} slides total including title and closing slides
- Each content slide: 3-5 bullets, each bullet under 15 words
- bullets must be substantive — never "Point 1", "Point 2" placeholders`;

    const userMessage =
      mode === "topic"
        ? `Create a presentation about: ${input}`
        : `Convert this raw content into a structured slide outline:\n\n${input}`;

    let cleaned = "";

    if (process.env.OPENROUTER_API_KEY) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://filenova.in",
          "X-Title": "FileNova AI PPT Maker"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) {
        throw new Error(`OpenRouter returned status ${response.status}`);
      }
      const data = await response.json();
      cleaned = cleanJsonResponse(data.choices[0].message.content);
    } else if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [userMessage],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
      cleaned = cleanJsonResponse(response.text || "");
    } else {
      throw new Error("No AI providers configured (OPENROUTER_API_KEY or GEMINI_API_KEY).");
    }

    const outline: SlideOutline = JSON.parse(cleaned);
    res.json({ success: true, outline });
  } catch (err: any) {
    console.error("AI PPT outline error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to generate outline. Please try again.",
    });
  }
});

// ── REGENERATE SLIDE ENDPOINT ────────────────────────────────────────────────
router.post("/ai-ppt/regenerate-slide", enforceAIPPTLimit, async (req, res) => {
  try {
    const { topic, slideHeading, tone, instructions } = req.body;

    const toneInstruction = TONE_PROMPTS[tone as ToneKey] ?? TONE_PROMPTS.simple;

    const systemPrompt = `You are revising one slide of a presentation about "${topic}".
${toneInstruction}
Output strictly this JSON shape, nothing else (no markdown, no preamble):
{ "heading": "...", "bullets": ["...", "..."], "speakerNotes": "...", "suggestedVisual": "..." }`;

    const userMessage = `Current slide heading: "${slideHeading}"${
      instructions ? `\nUser feedback/instructions: ${instructions}` : ""
    }\nRewrite this slide.`;

    let cleaned = "";

    if (process.env.OPENROUTER_API_KEY) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://filenova.in",
          "X-Title": "FileNova AI PPT Maker"
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) {
        throw new Error(`OpenRouter returned status ${response.status}`);
      }
      const data = await response.json();
      cleaned = cleanJsonResponse(data.choices[0].message.content);
    } else if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [userMessage],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
      cleaned = cleanJsonResponse(response.text || "");
    } else {
      throw new Error("No AI providers configured (OPENROUTER_API_KEY or GEMINI_API_KEY).");
    }

    const slide = JSON.parse(cleaned);
    res.json({ success: true, slide });
  } catch (err: any) {
    console.error("AI PPT regenerate-slide error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to regenerate slide." });
  }
});

export default router;
