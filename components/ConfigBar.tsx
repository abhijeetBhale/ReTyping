"use client";

import Link from "next/link";
import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
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

/**
 * One option group with a butter-smooth sliding active pill.
 * The pill is measured from the live `.active` item and written straight
 * to the DOM — no React state, so gliding never costs a re-render.
 */
function ConfigGroup({
  label,
  activeKey,
  children,
}: {
  label: string;
  activeKey: string;
  children: ReactNode;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLSpanElement>(null);
  const childCount = Children.count(children);

  const measure = useCallback(() => {
    const group = groupRef.current;
    const slider = sliderRef.current;
    if (!group || !slider) return;
    const active = group.querySelector(":scope > .ff-config-item.active");
    if (!(active instanceof HTMLElement)) {
      // No active option (e.g. plain home route): park the pill out of sight.
      slider.style.opacity = "0";
      return;
    }
    slider.style.opacity = "1";
    slider.style.transform = `translateX(${active.offsetLeft}px)`;
    slider.style.width = `${active.offsetWidth}px`;
  }, []);

  // Re-measure whenever the active option (or item count) changes.
  // Runs before paint, so the pill glides from its old spot — never jumps.
  useLayoutEffect(measure, [measure, activeKey, childCount]);

  // Re-measure when layout shifts underneath (resize, font swap-in).
  useEffect(() => {
    window.addEventListener("resize", measure);
    let cancelled = false;
    document.fonts?.ready
      .then(() => {
        if (!cancelled) measure();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div ref={groupRef} className="ff-config-group" role="group" aria-label={label}>
      <span ref={sliderRef} className="ff-config-slider" aria-hidden="true" />
      {children}
    </div>
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
      <ConfigGroup label="Test content" activeKey={pathname}>
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
      </ConfigGroup>

      <ConfigGroup label="English difficulty level" activeKey={String(level)}>
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
      </ConfigGroup>

      <ConfigGroup label="Test duration" activeKey={String(activeDuration)}>
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
      </ConfigGroup>
    </div>
  );
}
