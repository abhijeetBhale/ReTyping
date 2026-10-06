"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  GAME_TIME_MS,
  WORD_COUNT,
  type GameMode,
} from "@/lib/config";
import { wordsForTest, type EnglishLevel } from "@/lib/words";

export interface EngineLetter {
  char: string;
  status: "pending" | "correct" | "incorrect";
  extra: boolean;
}

export type EngineWord = EngineLetter[];

export interface CursorPos {
  top: number;
  left: number;
  height: number;
}

function buildWords(mode: GameMode, level: EnglishLevel, count: number): EngineWord[] {
  return wordsForTest(mode, level, count).map((word) =>
    word.split("").map((char): EngineLetter => ({ char, status: "pending", extra: false })),
  );
}

/** Fully-correct typed words / minutes. */
function calcWpm(words: EngineWord[], typedWordCount: number, durationMs: number): number {
  const typed = words.slice(0, typedWordCount);
  const correct = typed.filter(
    (word) =>
      word.length > 0 &&
      word.every((letter) => letter.status === "correct" && !letter.extra),
  );
  return correct.length / (durationMs / 60000);
}

const VISIBLE_LINES = 3;

export function useTypingEngine(mode: GameMode, level: EnglishLevel, durationMs: number = GAME_TIME_MS) {

  const [words, setWords] = useState<EngineWord[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(durationMs / 1000));
  const [isOver, setIsOver] = useState(false);
  const [wpm, setWpm] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [cursor, setCursor] = useState<CursorPos>({ top: 0, left: 0, height: 0 });

  const gameRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const gameStartRef = useRef<number | null>(null);
  // Scroll offset lives in a ref + direct DOM transform: no extra render pass,
  // so scroll and caret always land in the same frame (no jitter / no drift).
  const offsetRef = useRef(0);
  const lineHeightRef = useRef(0);
  // Synchronous mirrors so rapid key repeats never read stale state.
  const posRef = useRef({ wordIndex: 0, letterIndex: 0 });
  const wordsRefState = useRef<EngineWord[]>([]);
  const overRef = useRef(false);

  useEffect(() => {
    posRef.current = { wordIndex, letterIndex };
  }, [wordIndex, letterIndex]);
  useEffect(() => {
    wordsRefState.current = words;
  }, [words]);
  useEffect(() => {
    overRef.current = isOver;
  }, [isOver]);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const gameOver = useCallback(() => {
    clearTimer();
    setWpm(calcWpm(wordsRefState.current, posRef.current.wordIndex, durationMs));
    setIsOver(true);
  }, [clearTimer, durationMs]);

  const applyOffset = useCallback((offset: number) => {
    offsetRef.current = Math.min(0, offset);
    const el = wordsRef.current;
    if (el) el.style.transform = `translateY(${offsetRef.current}px)`;
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    gameStartRef.current = null;
    offsetRef.current = 0;
    lineHeightRef.current = 0;
    const fresh = buildWords(mode, level, WORD_COUNT);
    wordsRefState.current = fresh;
    posRef.current = { wordIndex: 0, letterIndex: 0 };
    overRef.current = false;
    setWords(fresh);
    setWordIndex(0);
    setLetterIndex(0);
    setSecondsLeft(Math.round(durationMs / 1000));
    setIsOver(false);
    setWpm(null);
    setCursor({ top: 0, left: 0, height: 0 });
    requestAnimationFrame(() => {
      const el = wordsRef.current;
      if (el) el.style.transform = "translateY(0px)";
      gameRef.current?.focus();
    });
  }, [clearTimer, mode, level, durationMs]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reset();
  }, [mode, level, durationMs]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => clearTimer, [clearTimer]);

  // Measure one true line height from two rendered rows (immune to font/padding drift).
  const measureLineHeight = useCallback((): number => {
    if (lineHeightRef.current > 0) return lineHeightRef.current;
    const game = gameRef.current;
    if (!game) return 0;
    const rows = game.querySelectorAll("[data-word]");
    let firstTop = -1;
    for (const row of rows) {
      const top = (row as HTMLElement).getBoundingClientRect().top;
      if (firstTop < 0) {
        firstTop = top;
        continue;
      }
      const gap = Math.abs(top - firstTop);
      if (gap > 4) {
        lineHeightRef.current = gap;
        return gap;
      }
    }
    // Fallback: computed line-height of the game box.
    const lh = parseFloat(getComputedStyle(game).lineHeight);
    if (Number.isFinite(lh) && lh > 0) {
      lineHeightRef.current = lh;
      return lh;
    }
    return 0;
  }, []);

  // Single unified layout pass: scroll first, then caret — same frame, zero drift.
  useLayoutEffect(() => {
    const game = gameRef.current;
    const wordsEl = wordsRef.current;
    if (!game || !wordsEl || words.length === 0) return;
    const wi = posRef.current.wordIndex;
    const li = posRef.current.letterIndex;

    const lineH = measureLineHeight();
    if (lineH > 0) {
      const wordEl = game.querySelector(`[data-word="${wi}"]`) as HTMLElement | null;
      if (wordEl) {
        // Visual top of the active row inside the game padding box.
        const visualTop =
          wordEl.getBoundingClientRect().top - game.getBoundingClientRect().top;
        const padTop = parseFloat(getComputedStyle(game).paddingTop) || 0;
        const relTop = visualTop - padTop;
        // Keep two lines above visible; push exactly one measured line per overflow.
        const limit = lineH * (VISIBLE_LINES - 1) - lineH * 0.15;
        if (relTop > limit) {
          const linesPast = Math.max(1, Math.round((relTop - limit) / lineH));
          applyOffset(offsetRef.current - linesPast * lineH);
        } else if (relTop < -lineH * 0.15 && offsetRef.current < 0) {
          // Backspaced onto an earlier row: scroll back down one measured line.
          const linesBack = Math.max(1, Math.round(-relTop / lineH));
          applyOffset(offsetRef.current + linesBack * lineH);
        }
      }
    }

    // Caret measured AFTER the transform above, so it can never float detached.
    const letterEl = game.querySelector(`[data-pos="${wi}-${li}"]`);
    const wordEl = game.querySelector(`[data-word="${wi}"]`);
    const target = (letterEl ?? wordEl?.lastElementChild ?? wordEl ?? null) as Element | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return; // not laid out yet
    const top = rect.top - gameRect.top;
    const left = (letterEl ? rect.left : rect.right) - gameRect.left;
    const height = rect.height || lineH || 0;
    setCursor((prev) => {
      if (
        Math.abs(prev.top - top) < 0.5 &&
        Math.abs(prev.left - left) < 0.5 &&
        Math.abs(prev.height - height) < 0.5
      ) {
        return prev; // avoid re-render loops on identical frames
      }
      return { top, left, height };
    });
  }, [words, wordIndex, letterIndex, isFocused, measureLineHeight, applyOffset]);

  // Re-measure on resize / zoom so line math never drifts.
  useEffect(() => {
    const onResize = () => {
      lineHeightRef.current = 0;
      offsetRef.current = 0;
      const el = wordsRef.current;
      if (el) el.style.transform = "translateY(0px)";
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startTimerIfNeeded = useCallback(() => {
    if (timerRef.current !== null) return;
    gameStartRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const start = gameStartRef.current ?? Date.now();
      const sPassed = Math.round((Date.now() - start) / 1000);
      const sLeft = Math.round(durationMs / 1000) - sPassed;
      if (sLeft <= 0) {
        gameOver();
        return;
      }
      setSecondsLeft(sLeft);
    }, 250);
  }, [durationMs, gameOver]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (overRef.current) {
        if (e.shiftKey && e.key === "Enter") {
          e.preventDefault();
          reset();
        }
        return;
      }

      const key = e.key;
      const isLetter = key.length === 1 && key !== " ";
      const isSpace = key === " ";
      const isBackspace = key === "Backspace";

      if (!isLetter && !isSpace && !isBackspace) {
        if (e.shiftKey && key === "Enter") {
          e.preventDefault();
          reset();
        }
        return;
      }
      e.preventDefault();

      const { wordIndex: wi, letterIndex: li } = posRef.current;
      const snapshot = wordsRefState.current;
      const currentWord = snapshot[wi];
      if (!currentWord) return;
      const baseLen = currentWord.filter((l) => !l.extra).length;

      if (isLetter) {
        startTimerIfNeeded();
        if (wi >= snapshot.length) return;
        if (li < baseLen) {
          const expected = currentWord[li].char;
          const status: EngineLetter["status"] = key === expected ? "correct" : "incorrect";
          const next = snapshot.map((word, idx) =>
            idx !== wi
              ? word
              : word.map((letter, j) => (j !== li ? letter : { ...letter, status })),
          );
          wordsRefState.current = next;
          posRef.current = { wordIndex: wi, letterIndex: li + 1 };
          setWords(next);
          setLetterIndex(li + 1);
        } else {
          // Overtype past word end → red extra character.
          const next = snapshot.map((word, idx) =>
            idx !== wi ? word : [...word, { char: key, status: "incorrect", extra: true } as EngineLetter],
          );
          wordsRefState.current = next;
          setWords(next);
        }
        return;
      }

      if (isSpace) {
        if (li === 0) return; // no leading spaces
        if (wi + 1 >= snapshot.length) return;
        posRef.current = { wordIndex: wi + 1, letterIndex: 0 };
        setWordIndex(wi + 1);
        setLetterIndex(0);
        return;
      }

      // Backspace
      const last = currentWord[currentWord.length - 1];
      if (last?.extra) {
        const next = snapshot.map((word, idx) => (idx !== wi ? word : word.slice(0, -1)));
        wordsRefState.current = next;
        setWords(next);
      } else if (li > 0) {
        const prevIndex = li - 1;
        const next = snapshot.map((word, idx) =>
          idx !== wi
            ? word
            : word.map((letter, j) => (j !== prevIndex ? letter : { ...letter, status: "pending" as const })),
        );
        wordsRefState.current = next;
        posRef.current = { wordIndex: wi, letterIndex: prevIndex };
        setWords(next);
        setLetterIndex(prevIndex);
      } else if (wi > 0) {
        const prevWord = snapshot[wi - 1];
        const prevBaseLen = prevWord.filter((l) => !l.extra).length;
        posRef.current = { wordIndex: wi - 1, letterIndex: prevBaseLen };
        setWordIndex(wi - 1);
        setLetterIndex(prevBaseLen);
      }
    },
    [reset, startTimerIfNeeded],
  );

  const focusGame = useCallback(() => gameRef.current?.focus(), []);

  return {
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
  };
}
