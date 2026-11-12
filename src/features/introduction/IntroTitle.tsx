import { PixelButton } from "@/components/ui/PixelButton";
import { INTRO_TEXT } from "@/data/dialogues";

interface IntroTitleProps {
  onStart: () => void;
}

/** Titulo, frase romantica e botao de inicio (camada DOM sobre o canvas). */
export function IntroTitle({ onStart }: IntroTitleProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
      <h1
        className="font-pixel leading-relaxed text-gold [text-shadow:4px_4px_0_var(--purple)]"
        style={{ fontSize: "clamp(1.1rem, 5.4vw, 2.8rem)" }}
      >
        {INTRO_TEXT.title}
      </h1>
      <p className="max-w-md text-2xl leading-tight text-paper sm:text-3xl">{INTRO_TEXT.tagline}</p>
      <PixelButton onClick={onStart} className="mt-4">
        {INTRO_TEXT.start}
      </PixelButton>
    </div>
  );
}
