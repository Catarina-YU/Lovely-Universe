/** Resolucao logica do jogo (pixel art escalada com nearest-neighbor). */
export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;

/** Tamanho de um quadro de personagem no spritesheet. */
export const FRAME_WIDTH = 32;
export const FRAME_HEIGHT = 48;

/** Chave do progresso salvo no navegador. */
export const STORAGE_KEY = "nosso-universo:progress:v1";

/** Paleta do jogo (espelhada em globals.css). */
export const COLORS = {
  night900: 0x0b1033,
  night800: 0x141a4a,
  night700: 0x1f2260,
  purple: 0x4b3a9a,
  lilac: 0xb79ae6,
  blue: 0x4f7fd1,
  gold: 0xf5d98b,
} as const;
