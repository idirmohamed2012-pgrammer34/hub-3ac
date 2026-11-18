import { NextRequest, NextResponse } from "next/server";
import { errorMessage, generateWithGemini, parseGeminiJson } from "@/lib/ai";

export const runtime = "nodejs";
type QuizQuestion = { question: string; options: string[]; correctIndex: number; explanation: string };

export async function POST(req: NextRequest) {
  try {
    const { lesson, count = 5, language = "fr" } = await req.json();
    if (typeof lesson !== "string" || lesson.trim().length < 50) {
      return NextResponse.json({ error: "Leçon trop courte (minimum 50 caractères)" }, { status: 400 });
    }
    if (lesson.length > 60_000) return NextResponse.json({ error: "Leçon trop longue (maximum 60 000 caractères)" }, { status: 413 });
    const questionCount = Math.min(15, Math.max(3, Number.isFinite(Number(count)) ? Math.round(Number(count)) : 5));

    const prompt = `Tu es un professeur expert de 3ème année collège au Maroc. Génère exactement ${questionCount} QCM à partir du cours fourni.
Langue de sortie : ${language === "ar" ? "arabe standard moderne" : "français"}.
Contraintes : 4 options distinctes par question, une seule bonne réponse, correctIndex entre 0 et 3, explication courte et fidèle au cours. Ne pose aucune question sur une information absente du cours.
Retourne uniquement un objet JSON de cette forme :
{"questions":[{"question":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."}]}
COURS :
${lesson}`;

    const raw = await generateWithGemini(prompt);
    const parsed = parseGeminiJson<{ questions: QuizQuestion[] }>(raw);
    if (!Array.isArray(parsed.questions)) throw new Error("Aucune question valide n'a été générée.");
    const questions = parsed.questions.slice(0, questionCount).filter((q) =>
      typeof q.question === "string" && Array.isArray(q.options) && q.options.length === 4 &&
      Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3 &&
      q.options.every((option) => typeof option === "string") && typeof q.explanation === "string"
    );
    if (!questions.length) throw new Error("Le format des questions générées est invalide.");
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("quiz API:", error);
    return NextResponse.json({ error: errorMessage(error, "Erreur lors de la génération du quiz") }, { status: 500 });
  }
}
