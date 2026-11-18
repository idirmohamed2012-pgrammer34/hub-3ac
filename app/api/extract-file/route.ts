import { NextRequest, NextResponse } from "next/server";
import { errorMessage, generateWithGemini } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { data, mimeType, fileName, subject } = await req.json();
    if (typeof data !== "string" || !data.trim()) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }
    const normalizedMime = mimeType === "application/pdf" ? "application/pdf"
      : mimeType === "image/png" ? "image/png"
      : mimeType === "image/webp" ? "image/webp"
      : mimeType === "image/jpeg" ? "image/jpeg" : null;
    if (!normalizedMime) {
      return NextResponse.json({ error: "Format non pris en charge. Utilise un PDF, PNG, JPG ou WebP." }, { status: 415 });
    }

    const base64 = data.replace(/^data:[^;]+;base64,/i, "").replace(/\s/g, "");
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64) || base64.length > 18_000_000) {
      return NextResponse.json({ error: "Fichier invalide ou trop volumineux (maximum environ 13 Mo)." }, { status: 400 });
    }

    const arabic = ["histoire", "arabe", "islamique"].includes(subject);
    const prompt = arabic
      ? "استخرج النص الكامل المقروء من هذا الملف المدرسي. حافظ على العناوين والفقرات والقوائم والجداول قدر الإمكان، وأبقِ اللغة الأصلية. لا تلخص ولا تضف شرحاً. أعد النص المستخرج فقط."
      : "Extrais fidèlement tout le texte lisible de ce document scolaire. Préserve les titres, paragraphes, listes et tableaux autant que possible, dans la langue d'origine. Ne résume pas et n'ajoute aucune explication. Retourne uniquement le texte extrait.";

    const text = await generateWithGemini([
      { type: "text", text: prompt },
      normalizedMime === "application/pdf"
        ? { type: "document", data: base64, mime_type: normalizedMime }
        : { type: "image", data: base64, mime_type: normalizedMime },
    ]);
    if (text.length < 10) return NextResponse.json({ error: "Impossible d'extraire du texte de ce fichier." }, { status: 422 });

    const suggestedTitle = typeof fileName === "string"
      ? fileName.replace(/\.(pdf|txt|md|text|png|jpe?g|webp)$/i, "").replace(/[_-]/g, " ")
      : "";
    return NextResponse.json({ text, suggestedTitle });
  } catch (error) {
    console.error("extract-file API:", error);
    return NextResponse.json({ error: errorMessage(error, "Erreur lors de l'extraction du fichier") }, { status: 500 });
  }
}
