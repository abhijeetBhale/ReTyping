import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Public origin of the site that initiated login.
 *
 * Behind Render's reverse proxy, `request.url` is the INTERNAL address
 * (e.g. http://localhost:10000 — Render's injected PORT), so redirecting to
 * its origin bounces freshly logged-in users to a dead localhost URL. The
 * proxy's X-Forwarded-* headers carry the real public host/proto — prefer
 * those, and only fall back to request.url for direct local access.
 */
function getPublicOrigin(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getPublicOrigin(request);
  // `next` must stay same-origin: a bare path only, never //evil.com.
  const requested = searchParams.get("next");
  const next =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/";
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/?auth=error`);
}
