"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import { DURATIONS_MS, GAME_TIME_MS, type GameMode } from "@/lib/config";
import { LEVEL_META, parseLevel } from "@/lib/words";
import { ConfigBar } from "@/components/ConfigBar";
import { ResultCard } from "@/components/ResultCard";

function letterClass(
  status: "pending" | "correct" | "incorrect",
  extra: boolean,
  isCurrent: boolean,
): string {
  return [
    "letter",
    status === "correct" ? "correct" : "",
    status === "incorrect" ? "incorrect" : "",
    extra ? "extra" : "",
    isCurrent ? "current" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function TypingGame() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Mode follows the route — the game itself persists across tab switches
  // (it lives in the shared route-group layout), so this just swaps words.
  const mode: GameMode =
    pathname === "/punctuation"
      ? "punctuation"
      : pathname === "/numbers"
        ? "numbers"
        : "home";
  const requested = Number(searchParams.get("duration"));
  const durationMs = DURATIONS_MS.includes(requested as (typeof DURATIONS_MS)[number])
    ? requested
    : GAME_TIME_MS;
  const level = parseLevel(searchParams.get("level"));

  const {
    words,
    wordIndex,
    letterIndex,
    secondsLeft,
    isOver,
    wpm,
    isFocused,
    setIsFocused,
    cursor,
    gameRef,
    wordsRef,
    handleKeyDown,
    reset,
    focusGame,
  } = useTypingEngine(mode, level, durationMs);

  // Live accuracy + word stats, derived from letter states up to the
  // current word. Extras count as attempts, so overtyping lowers accuracy.
  const { accuracy, correctWords, typedWords } = useMemo(() => {
    let correctChars = 0;
    let typedChars = 0;
    let correct = 0;
    words.forEach((word, wi) => {
      // Character accuracy includes the in-progress word.
      if (wi <= wordIndex) {
        word.forEach((letter) => {
          if (letter.status === "correct") correctChars += 1;
          if (letter.status !== "pending") typedChars += 1;
        });
      }
      // Word stats count finished words only, matching the WPM measure.
      if (wi < wordIndex && word.length > 0 && word.every((l) => l.status === "correct" && !l.extra)) {
        correct += 1;
      }
    });
    return {
      accuracy: typedChars === 0 ? 100 : (correctChars / typedChars) * 100,
      correctWords: correct,
      typedWords: wordIndex,
    };
  }, [words, wordIndex]);

  const finished = isOver && wpm !== null;

  // Entrance choreography plays exactly once per page lifetime. Route remounts
  // (tab switches) must not replay it — that replay is the visible flicker.
  const [isBoot, setIsBoot] = useState(false);
  useLayoutEffect(() => {
    const flag = window as unknown as { __ffBooted?: boolean };
    if (!flag.__ffBooted) {
      flag.__ffBooted = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsBoot(true);
    }
  }, []);

  // Re-focus #game on any keypress (legacy global keydown handler), and
  // Shift+Enter anywhere resets. Intentionally NOT hijacking Ctrl+R.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        reset();
        return;
      }
      if (document.activeElement !== gameRef.current) {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) return;
        focusGame();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [focusGame, reset, gameRef]);

  return (
    <div id="main" className={isBoot ? "ff-boot" : undefined}>
      <ConfigBar />
      <div id="info-container">
        <div id="timer" aria-live="polite">
          {finished ? `WPM: ${wpm.toFixed(0)}` : `${secondsLeft}s`}
        </div>
        {!finished && (
          <div id="accuracy" title="Typing accuracy">
            {accuracy.toFixed(0)}% acc
          </div>
        )}
        <div id="info-right">
          <button id="reset-button" type="button" onClick={reset} aria-label="Start a new typing test">
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
            New Game
          </button>
        </div>
      </div>

      {finished ? (
        <ResultCard
          wpm={wpm}
          accuracy={accuracy}
          correctWords={correctWords}
          typedWords={typedWords}
          durationLabel={`${Math.round(durationMs / 1000)}s`}
          levelLabel={LEVEL_META[level].label}
          onRetry={reset}
        />
      ) : (
        <div
          id="game"
          ref={gameRef}
          tabIndex={0}
          role="textbox"
          aria-label="Typing test. Click to focus, then start typing."
          className={isOver ? "over" : ""}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onClick={focusGame}
        >
          <div id="words" ref={wordsRef}>
            {words.map((word, wi) => (
              <div
                key={wi}
                className={`word${wi === wordIndex ? " current" : ""}`}
                data-word={wi}
              >
                {word.map((letter, li) => (
                  <span
                    key={`${wi}-${li}${letter.extra ? "-x" : ""}`}
                    className={letterClass(
                      letter.status,
                      letter.extra,
                      wi === wordIndex && li === letterIndex && !letter.extra,
                    )}
                    data-pos={!letter.extra ? `${wi}-${li}` : undefined}
                  >
                    {letter.char}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div
            id="cursor"
            style={{
              display: isFocused && !isOver ? "block" : "none",
              top: cursor.top,
              left: cursor.left,
              height: cursor.height > 0 ? cursor.height : undefined,
            }}
          />
          {!isFocused && !isOver && (
            <div id="focus-error" onClick={focusGame}>
              <span className="ff-focus-pill">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
                </svg>
                <span>Click to focus and start typing</span>
              </span>
            </div>
          )}
        </div>
      )}

      <div className="key-tips">
        <span className="tip1">shift + enter</span>
        <span className="test-reset">- Reset Test</span>
      </div>
    </div>
  );
}
