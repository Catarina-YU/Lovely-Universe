/** Acoes que o mundo do encontro oferece para a interface (ex.: clicar em "[ E ] ENCONTRAR"). */
export interface MeetingControls {
  interact: () => void;
}

/** Alvos de interacao no campo. */
export type InteractableId = "catarina" | "cat";

/** Balao de fala mostrado sobre a tela (coordenadas em pixels da tela, relativas ao palco). */
export interface SpeechBubble {
  x: number;
  y: number;
  text: string;
}
