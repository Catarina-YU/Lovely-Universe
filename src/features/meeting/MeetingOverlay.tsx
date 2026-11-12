import { InteractionPrompt } from "@/components/ui/InteractionPrompt";
import { MEETING_TEXT } from "@/data/dialogues";
import type { InteractableId, SpeechBubble } from "./meeting.types";

interface MeetingOverlayProps {
  /** Alvo ao alcance (null = nenhum). */
  nearId: InteractableId | null;
  hasMoved: boolean;
  /** Balao de fala aberto (null = nenhum). */
  bubble: SpeechBubble | null;
  onInteract: () => void;
}

const PROMPT_LABEL: Record<InteractableId, string> = {
  catarina: MEETING_TEXT.prompt,
  cat: MEETING_TEXT.interact,
};

/** Interface sobre o canvas: dica de controles, aviso de interacao e balao de fala. */
export function MeetingOverlay({ nearId, hasMoved, bubble, onInteract }: MeetingOverlayProps) {
  return (
    <div className="pointer-events-none relative h-full w-full">
      <div className="absolute inset-x-0 top-4 flex justify-center px-4">
        {nearId ? (
          <InteractionPrompt label={PROMPT_LABEL[nearId]} onActivate={onInteract} className="pointer-events-auto" />
        ) : (
          !hasMoved && !bubble && <p className="bg-night-900/80 px-3 py-2 text-xl text-paper">{MEETING_TEXT.hintDesktop}</p>
        )}
      </div>

      {bubble && (
        <div
          role="status"
          className="absolute w-max max-w-[min(80vw,22rem)] -translate-x-1/2 -translate-y-full"
          style={{ left: `min(max(${bubble.x}px, 11rem), calc(100% - 11rem))`, top: Math.max(bubble.y, 80) }}
        >
          <p className="pixel-box px-4 py-3 text-center text-[24px] leading-snug">{bubble.text}</p>
          {/* ponta do balao */}
          <span aria-hidden="true" className="mx-auto mt-3 block h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-paper" />
        </div>
      )}
    </div>
  );
}
