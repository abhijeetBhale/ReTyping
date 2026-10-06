"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { DURATIONS_MS } from "@/lib/config";

function durationHref(pathname: string, ms: number): string {
  return `${pathname}?duration=${ms}`;
}

function NavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeDuration = searchParams.get("duration");

  const modeLink = (href: string, label: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`nav-link${active ? " active" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <Link href="/" className="ff-brand">
        <span className="ff-brand-mark" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            style={{ fill: "currentColor" }}
          >
            <path d="M21 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-8 2h2v2h-2V7zm0 4h2v2h-2v-2zM9 7h2v2H9V7zm0 4h2v2H9v-2zM5 7h2v2H5V7zm0 4h2v2H5v-2zm12 6H7v-2h10v2zm2-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
          </svg>
        </span>
        <span className="ff-brand-text">Finger Fiasco</span>
      </Link>
      <div className="ff-links">
        {modeLink("/", "Home")}
        {modeLink("/punctuation", "Punctuation")}
        {modeLink("/numbers", "Numbers")}
        {modeLink("/developers", "Developers")}
        <span className="ff-durations" role="group" aria-label="Test duration">
          {DURATIONS_MS.map((ms) => (
            <Link
              key={ms}
              href={durationHref(pathname, ms)}
              className={`nav-link${activeDuration === String(ms) ? " active" : ""}`}
            >
              {ms / 1000}s
            </Link>
          ))}
        </span>
      </div>
    </>
  );
}

export function Navbar() {
  return (
    <header className="ff-header">
      <nav className="ff-nav" aria-label="Primary">
        <Suspense fallback={null}>
          <NavContent />
        </Suspense>
      </nav>
    </header>
  );
}
