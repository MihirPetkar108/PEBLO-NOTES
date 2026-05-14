import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIGenerateResult {
    summary: string;
    actionItems: string[];
    suggestedTitle: string;
}

export const generateAISummary = async (
    title: string,
    content: string,
): Promise<AIGenerateResult> => {
    const prompt = `You are an intelligent note assistant. Analyze the following note and provide:
1. A concise summary (2-3 sentences)
2. A list of action items (if any, max 5)
3. A suggested title (if the current one is generic or untitled)

Note Title: ${title}
Note Content: ${content || "(empty)"}

Respond ONLY with valid JSON in this exact format:
{
  "summary": "...",
  "actionItems": ["...", "..."],
  "suggestedTitle": "..."
}`;

    const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
    });

    const raw = response.choices[0]?.message?.content?.trim() || "{}";

    try {
        const parsed = JSON.parse(raw);
        return {
            summary: parsed.summary || "No summary available.",
            actionItems: Array.isArray(parsed.actionItems)
                ? parsed.actionItems
                : [],
            suggestedTitle: parsed.suggestedTitle || title,
        };
    } catch {
        return {
            summary: raw,
            actionItems: [],
            suggestedTitle: title,
        };
    }
};
