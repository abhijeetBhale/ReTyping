import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Meet the Team Behind Our Typing Test",
  description:
    "Meet the developers and designers behind Finger Fiasco, the free online typing speed test with five difficulty levels, live WPM scoring, and punctuation tests.",
  alternates: { canonical: "/developers" },
  openGraph: { url: "/developers" },
};

const TEAM = [
  { src: "/images/abhijeet.jpg", name: "Abhijeet Bhale", role: "Developer" },
  { src: "/images/aaryaz.jpg", name: "Aaryaz Singhai", role: "Management" },
  { src: "/images/tanish.jpg", name: "Tanish Vyas", role: "Developer" },
] as const;

export default function DevelopersPage() {
  return (
    <main className="dev-page">
      <h1 className="dev-title">Meet the curators.</h1>
      <p className="dev-subtitle">The small team behind Finger Fiasco.</p>
      <div className="dev-grid">
        {TEAM.map((member) => (
          <div className="dev-card" key={member.name}>
            <Image
              src={member.src}
              alt={member.name}
              width={300}
              height={391}
              priority={member.name === "Abhijeet Bhale"}
            />
            <span>{member.name}</span>
            <p>{member.role}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
