import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export type GeminiContent =
  | { type: "text"; text: string }
  | { type: "image" | "document"; data: string; mime_type: string };

export async function generateWithGemini(
  input: string | GeminiContent[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY manquante. Configure-la dans les variables d'environnement de Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const interaction = await ai.interactions.create({
    model: MODEL,
    input,
  });

  const output = interaction.output_text?.trim();
  if (!output) {
    throw new Error("Gemini n'a retourné aucun texte. Réessaie dans quelques instants.");
  }
  return output;
}

export function parseGeminiJson<T>(value: string): T {
  const cleaned = value
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    }
    throw new Error("La réponse IA n'est pas un JSON valide. Réessaie.");
  }
}

export function errorMessage(error: unknown, fallback = "Une erreur est survenue"): string {
  if (error instanceof Error) return error.message;
  return fallback;
}
