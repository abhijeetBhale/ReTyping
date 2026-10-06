import type { Metadata } from "next";
import { Suspense } from "react";
import TypingGame from "@/components/TypingGame";

export const metadata: Metadata = {
  title: "Free Punctuation Typing Speed Test",
  description:
    "Sharpen real-world typing with capitals, commas, and sentence punctuation. This free punctuation typing test scores live WPM and accuracy as you type every day.",
  alternates: { canonical: "/punctuation" },
  openGraph: { url: "/punctuation" },
};

export default function PunctuationPage() {
  return (
    <div className="container-fluid">
      <h1 className="sr-only">Typing test with punctuation</h1>
      <Suspense fallback={<div id="main">Loading…</div>}>
        <TypingGame mode="punctuation" />
      </Suspense>
    </div>
  );
}
