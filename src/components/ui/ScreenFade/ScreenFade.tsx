import { cx } from "@/lib/utils";

interface ScreenFadeProps {
  /** true = tela coberta (preta). */
  covered: boolean;
  durationMs: number;
}

/** Cortina preta usada nas transicoes entre cenas. */
export function ScreenFade({ covered, durationMs }: ScreenFadeProps) {
  return (
    <div
      aria-hidden="true"
      style={{ transitionDuration: `${durationMs}ms` }}
      className={cx(
        "pointer-events-none absolute inset-0 z-50 bg-night-900 transition-opacity ease-in-out",
        covered ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
