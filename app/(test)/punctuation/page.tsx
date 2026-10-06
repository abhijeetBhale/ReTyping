import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Punctuation Typing Speed Test",
  description:
    "Sharpen real-world typing with capitals, commas, and sentence punctuation. This free punctuation typing test scores live WPM and accuracy as you type every day.",
  alternates: { canonical: "/punctuation" },
  openGraph: { url: "/punctuation" },
};

export default function PunctuationPage() {
  return <h1 className="sr-only">Typing test with punctuation</h1>;
}
