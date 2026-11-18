import { NextRequest, NextResponse } from "next/server";
import { errorMessage, generateWithGemini } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType, subject } = await req.json();
    if (typeof image !== "string" || !image.trim()) {
      return NextResponse.json({ error: "Aucune image fournie" }, { status: 400 });
    }
    const normalizedMime = typeof mimeType === "string" && /^image\/(jpeg|png|webp|heic|heif)$/i.test(mimeType)
      ? mimeType : "image/jpeg";
    const base64 = image.replace(/^data:image\/[\w.+-]+;base64,/i, "").replace(/\s/g, "");
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64) || base64.length > 18_000_000) {
      return NextResponse.json({ error: "Image invalide ou trop volumineuse (maximum environ 13 Mo)." }, { status: 400 });
    }

    const arabic = ["histoire", "arabe", "islamique"].includes(subject);
    const prompt = arabic
      ? "استخرج النص المقروء من صورة الدرس بدقة. حافظ على العناوين والفقرات والنقاط واللغة الأصلية. لا تشرح ولا تلخص. أعد النص المستخرج فقط."
      : "Extrais fidèlement tout le texte lisible de cette photo de cours. Préserve les titres, paragraphes, listes et la langue d'origine. Ne résume pas et n'ajoute aucun commentaire. Retourne uniquement le texte extrait.";

    const text = await generateWithGemini([
      { type: "text", text: prompt },
      { type: "image", data: base64, mime_type: normalizedMime },
    ]);
    if (text.length < 10) return NextResponse.json({ error: "Impossible d'extraire du texte de cette image." }, { status: 422 });
    return NextResponse.json({ text });
  } catch (error) {
    console.error("extract API:", error);
    return NextResponse.json({ error: errorMessage(error, "Erreur lors de l'extraction") }, { status: 500 });
  }
}
