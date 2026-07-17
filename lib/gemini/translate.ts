import { getGeminiClient } from './client';
import { withGeminiRetry } from './retry';

export async function translateToEnglish(text: string): Promise<{ translatedText: string }> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

  const prompt = `Translate the following text into natural, fluent English. Preserve paragraph breaks, bullet points, and numbering exactly as structured. Return ONLY the translated text — no preamble, no notes, no markdown fences.

Text to translate:
${text}`;

  const result = await withGeminiRetry(() => model.generateContent(prompt));
  return { translatedText: result.response.text().trim() };
}
