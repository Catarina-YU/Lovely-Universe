import { DialogueBox } from "@/components/ui/DialogueBox";
import { MemoryCard } from "@/components/ui/MemoryCard";
import { PixelButton } from "@/components/ui/PixelButton";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { CHOOSE_STAR_TEXT, FINALE_TEXT, MEMORY_TEXT, STARGAZING_DIALOGUE } from "@/data/dialogues";
import type { GamePhase, Memory } from "@/types/types";

interface UniverseOverlayProps {
  phase: GamePhase;
  progress: { found: number; total: number };
  /** Memoria aberta no cartao (null = nenhuma). */
  openMemory: Memory | null;
  /** Se a memoria aberta ja tinha sido descoberta, o botao so fecha. */
  isReview: boolean;
  /** Aviso de estrela bloqueada (null = nenhum). */
  toast: string | null;
  onContinueMemory: () => void;
  onDialogueDone: () => void;
  /** REVIVER NOSSO UNIVERSO: volta para as memorias, com as estrelas apagadas de novo. */
  onReplay: () => void;
}

const INTRO_LINES = [...STARGAZING_DIALOGUE, CHOOSE_STAR_TEXT];

/** Interface (DOM) das telas com o casal sentado. O casal fica sempre livre na parte de baixo. */
export function UniverseOverlay({
  phase,
  progress,
  openMemory,
  isReview,
  toast,
  onContinueMemory,
  onDialogueDone,
  onReplay,
}: UniverseOverlayProps) {
  return (
    <div className="pointer-events-none relative h-full w-full">
      {phase === "dialogue" && (
        <div className="pointer-events-auto absolute inset-x-0 top-10 mx-auto w-[min(92vw,44rem)]">
          <DialogueBox lines={INTRO_LINES} onComplete={onDialogueDone} />
        </div>
      )}

      {phase === "memories" && (
        <>
          <ProgressIndicator found={progress.found} total={progress.total} className="absolute left-4 top-4" />
          {openMemory ? (
            <div className="pointer-events-auto absolute inset-x-0 top-8 flex justify-center">
              <MemoryCard
                memory={openMemory}
                onContinue={onContinueMemory}
                continueLabel={isReview ? MEMORY_TEXT.close : MEMORY_TEXT.continue}
              />
            </div>
          ) : (
            <div className="absolute inset-x-0 top-4 flex justify-center px-4">
              {toast ? (
                <p role="status" className="pixel-box max-w-md px-4 py-3 text-center text-[26px] leading-tight">
                  {toast}
                </p>
              ) : (
                progress.found === 0 && (
                  <p className="bg-night-900/70 px-3 py-2 text-xl text-paper">{MEMORY_TEXT.hint}</p>
                )
              )}
            </div>
          )}
        </>
      )}

      {phase === "finale" && (
        <>
          {/* A mensagem e o botao surgem depois que a constelacao termina de se desenhar. */}
          <p className="pixel-box finale-reveal absolute inset-x-0 top-3 mx-auto w-[min(92vw,44rem)] px-4 py-3 text-center text-[24px] leading-snug text-gold">
            {FINALE_TEXT.message}
          </p>
          <div className="finale-reveal pointer-events-auto absolute bottom-6 right-6">
            <PixelButton onClick={onReplay} className="max-w-[13rem] text-xs">{FINALE_TEXT.replay}</PixelButton>
          </div>
        </>
      )}
    </div>
  );
}
