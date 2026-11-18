import { GoogleGenAI } from "@google/genai";

// 3.8 is the primary model. If Google reports temporary overload/rate limiting,
// transparently fall back to lighter models available to newer API projects.
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.6-flash"];
const RETRY_DELAYS_MS = [1_000, 2_000];

export type GeminiContent =
  | { type: "text"; text: string }
  | { type: "image" | "document"; data: string; mime_type: string };

function errorText(error: unknown): string {
  if (error instanceof Error) {
    const details = error as Error & { status?: number; statusCode?: number; code?: number | string; message: string };
    return [details.message, details.status, details.statusCode, details.code]
      .filter((value) => value !== undefined && value !== null)
      .join(" ");
  }
  if (typeof error === "string") return error;
  try { return JSON.stringify(error); } catch { return String(error); }
}

function isTemporaryCapacityError(error: unknown): boolean {
  const message = errorText(error).toLowerCase();
  return /\b(429|500|502|503|504)\b|resource_exhausted|unavailable|high demand|overloaded|temporarily unavailable|rate.?limit|too many requests/.test(message);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestModel(
  ai: GoogleGenAI,
  model: string,
  input: string | GeminiContent[]
): Promise<string> {
  const interaction = await ai.interactions.create({ model, input });
  const output = interaction.output_text?.trim();
  if (!output) throw new Error(`Le modèle ${model} n'a retourné aucun texte.`);
  return output;
}

export async function generateWithGemini(
  input: string | GeminiContent[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY manquante. Configure-la dans les variables d'environnement de Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const models = [...new Set([PRIMARY_MODEL, ...FALLBACK_MODELS])];
  let lastError: unknown;

  for (let index = 0; index < models.length; index++) {
    const model = models[index];

    // Try the primary model, then make at most two fallback attempts with
    // exponential backoff. This follows Google's retry guidance.
    if (index > 0) await wait(RETRY_DELAYS_MS[index - 1] ?? 2_000);

    try {
      const result = await requestModel(ai, model, input);
      if (model !== PRIMARY_MODEL) {
        console.warn(`Gemini fallback succeeded: ${PRIMARY_MODEL} -> ${model}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Gemini request failed for ${model}:`, error);

      if (!isTemporaryCapacityError(error)) {
        throw new Error(errorText(error) || "Erreur Gemini inconnue.");
      }
    }
  }

  console.error("All Gemini models are temporarily unavailable:", lastError);
  throw new Error(
    "Les serveurs Gemini sont actuellement très sollicités. Hub 3AC a essayé plusieurs modèles automatiquement, mais aucun n'est disponible pour le moment. Réessaie dans quelques minutes."
  );
}

export function parseGeminiJson<T>(value: string): T {
  const cleaned = value
    .replace(/^\\uFEFF/, "")
    .trim()
    .replace(/^```(?:json)?\\s*/i, "")
    .replace(/\\s*```$/, "");

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
