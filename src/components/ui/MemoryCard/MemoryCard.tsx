import { MEMORY_TEXT } from "@/data/dialogues";
import type { Memory } from "@/types/types";
import { PixelButton } from "../PixelButton";

interface MemoryCardProps {
  memory: Memory;
  onContinue: () => void;
  /** Texto do botao (padrao: CONTINUAR). */
  continueLabel?: string;
}

/** Janela de memoria: titulo, texto, data e imagem opcionais. */
export function MemoryCard({ memory, onContinue, continueLabel = MEMORY_TEXT.continue }: MemoryCardProps) {
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={`memory-title-${memory.id}`}
      className="pixel-box pointer-events-auto flex max-h-[58dvh] w-[min(92vw,36rem)] flex-col gap-2 overflow-y-auto p-4"
    >
      {memory.date && <p className="font-pixel text-xs text-lilac">{memory.date}</p>}
      <h2 id={`memory-title-${memory.id}`} className="font-pixel text-sm leading-relaxed text-gold">
        {memory.title}
      </h2>
      {memory.image && (
        // eslint-disable-next-line @next/next/no-img-element -- fotos do usuario, tamanho desconhecido
        <img
          src={memory.image}
          alt={memory.title}
          className="max-h-48 w-full border-4 border-paper object-cover"
        />
      )}
      <p className="text-[24px] leading-snug">{memory.text}</p>
      <PixelButton onClick={onContinue} className="mt-1 min-h-10 self-end py-2">
        {continueLabel}
      </PixelButton>
    </section>
  );
}
