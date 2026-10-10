"use client";

import { useEffect, useMemo, useState } from "react";

function useCountUp(target: number, durationMs = 800): number {
  const reduceMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const [value, setValue] = useState(reduceMotion ? target : 0);
  useEffect(() => {
    if (reduceMotion) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // Ease-out cubic: fast rise, gentle landing.
      const eased = 1 - (1 - t) ** 3;
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, reduceMotion]);
  return value;
}

export function ResultCard({
  wpm,
  accuracy,
  correctWords,
  typedWords,
  durationLabel,
  levelLabel,
  onRetry,
}: {
  wpm: number;
  accuracy: number;
  correctWords: number;
  typedWords: number;
  durationLabel: string;
  levelLabel: string;
  onRetry: () => void;
}) {
  const displayed = useCountUp(wpm);

  return (
    <div className="ff-result" role="status" aria-label={`Test complete. ${wpm.toFixed(0)} words per minute.`}>
      <p className="ff-result-eyebrow">Test complete.</p>
      <div className="ff-result-wpm-row">
        <p className="ff-result-wpm">{displayed.toFixed(0)}</p>
        <p className="ff-result-unit">wpm</p>
      </div>
      <div className="ff-result-stats">
        <div className="ff-result-stat">
          <span className="ff-result-stat-value">{accuracy.toFixed(0)}%</span>
          <span className="ff-result-stat-label">Accuracy</span>
        </div>
        <div className="ff-result-stat">
          <span className="ff-result-stat-value">
            {correctWords}/{typedWords}
          </span>
          <span className="ff-result-stat-label">Words</span>
        </div>
        <div className="ff-result-stat">
          <span className="ff-result-stat-value">{durationLabel}</span>
          <span className="ff-result-stat-label">Time</span>
        </div>
        <div className="ff-result-stat">
          <span className="ff-result-stat-value">{levelLabel}</span>
          <span className="ff-result-stat-label">Level</span>
        </div>
      </div>
      <div className="ff-result-actions">
        <button type="button" className="ff-result-retry" onClick={onRetry}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 2.6-6.4" />
            <path d="M3 4v5h5" />
          </svg>
          Retry test
        </button>
      </div>
    </div>
  );
}
