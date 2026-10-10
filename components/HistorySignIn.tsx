"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function HistorySignIn() {
  const [busy, setBusy] = useState(false);

  const signIn = useCallback(async () => {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/history` },
      });
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <button type="button" className="ff-signin-pill ff-signin-large" onClick={signIn} disabled={busy}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.6-5 3.6-8.7z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.3 7.5 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.7 0 10.2 0 12s.5 3.3 1.4 4.7l3.8-2.3z"
        />
        <path
          fill="#EA4335"
          d="M12 4.6c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.7 1.4 6.8l3.8 2.9c1-2.9 3.7-5.1 6.8-5.1z"
        />
      </svg>
      <span>{busy ? "Redirecting…" : "Sign in with Google"}</span>
    </button>
  );
}
