import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "hub3ac_access";

function base64UrlToBytes(value: string): Uint8Array | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.HUB_AUTH_SECRET;
  if (!token || !secret || secret.length < 32) return false;

  const separator = token.indexOf(".");
  if (separator < 1) return false;

  const expiresAt = Number(token.slice(0, separator));
  const signature = base64UrlToBytes(token.slice(separator + 1));
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || !signature) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    return await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(String(expiresAt))
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The login endpoint and page must remain reachable without a session.
  if (pathname === "/login" || pathname.startsWith("/api/site-auth")) {
    if (pathname === "/login" && await hasValidSession(request)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (await hasValidSession(request)) return NextResponse.next();

  // API callers get JSON rather than an HTML redirect.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Session expirée. Connecte-toi pour continuer." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-.*|icons/).*)",
  ],
};
