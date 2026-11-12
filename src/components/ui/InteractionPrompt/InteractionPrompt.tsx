import { cx } from "@/lib/utils";

interface InteractionPromptProps {
  label: string;
  onActivate: () => void;
  className?: string;
}

/** Indicacao de interacao, ex.: "[ E ] ENCONTRAR". Tambem funciona por clique/toque. */
export function InteractionPrompt({ label, onActivate, className }: InteractionPromptProps) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className={cx(
        "pixel-box pointer-events-auto cursor-pointer bg-night-900 px-4 py-3 font-pixel text-xs text-gold",
        "motion-safe:animate-[twinkle_1.4s_ease-in-out_infinite]",
        "focus-visible:outline-4 focus-visible:outline-offset-8 focus-visible:outline-lilac",
        className,
      )}
    >
      {label}
    </button>
  );
}
