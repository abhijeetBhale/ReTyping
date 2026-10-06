import { Suspense } from "react";
import TypingGame from "@/components/TypingGame";

/**
 * Shared shell for the three game routes (/, /punctuation, /numbers).
 * TypingGame lives here — not in the pages — so switching tabs never
 * remounts it: the config slider glides, focus is kept, and only the
 * words and the screen-reader h1 swap. URLs are unaffected (route groups
 * are invisible to routing).
 */
export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-fluid">
      {children}
      <Suspense fallback={<div id="main">Loading…</div>}>
        <TypingGame />
      </Suspense>
    </div>
  );
}
