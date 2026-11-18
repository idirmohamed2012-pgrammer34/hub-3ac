import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

const COOKIE_NAME = "hub3ac_access";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function passwordsMatch(input: string, expected: string): boolean {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  if (inputBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(inputBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  const password = process.env.HUB_SITE_PASSWORD;
  const secret = process.env.HUB_AUTH_SECRET;

  if (!password || !secret || secret.length < 32) {
    return NextResponse.json(
      { error: "La protection du site n'est pas configurée. Ajoute HUB_SITE_PASSWORD et HUB_AUTH_SECRET dans les variables Vercel." },
      { status: 503 }
    );
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (typeof body.password !== "string" || !passwordsMatch(body.password, password)) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const signature = createHmac("sha256", secret)
    .update(String(expiresAt))
    .digest("base64url");
  const response = NextResponse.json({ success: true });

  response.cookies.set(COOKIE_NAME, `${expiresAt}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
