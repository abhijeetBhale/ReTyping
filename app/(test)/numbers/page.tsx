import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Numbers Typing Speed Test & Practice",
  description:
    "Type numbers mixed with words, just like real invoices and data entry. This free numbers typing test tracks your live WPM and accuracy on every round.",
  alternates: { canonical: "/numbers" },
  openGraph: { url: "/numbers" },
};

export default function NumbersPage() {
  return <h1 className="sr-only">Typing test with numbers</h1>;
}
