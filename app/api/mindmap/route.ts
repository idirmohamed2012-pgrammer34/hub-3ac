import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY manquante" },
        { status: 500 }
      );
    }

    const { content, title } = await req.json();
    if (!content || content.length < 30) {
      return NextResponse.json(
        { error: "Contenu trop court" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const prompt = `Tu es un professeur de 3ème année collège (Maroc).
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
