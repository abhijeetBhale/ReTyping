import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Typing Speed Test (WPM)",
  description:
    "Take a free 15, 30, or 60-second typing speed test with live WPM and accuracy scoring. Level up from easy words to expert vocabulary as you practice daily.",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function HomePage() {
  return <h1 className="sr-only">Free online typing speed test</h1>;
}
