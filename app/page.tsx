import type { Metadata } from "next";
import { Suspense } from "react";
import TypingGame from "@/components/TypingGame";

export const metadata: Metadata = {
  title: "Free Online Typing Speed Test (WPM)",
  description:
    "Take a free 15, 30, or 60-second typing speed test with live WPM and accuracy scoring. Level up from easy words to expert vocabulary as you practice daily.",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function HomePage() {
  return (
    <div className="container-fluid">
      <h1 className="sr-only">Free online typing speed test</h1>
      <Suspense fallback={<div id="main">Loading…</div>}>
        <TypingGame mode="home" />
      </Suspense>
    </div>
  );
}
