import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/** Matières qui génèrent les cartes mentales en arabe */
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
    if (!content || content.length < 30) {
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
        temperature: 0.5,
      },
    });

    const prompt = useArabic
      ? `أنت أستاذ الاجتماعيات في السنة الثالثة إعدادي (المغرب - 3AC).
انطلاقاً من هذا الدرس، أنشئ خطاطة ذهنية (mind map) منظمة.

القواعد الصارمة:
- عقدة جذرية واحدة (عنوان الموضوع)
- من 3 إلى 6 فروع رئيسية
- كل فرع يمكن أن يحتوي على 2 إلى 5 فروع فرعية
- نص قصير وواضح (6 كلمات كحد أقصى لكل عقدة)
- **كل النصوص يجب أن تكون بالعربية الفصحى**
- مناسب لمستوى الثالثة إعدادي

صيغة JSON الصارمة:
{
  "title": "العنوان الرئيسي",
  "children": [
    {
      "title": "الفرع 1",
      "children": [
        { "title": "نقطة فرعية 1" },
        { "title": "نقطة فرعية 2" }
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
À partir de cette leçon, génère une carte mentale (mind map) structurée.

Règles STRICTES :
- Un nœud racine (le titre du sujet)
- 3 à 6 branches principales
- Chaque branche peut avoir 2 à 5 sous-branches
- Texte court et clair (max 6 mots par nœud)
- En français
- Adapté au niveau 3AC

Format JSON strict :
{
  "title": "Titre principal",
  "children": [
    {
      "title": "Branche 1",
      "children": [
        { "title": "Sous-point 1" },
        { "title": "Sous-point 2" }
      ]
    }
  ]
}

Titre de la leçon : ${title || "Leçon"}

Contenu :
"""
${content}
"""`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Erreur" },
      { status: 500 }
    );
  }
}
