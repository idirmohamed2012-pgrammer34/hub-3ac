import { NextRequest, NextResponse } from "next/server";
import { errorMessage, generateWithGemini, parseGeminiJson } from "@/lib/ai";

export const runtime = "nodejs";
type MindNode = { title: string; children?: MindNode[] };
const ARABIC_SUBJECTS = ["histoire", "arabe", "islamique"];

export async function POST(req: NextRequest) {
  try {
    const { content, title, subject, language } = await req.json();
    if (typeof content !== "string" || content.trim().length < 20) {
      return NextResponse.json({ error: "Contenu trop court (minimum 20 caractères)" }, { status: 400 });
    }
    if (content.length > 60_000) return NextResponse.json({ error: "Contenu trop long (maximum 60 000 caractères)" }, { status: 413 });
    const arabic = language === "ar" || ARABIC_SUBJECTS.includes(subject);

    const prompt = arabic
      ? `أنت أستاذ للسنة الثالثة إعدادي بالمغرب. أنشئ خطاطة ذهنية غنية ومنظمة انطلاقاً من الدرس.
القواعد: عنوان جذري واضح، من 4 إلى 7 فروع رئيسية، ولكل فرع من 2 إلى 5 فروع فرعية. اجعل كل عقدة قصيرة جداً. استعمل العربية الفصحى فقط. ركّز على المفاهيم والتواريخ والأسباب والنتائج والتعاريف، ولا تضف معلومات غير موجودة في الدرس.
أعد JSON فقط بهذا الشكل: {"title":"العنوان","children":[{"title":"فرع","children":[{"title":"نقطة"}]}]}
عنوان الدرس: ${title || "الدرس"}
محتوى الدرس:
${content}`
      : `Tu es un professeur de 3ème année collège (Maroc). Crée une carte mentale riche et structurée à partir de cette leçon.
Règles : titre racine clair, 4 à 7 branches principales, 2 à 5 sous-branches par branche, formulations très courtes. Français clair, niveau 3AC. Concentre-toi sur les notions, dates, causes, conséquences et définitions. N'invente aucune information absente du cours.
Retourne uniquement ce JSON : {"title":"Titre","children":[{"title":"Branche","children":[{"title":"Point"}]}]}
Titre : ${title || "Leçon"}
Contenu :
${content}`;

    const raw = await generateWithGemini(prompt);
    const parsed = parseGeminiJson<MindNode>(raw);
    if (typeof parsed.title !== "string" || !Array.isArray(parsed.children)) {
      throw new Error("La structure de la carte mentale est invalide.");
    }
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("mindmap API:", error);
    return NextResponse.json({ error: errorMessage(error, "Erreur lors de la génération de la carte mentale") }, { status: 500 });
  }
}
