import type { ReactNode } from "react";

/** Fases do fluxo da experiencia, na ordem em que acontecem. */
export type GamePhase =
  | "intro"
  | "meeting"
  | "sitting"
  | "dialogue"
  | "memories"
  | "finale";

/**
 * Uma cena e dividida em duas partes: o mundo (elementos Pixi, dentro do canvas) e a
 * interface (DOM, por cima do canvas). O Game monta as duas em um unico palco Pixi
 * que vive durante todo o jogo (criar/destruir Applications entre cenas quebra o render).
 */
export interface SceneParts {
  world: ReactNode;
  overlay: ReactNode;
}

/** Tamanho logico do palco Pixi e escala inteira aplicada na tela. */
export interface StageSize {
  width: number;
  height: number;
  scale: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ObstacleKind = "tree" | "rock" | "bush" | "pond" | "cat" | "bears" | "kuromi" | "spiderman" | "duo" | "flash" | "saiyans" | "pokemon" | "cowboy" | "ninjas" | "knights";

/** Objeto do cenario. (x, y) e o ponto no chao (pes); `hitbox` e a area que bloqueia. */
export interface WorldObstacle {
  kind: ObstacleKind;
  x: number;
  y: number;
  hitbox: Rect;
  /** Tamanho visual (usado pelo lago). */
  width?: number;
  height?: number;
}

/** Algo com que o jogador pode interagir (tecla E) ao chegar perto. */
export interface Interactable {
  id: string;
  /** Posicao dos pes do alvo. */
  position: Vec2;
  /** Distancia (entre os pes) que conta como "perto". */
  distance: number;
}

/** Configuracao do cenario explorado na tela de encontro. */
export interface WorldConfig {
  width: number;
  height: number;
  /** Area onde os pes do personagem podem ficar. */
  bounds: Rect;
  spawn: Vec2;
  /** Onde a Catarina espera. */
  catarina: Vec2;
  /** Ponto (entre os dois) onde o casal senta para olhar o ceu. */
  sitSpot: Vec2;
  /** Distancia (entre os pes) para aparecer "[ E ] ENCONTRAR". */
  interactDistance: number;
  obstacles: readonly WorldObstacle[];
}
