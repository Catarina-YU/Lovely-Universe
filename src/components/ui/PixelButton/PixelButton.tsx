import type { ButtonHTMLAttributes } from "react";
import { playSfx } from "@/core/audio/audioEngine";
import { cx } from "@/lib/utils";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const VARIANTS = {
  primary: "bg-gold text-ink",
  secondary: "bg-night-700 text-paper",
} as const;

/** Botao retro reutilizavel, com borda pixelada e area de toque confortavel. */
export function PixelButton({
  variant = "primary",
  className,
  type = "button",
  onClick,
  ...rest
}: PixelButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "pixel-box pointer-events-auto min-h-12 cursor-pointer px-5 py-3 font-pixel text-sm leading-snug tracking-wide",
        "transition-transform hover:brightness-110 active:translate-y-1",
        "focus-visible:outline-4 focus-visible:outline-offset-8 focus-visible:outline-lilac",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      onClick={(event) => {
        playSfx("click");
        onClick?.(event);
      }}
      {...rest}
    />
  );
}
