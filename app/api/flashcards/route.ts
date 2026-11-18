import { NextRequest, NextResponse } from "next/server";
import { errorMessage, generateWithGemini, parseGeminiJson } from "@/lib/ai";

export const runtime = "nodejs";
type Card = { front: string; back: string };

export async function POST(req: NextRequest) {
  try {
    const { content, subject, language } = await req.json();
    if (typeof content !== "string" || content.trim().length < 30) {
      return NextResponse.json({ error: "Contenu trop court (minimum 30 caractères)" }, { status: 400 });
    }
    if (content.length > 60_000) return NextResponse.json({ error: "Contenu trop long (maximum 60 000 caractères)" }, { status: 413 });
    const arabic = language === "ar" || ["histoire", "arabe", "islamique"].includes(subject);

    const prompt = `Tu es un professeur de 3ème année collège au Maroc. Crée exactement 8 flashcards de révision à partir du cours.
Langue : ${arabic ? "arabe standard moderne" : "français"}.
Chaque carte contient "front" (question ou terme court) et "back" (réponse claire, concise et exacte). Niveau 3AC. N'ajoute aucune information extérieure au cours.
Retourne uniquement ce JSON : {"cards":[{"front":"...","back":"..."}]}
COURS :
${content}`;

    const raw = await generateWithGemini(prompt);
    const parsed = parseGeminiJson<{ cards: Card[] }>(raw);
    const cards = Array.isArray(parsed.cards) ? parsed.cards.slice(0, 8).filter((card) =>
      typeof card.front === "string" && card.front.trim() &&
      typeof card.back === "string" && card.back.trim()
    ) : [];
    if (!cards.length) throw new Error("Aucune flashcard valide n'a été générée.");
    return NextResponse.json({ cards });
  } catch (error) {
    console.error("flashcards API:", error);
    return NextResponse.json({ error: errorMessage(error, "Erreur lors de la génération des flashcards") }, { status: 500 });
  }
}
