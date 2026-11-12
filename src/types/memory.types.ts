/** Estado visual/logico de uma estrela interativa. */
export type StarState = "locked" | "available" | "discovered";

/** Posicao normalizada (0..1) dentro da area do ceu. */
export interface NormalizedPoint {
  x: number;
  y: number;
}

/** Uma memoria do casal. Todo conteudo editavel vive em `data/memories.ts`. */
export interface Memory {
  id: string;
  /** Estrela correspondente (ver `data/stars.ts`). */
  starId: string;
  /** Ordem narrativa de descoberta (1 = primeira). */
  order: number;
  title: string;
  text: string;
  /** Caminho de uma imagem em /public (opcional). */
  image?: string;
  /** Data livre, ex.: "12 de marco de 2023" (opcional). */
  date?: string;
}

/** Definicao de uma estrela interativa no ceu. */
export interface StarDefinition extends NormalizedPoint {
  id: string;
  /** Escala relativa do sprite (1 = tamanho padrao). */
  size: number;
}
