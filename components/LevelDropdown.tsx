"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ENGLISH_LEVELS, LEVEL_META, type EnglishLevel } from "@/lib/words";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={open ? "ff-level-chevron-open" : ""}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

export function LevelDropdown({
  value,
  onChange,
}: {
  value: EnglishLevel;
  onChange: (level: EnglishLevel) => void;
}) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(() => ENGLISH_LEVELS.indexOf(value));
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const choose = (level: EnglishLevel) => {
    setOpen(false);
    buttonRef.current?.focus();
    if (level !== value) onChange(level);
  };

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFocusIndex(ENGLISH_LEVELS.indexOf(value));
      setOpen(true);
    }
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      setFocusIndex((i) => (i + dir + ENGLISH_LEVELS.length) % ENGLISH_LEVELS.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(ENGLISH_LEVELS[focusIndex]);
    }
  };

  return (
    <div className="ff-level" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="ff-level-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setFocusIndex(ENGLISH_LEVELS.indexOf(value));
          setOpen((o) => !o);
        }}
        onKeyDown={onButtonKey}
      >
        <span className="ff-level-icon" aria-hidden="true">
          <LayersIcon />
        </span>
        <span className="ff-level-value">{LEVEL_META[value].label}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="English difficulty level"
          aria-activedescendant={`ff-level-opt-${ENGLISH_LEVELS[focusIndex]}`}
          className="ff-level-menu"
          onKeyDown={onListKey}
        >
          {ENGLISH_LEVELS.map((l, i) => {
            const active = l === value;
            const focused = i === focusIndex;
            return (
              <li key={l} role="presentation">
                <button
                  id={`ff-level-opt-${l}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`ff-level-option${active ? " is-active" : ""}${focused ? " is-focused" : ""}`}
                  onClick={() => choose(l)}
                  onMouseEnter={() => setFocusIndex(i)}
                >
                  <span className="ff-level-badge" aria-hidden="true">
                    {l}
                  </span>
                  <span className="ff-level-text">
                    <span className="ff-level-name">{LEVEL_META[l].label}</span>
                    <span className="ff-level-hint">{LEVEL_META[l].blurb}</span>
                  </span>
                  <span className="ff-level-check" aria-hidden="true">
                    {active && <CheckIcon />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
