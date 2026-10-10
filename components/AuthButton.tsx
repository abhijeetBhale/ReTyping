"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface SessionUser {
  email?: string | null;
  avatarUrl?: string | null;
  name?: string | null;
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
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
  );
}

export function AuthButton() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(configured);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(
        u
          ? {
              email: u.email,
              avatarUrl: (u.user_metadata?.avatar_url as string | undefined) ?? null,
              name: (u.user_metadata?.full_name as string | undefined) ?? u.email,
            }
          : null,
      );
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(
        u
          ? {
              email: u.email,
              avatarUrl: (u.user_metadata?.avatar_url as string | undefined) ?? null,
              name: (u.user_metadata?.full_name as string | undefined) ?? u.email,
            }
          : null,
      );
    });
    return () => listener.subscription.unsubscribe();
  }, [configured]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const signIn = useCallback(async () => {
    const supabase = createClient();
    // Stay on the current page after login — the navbar/avatar just gains
    // the History tab; the game underneath never remounts.
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}` },
    });
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    setUser(null);
  }, []);

  if (loading) return <span className="ff-top-link ff-auth-loading" aria-hidden="true">…</span>;
  if (!configured) {
    return (
      <Link href="/history" className="ff-signin-pill" title="Auth not configured yet — see setup">
        <GoogleIcon />
        <span>Sign in</span>
      </Link>
    );
  }
  if (!user) {
    return (
      <button type="button" className="ff-signin-pill" onClick={signIn}>
        <GoogleIcon />
        <span>Sign in with Google</span>
      </button>
    );
  }

  const initial = (user.name ?? user.email ?? "U").trim().charAt(0).toUpperCase();
  const onHistory = pathname === "/history";

  return (
    <div className="ff-account-wrap">
      <Link
        href="/history"
        className={`ff-top-link${onHistory ? " active" : ""}`}
        aria-current={onHistory ? "page" : undefined}
      >
        History
      </Link>
      <div className="ff-account" ref={menuRef}>
        <button
          type="button"
          className="ff-avatar-btn"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Account: ${user.email ?? "signed in"}`}
          title={user.email ?? "Account"}
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" width={28} height={28} className="ff-avatar-img" referrerPolicy="no-referrer" />
          ) : (
            <span className="ff-avatar-fallback" aria-hidden="true">{initial}</span>
          )}
        </button>
        {open && (
          <div className="ff-account-menu" role="menu">
            <p className="ff-account-email" title={user.email ?? undefined}>{user.email}</p>
            <Link
              href="/history"
              className={`ff-account-item${onHistory ? " active" : ""}`}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              History
            </Link>
            <button type="button" className="ff-account-item" role="menuitem" onClick={signOut}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
