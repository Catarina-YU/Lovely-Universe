"use client";

import { useState } from "react";
import { playSfx } from "@/core/audio/audioEngine";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTypewriter } from "@/hooks/useTypewriter";
import { cx } from "@/lib/utils";

interface DialogueBoxProps {
  lines: readonly string[];
  /** Nome de quem fala (opcional). */
  speaker?: string;
  /** Chamado ao avancar depois da ultima fala. */
  onComplete: () => void;
  className?: string;
}

/**
 * Caixa de dialogo estilo RPG: texto progressivo, avanca por clique, toque,
 * Enter ou Espaco. O primeiro clique completa a fala; o seguinte avanca.
 */
export function DialogueBox({ lines, speaker, onComplete, className }: DialogueBoxProps) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const line = lines[index] ?? "";
  const { visibleText, isDone, complete } = useTypewriter(line, 32, reduced);

  const advance = () => {
    playSfx("click");
    if (!isDone) return complete();
    if (index < lines.length - 1) setIndex(index + 1);
    else onComplete();
  };

  return (
    <button
      type="button"
      onClick={advance}
      className={cx(
        "pixel-box pointer-events-auto relative block w-full cursor-pointer px-5 pb-7 pt-5 text-left text-[26px] leading-tight",
        "focus-visible:outline-4 focus-visible:outline-offset-8 focus-visible:outline-lilac",
        className,
      )}
    >
      {speaker && (
        <span className="mb-2 block font-pixel text-xs text-gold">{speaker}</span>
      )}
      {/* Texto completo para leitores de tela; o visivel e digitado aos poucos. */}
      <span className="sr-only">{line}</span>
      <span aria-hidden="true" className="block min-h-[2.4em]">
        {visibleText}
      </span>
      {isDone && (
        <span
          aria-hidden="true"
          className="absolute bottom-2 right-4 text-gold motion-safe:animate-[blink_1s_steps(1)_infinite]"
        >
          ▼
        </span>
      )}
    </button>
  );
}
