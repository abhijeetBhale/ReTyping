"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { DURATIONS_MS, GAME_TIME_MS } from "@/lib/config";
import { ENGLISH_LEVELS, LEVEL_META, parseLevel } from "@/lib/words";

function withParams(
  pathname: string,
  searchParams: URLSearchParams,
  targetPath: string,
  patch: Record<string, string>,
): string {
  const params = new URLSearchParams(searchParams.toString());
  for (const [key, value] of Object.entries(patch)) params.set(key, value);
  const query = params.toString();
  return query ? `${targetPath}?${query}` : targetPath;
}

function AtIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M10 3 8 21" />
      <path d="M16 3l-2 18" />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

/**
 * Monkeytype-style config bar: content toggles, difficulty levels, durations.
 * Every option is a param-preserving Link, so each combination is shareable.
 */
export function ConfigBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const level = parseLevel(searchParams.get("level"));
  const activeDuration = Number(searchParams.get("duration")) || GAME_TIME_MS;

  const modeHref = (target: string) => withParams(pathname, searchParams, target, {});
  const levelHref = (next: number) =>
    withParams(pathname, searchParams, pathname, { level: String(next) });
  const durationHref = (ms: number) =>
    withParams(pathname, searchParams, pathname, { duration: String(ms) });

  return (
    <div className="ff-config" role="group" aria-label="Typing test options">
      <div className="ff-config-group" role="group" aria-label="Test content">
        <Link
          href={modeHref("/punctuation")}
          className={`ff-config-item${pathname === "/punctuation" ? " active" : ""}`}
          aria-current={pathname === "/punctuation" ? "page" : undefined}
        >
          <AtIcon />
          punctuation
        </Link>
        <Link
          href={modeHref("/numbers")}
          className={`ff-config-item${pathname === "/numbers" ? " active" : ""}`}
          aria-current={pathname === "/numbers" ? "page" : undefined}
        >
          <HashIcon />
          numbers
        </Link>
      </div>

      <div className="ff-config-group" role="group" aria-label="English difficulty level">
        <span className="ff-config-lead" aria-hidden="true">
          <GaugeIcon />
        </span>
        {ENGLISH_LEVELS.map((l) => (
          <Link
            key={l}
            href={levelHref(l)}
            className={`ff-config-item ff-config-number${l === level ? " active" : ""}`}
            title={LEVEL_META[l].blurb}
            aria-label={`English level ${l}: ${LEVEL_META[l].blurb}`}
            aria-current={l === level ? "true" : undefined}
          >
            {l}
          </Link>
        ))}
      </div>

      <div className="ff-config-group" role="group" aria-label="Test duration">
        {DURATIONS_MS.map((ms) => (
          <Link
            key={ms}
            href={durationHref(ms)}
            className={`ff-config-item ff-config-number${ms === activeDuration ? " active" : ""}`}
            aria-label={`Test duration ${ms / 1000} seconds`}
            aria-current={ms === activeDuration ? "true" : undefined}
          >
            {ms / 1000}
          </Link>
        ))}
      </div>
    </div>
  );
}
