import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ARABIC_SUBJECTS = ["histoire", "arabe", "islamique"];

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY manquante" },
        { status: 500 }
      );
    }

    const { content, title, subject } = await req.json();
    if (!content || content.length < 20) {
      return NextResponse.json(
        { error: "Contenu trop court" },
        { status: 400 }
      );
    }

    const useArabic = ARABIC_SUBJECTS.includes(subject);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.45,
      },
    });

    const prompt = useArabic
      ? `أنت أستاذ الاجتماعيات / العربية في السنة الثالثة إعدادي بالمغرب (3AC).
أنشئ خطاطة ذهنية غنية ومنظمة انطلاقاً من هذا الدرس.

القواعد:
- عقدة جذرية = عنوان الموضوع
- 4 إلى 7 فروع رئيسية
- كل فرع: 2 إلى 5 فروع فرعية (ويمكن مستوى ثالث إن لزم)
- كل عقدة: جملة قصيرة جداً (3–7 كلمات)
- **كل النصوص بالعربية الفصحى الواضحة**
- ركّز على المفاهيم الأساسية، التواريخ، الأسباب، النتائج، التعاريف
- مناسب لمستوى الثالثة إعدادي

صيغة JSON فقط:
{
  "title": "العنوان",
  "children": [
    {
      "title": "فرع",
      "children": [
        { "title": "نقطة" },
        { "title": "نقطة", "children": [{ "title": "تفصيل" }] }
      ]
    }
  ]
}

عنوان الدرس: ${title || "الدرس"}

المحتوى:
"""
${content}
"""`
      : `Tu es un professeur de 3ème année collège (Maroc).
Crée une carte mentale RICHE et structurée à partir de cette leçon.

Règles :
- Nœud racine = titre du sujet
- 4 à 7 branches principales
- Chaque branche : 2 à 5 sous-branches (niveau 3 si utile)
- Chaque nœud : phrase très courte (3–7 mots)
- En français clair
- Focus : définitions, formules, étapes, causes/conséquences
- Niveau 3AC

JSON uniquement :
{
  "title": "Titre",
  "children": [
    {
      "title": "Branche",
      "children": [
        { "title": "Point" },
        { "title": "Point", "children": [{ "title": "Détail" }] }
      ]
    }
  ]
}

Titre : ${title || "Leçon"}

Contenu :
"""
${content}
"""`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
