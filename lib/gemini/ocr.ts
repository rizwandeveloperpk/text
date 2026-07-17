import { getGeminiClient } from './client';
import { withGeminiRetry } from './retry';
import type { OcrResult } from '@/types';

const OCR_SYSTEM_PROMPT = `You are a handwriting transcription engine. You are given a photo of a handwritten page, in any language or script.

Rules you must follow exactly:
1. Detect the language/script the handwriting is actually in, and transcribe it verbatim in that same language and script. Do NOT translate — transcription and translation are separate steps.
2. Preserve the original structure: paragraphs, line breaks, bullet points, and numbered lists.
3. Preserve tables using simple markdown-style rows if a table-like structure is present.
4. Ignore the page background, shadows, notebook lines, margins, and any non-text artifacts.
5. You may silently fix obvious spelling mistakes ONLY when your confidence is very high.
6. Never invent or hallucinate words that are not actually present on the page.
7. If a word or phrase is genuinely illegible, output [Unreadable] in its place instead of guessing.
8. Return ONLY the transcribed text. No preamble, no explanation, no markdown code fences.`;

export interface TranscribeOptions {
  /** Optional hint like "Urdu" or "Hindi" to help the model when the language is known upfront. */
  languageHint?: string;
  /** Lower = more conservative/deterministic (better for messy handwriting), higher = faster/looser. */
  temperature?: number;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function estimateConfidence(text: string): number {
  if (!text.trim()) return 0;
  const words = countWords(text);
  const unreadableCount = (text.match(/\[Unreadable\]/g) ?? []).length;
  if (words === 0) return 0;
  // Heuristic only — Gemini doesn't return a real confidence score, so this
  // estimates transcription quality from how much had to be flagged unreadable.
  const penalty = Math.min(45, unreadableCount * 12);
  return Math.max(50, Math.round(98 - penalty));
}

export async function transcribeHandwriting(
  imageBase64: string,
  mimeType: string,
  options: TranscribeOptions = {}
): Promise<OcrResult & { confidence: number }> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      temperature: options.temperature ?? 0.15,
    },
  });

  const promptParts = [OCR_SYSTEM_PROMPT];
  if (options.languageHint && options.languageHint !== 'auto') {
    promptParts.push(`The handwriting is most likely in ${options.languageHint}. Use that as a hint, but still transcribe exactly what is written.`);
  }

  const result = await withGeminiRetry(() =>
    model.generateContent([
      { text: promptParts.join('\n\n') },
      {
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      },
    ])
  );

  const text = result.response.text().trim();

  return {
    text,
    words: countWords(text),
    characters: text.length,
    confidence: estimateConfidence(text),
  };
}
