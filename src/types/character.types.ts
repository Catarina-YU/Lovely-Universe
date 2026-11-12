export type CharacterId = "pedro" | "catarina";

export type Direction = "down" | "left" | "right" | "up";

export type AnimationName =
  | `idle-${Direction}`
  | `walk-${Direction}`
  | "sit-back";

export interface AnimationDefinition {
  /** Linha do spritesheet. */
  row: number;
  frames: number;
  fps: number;
}

/** Formato do arquivo gerado por `tools/sprites/generate.mjs`. */
export interface SpriteManifest {
  frameWidth: number;
  frameHeight: number;
  columns: number;
  animations: Record<AnimationName, AnimationDefinition>;
}

/** Controle imperativo de um personagem Pixi (evita re-render do React a cada quadro). */
export interface CharacterHandle {
  setPosition: (x: number, y: number) => void;
  play: (animation: AnimationName) => void;
}

export interface CharacterConfig {
  id: CharacterId;
  /** Nome exibido nos dialogos. */
  name: string;
  /** Caminho do spritesheet em /public. */
  sheet: string;
}
