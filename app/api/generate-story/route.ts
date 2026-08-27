import { NextRequest, NextResponse } from "next/server";
import { generateTemplateStory, GenerateStoryParams } from "@/lib/story-generator";
import { Story } from "@/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a curriculum designer for an English-learning app called StoryLevel English. You write original CEFR-leveled short stories with comprehension questions. You must respond with ONLY valid JSON matching the exact schema given — no markdown fences, no commentary.`;

function buildUserPrompt(p: GenerateStoryParams) {
  return `Write one original short story for CEFR level ${p.level}, on the topic "${p.topic}", approximate length: ${p.length} (respect typical ${p.level} word-count conventions for that length). Focus grammar on: ${p.grammarFocus || "level-appropriate grammar"}. Focus vocabulary on: ${p.vocabularyFocus || p.topic}. ${p.customPrompt ? `Additional instruction: ${p.customPrompt}` : ""}

Respond with ONLY this JSON shape (no markdown, no extra text):
{
  "title": string,
  "description": string (1-2 sentence hook),
  "paragraphs": string[] (the story split into short paragraphs, genuinely matching ${p.level} complexity),
  "wordCount": number,
  "vocabulary": [{ "word": string, "partOfSpeech": string, "pronunciation": string, "definition": string, "example": string }] (8-15 items, all words must appear in the story),
  "questions": [{ "id": string, "type": "multiple-choice"|"true-false"|"meaning"|"fill-blank"|"ordering"|"who-said-it"|"vocab-in-context"|"main-idea"|"detail"|"inference", "prompt": string, "options": string[] (omit for fill-blank), "correctAnswer": string or string[] (string[] only for ordering), "explanation": string, "relevantExcerpt": string (exact quote from paragraphs) }] (8-10 items, at least 6 different types),
  "speakingPrompts": string[] (4-5 items),
  "grammarFocus": string[],
  "vocabularyFocus": string[]
}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GenerateStoryParams;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserPrompt(body) }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text: string = data.content?.[0]?.text ?? "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const story: Story = {
            id: `generated-${Date.now()}`,
            title: parsed.title,
            level: body.level,
            category: body.topic,
            description: parsed.description,
            readingTime: Math.max(2, Math.round((parsed.wordCount ?? 400) / 200)),
            wordCount: parsed.wordCount ?? 0,
            difficulty: ({ A1: 1, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 } as const)[body.level],
            paragraphs: parsed.paragraphs,
            vocabulary: parsed.vocabulary,
            questions: parsed.questions,
            speakingPrompts: parsed.speakingPrompts,
            grammarFocus: parsed.grammarFocus ?? [body.grammarFocus],
            vocabularyFocus: parsed.vocabularyFocus ?? [body.vocabularyFocus],
            audioAvailable: true,
          };
          if (story.paragraphs?.length && story.questions?.length) {
            return NextResponse.json({ story, source: "ai" });
          }
        }
      }
    } catch {
      // fall through to template generator
    }
  }

  const story = generateTemplateStory(body);
  return NextResponse.json({ story, source: "template" });
}
