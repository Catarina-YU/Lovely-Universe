import type { StarDefinition } from "@/types/types";

/**
 * Posicoes das 6 estrelas interativas dentro de um quadrado imaginario no ceu
 * (0..1 em x e y; o quadrado e dimensionado conforme a tela). Juntas elas formam,
 * sem parecer grade, o coracao da constelacao final. A ordem narrativa fica em `memories.ts`.
 */
export const STARS: readonly StarDefinition[] = [
  { id: "star-1", x: 0.25, y: 0.1, size: 1 }, // lobo esquerdo
  { id: "star-2", x: 0.97, y: 0.45, size: 1.1 }, // lateral direita
  { id: "star-3", x: 0.03, y: 0.45, size: 0.9 }, // lateral esquerda
  { id: "star-4", x: 0.75, y: 0.1, size: 1 }, // lobo direito
  { id: "star-5", x: 0.5, y: 1, size: 1.2 }, // ponta
  { id: "star-6", x: 0.5, y: 0.3, size: 1 }, // centro (vale do coracao)
];

/** Ordem em que as linhas luminosas do coracao conectam as estrelas. */
export const HEART_PATH: readonly string[] = [
  "star-1",
  "star-6",
  "star-4",
  "star-2",
  "star-5",
  "star-3",
  "star-1",
];
