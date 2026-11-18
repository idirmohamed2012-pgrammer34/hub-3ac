import { NextRequest, NextResponse } from "next/server";
import { errorMessage, generateWithGemini } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { content, language = "fr" } = await req.json();
    if (typeof content !== "string" || content.trim().length < 30) {
      return NextResponse.json({ error: "Contenu trop court (minimum 30 caractères)" }, { status: 400 });
    }
    if (content.length > 60_000) {
      return NextResponse.json({ error: "Le contenu dépasse la limite autorisée (60 000 caractères)." }, { status: 413 });
    }

    const prompt = language === "ar"
      ? `أنت أستاذ للسنة الثالثة إعدادي بالمغرب. لخّص الدرس التالي بالعربية الفصحى، بشكل واضح ومنظم ومناسب للمراجعة. استعمل عناوين ونقاط عند الحاجة، ولا تتجاوز 150 كلمة. لا تخترع معلومات غير موجودة في الدرس.\n\nالدرس:\n${content}`
      : `Tu es un professeur de collège (3AC Maroc). Résume cette leçon en français, de façon claire, structurée et concise. Utilise des titres et des puces si nécessaire. Maximum 150 mots. N'invente aucune information absente du cours.\n\nLeçon :\n${content}`;

    const summary = await generateWithGemini(prompt);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("summary API:", error);
    return NextResponse.json({ error: errorMessage(error, "Erreur lors du résumé") }, { status: 500 });
  }
}
