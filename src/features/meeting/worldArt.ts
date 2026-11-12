import type { Graphics } from "pixi.js";
import { fillPixelEllipse, fillPixels, linePixels } from "@/lib/pixelDraw";
import { createSeededRandom } from "@/lib/utils";
import type { WorldConfig, WorldObstacle } from "@/types/types";

const GROUND = 0x28505c;
const GROUND_DEEP = 0x1f4150;
const GROUND_EDGE = 0x3f7a73;
const TUFT_LIGHT = 0x3a7570;
const TUFT_DARK = 0x1b3a47;
const FLOWER_COLORS = [0xf5d98b, 0xb79ae6, 0xffffff] as const;

/** Extra desenhado abaixo/ao lado do mundo para telas mais altas que o cenario. */
const OVERDRAW = 600;

/** Colinas distantes, chao de grama, tufos e flores. Coordenadas de mundo. */
export function drawGround(g: Graphics, world: WorldConfig): void {
  g.clear();
  const { width, height } = world;

  // colinas ao fundo (duas camadas)
  for (const { color, base, a1, a2 } of [
    { color: 0x161a4a, base: 82, a1: 9, a2: 3 },
    { color: 0x1b2160, base: 96, a1: 6, a2: 2 },
  ]) {
    for (let x = 0; x < width; x++) {
      const y = Math.round(base + Math.sin(x * 0.021) * a1 + Math.sin(x * 0.07 + 2) * a2);
      g.rect(x, y, 1, 80);
    }
    g.fill(color);
  }

  // grama
  const top = (x: number) => Math.round(112 + Math.sin(x * 0.03 + 1) * 5);
  for (let x = 0; x < width; x++) g.rect(x, top(x), 1, height + OVERDRAW - top(x));
  g.fill(GROUND);
  g.rect(0, 218, width, height + OVERDRAW - 218).fill(GROUND_DEEP);
  const edge: Array<[number, number]> = [];
  for (let x = 0; x < width; x++) edge.push([x, top(x)]);
  fillPixels(g, edge, GROUND_EDGE);

  // tufos
  const rnd = createSeededRandom(5);
  const light: Array<[number, number]> = [];
  const dark: Array<[number, number]> = [];
  for (let i = 0; i < 260; i++) {
    const x = Math.floor(rnd() * (width - 2)) + 1;
    const y = Math.floor(120 + rnd() * (height - 120));
    const bucket = rnd() < 0.7 ? light : dark;
    bucket.push([x, y], [x, y - 1]);
    if (rnd() < 0.4) bucket.push([x + 1, y - 1]);
  }
  fillPixels(g, dark, TUFT_DARK);
  fillPixels(g, light, TUFT_LIGHT);

  // flores
  for (let i = 0; i < 22; i++) {
    const x = Math.floor(rnd() * (width - 8)) + 4;
    const y = Math.floor(130 + rnd() * (height - 140));
    const color = FLOWER_COLORS[Math.floor(rnd() * FLOWER_COLORS.length)];
    fillPixels(g, [[x, y], [x - 1, y - 1], [x + 1, y - 1], [x, y - 2], [x, y - 1]], color);
    fillPixels(g, [[x, y - 1]], 0xf5d98b);
  }
}

function drawTree(g: Graphics): void {
  g.rect(-2, -11, 4, 11).fill(0x4a3426);
  g.rect(1, -11, 1, 11).fill(0x362317);
  fillPixelEllipse(g, 0, -27, 14, 13, 0x174a3e);
  fillPixelEllipse(g, -2, -29, 10, 10, 0x1f6050);
  fillPixelEllipse(g, -5, -33, 4, 3, 0x2f8a68);
  fillPixels(g, [[6, -24], [7, -22], [4, -20], [-8, -22]], 0x2f8a68);
  fillPixels(g, [[-3, -36], [2, -20]], 0xf5d98b);
}

function drawRock(g: Graphics): void {
  fillPixelEllipse(g, 0, -4, 8, 5, 0x4a4f7a);
  fillPixelEllipse(g, -1, -5, 6, 3, 0x5a5f8a);
  g.rect(-4, -7, 4, 1).fill(0x7d82b0);
  g.rect(2, -2, 5, 1).fill(0x363a62);
}

function drawBush(g: Graphics): void {
  fillPixelEllipse(g, 0, -5, 8, 5, 0x174a3e);
  fillPixelEllipse(g, -1, -6, 6, 3, 0x1f6050);
  fillPixels(g, [[-3, -8], [2, -7], [4, -5]], 0x2f8a68);
  fillPixels(g, [[-4, -4], [3, -3]], 0xb79ae6);
}

function drawPond(g: Graphics, width: number, height: number): void {
  const rx = width / 2;
  const ry = height / 2;
  fillPixelEllipse(g, 0, 0, rx + 2, ry + 1, 0x1b2a6b);
  fillPixelEllipse(g, 0, 0, rx, ry, 0x2a4f9a);
  fillPixelEllipse(g, 0, 1, rx - 6, ry - 3, 0x2f5fb0);
  g.rect(-12, -3, 8, 1).fill(0x4f7fd1);
  g.rect(6, 2, 10, 1).fill(0x4f7fd1);
  fillPixels(g, [[-4, 0], [10, -4], [-14, 3]], 0xf5d98b);
}

const CAT_GRAY = 0x9a9ca6;
const CAT_STRIPE = 0x4a4c58;
const CAT_LIGHT = 0xdadce2;
const CAT_EYE = 0xf5d04a;

/**
 * Gata cinza listrada de olhos verdes, deitada e olhando para a direita (o lago).
 * `breathe` levanta as costas 1 pixel (respiracao). Origem: chao, embaixo do corpo.
 */
export function drawCat(g: Graphics, breathe: boolean): void {
  g.clear();
  fillPixelEllipse(g, 0, -1, 12, 2, 0x050818, 0.3); // sombra
  // cauda enrolada atras
  fillPixels(g, [[-10, -2], [-11, -2], [-12, -3], [-12, -4], [-11, -5]], CAT_GRAY);
  fillPixels(g, [[-12, -3], [-11, -5]], CAT_STRIPE);
  // corpo
  fillPixelEllipse(g, -1, -4, 9, breathe ? 4 : 3, CAT_GRAY);
  fillPixels(g, [[-6, -7], [-3, -7], [0, -7], [3, -7], [-5, -6], [-2, -6], [1, -6], [4, -6]].map(([x, y]) => [x, y + (breathe ? 0 : 1)] as [number, number]), CAT_STRIPE);
  fillPixels(g, [[-7, -3], [-4, -3], [-1, -3], [2, -3]], CAT_STRIPE);
  // patinhas claras
  fillPixels(g, [[6, -1], [7, -1], [8, -1], [9, -1], [10, -1], [11, -1]], CAT_LIGHT);
  // cabeca
  fillPixelEllipse(g, 8, -5, 5, 4, CAT_GRAY);
  fillPixels(g, [[5, -9], [6, -9], [5, -10], [10, -9], [11, -9], [11, -10]], CAT_GRAY);
  fillPixels(g, [[6, -9], [10, -9]], 0xe8a0a0);
  fillPixels(g, [[7, -8], [8, -8], [9, -8]], CAT_STRIPE); // listras da testa
  fillPixels(g, [[7, -6], [11, -6]], CAT_EYE);
  fillPixels(g, [[7, -5], [8, -5], [9, -5], [10, -5], [11, -4], [8, -4], [9, -4], [10, -4]], CAT_LIGHT); // focinho e peito claros
  fillPixels(g, [[9, -5]], 0xe8a0a0); // nariz
}

const BEAR_OUTLINE = 0x4a2a22;

/** Elipse com contorno escuro de 1 pixel. */
function outlinedEllipse(
  g: Graphics,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: number,
  outline: number = BEAR_OUTLINE,
): void {
  fillPixelEllipse(g, cx, cy, rx + 1, ry + 1, outline);
  fillPixelEllipse(g, cx, cy, rx, ry, fill);
}

/**
 * Dois ursinhos fofos de maos dadas: o marrom (esquerda) e o panda (direita).
 * Origem: chao, no meio entre os dois.
 */
function drawBears(g: Graphics): void {
  fillPixelEllipse(g, 0, -1, 16, 2, 0x050818, 0.3); // sombra

  const BROWN = 0xd9a58a;
  const BROWN_DARK = 0x9c6a52;
  const WHITE = 0xfdfdfd;
  const CHEEK_ORANGE = 0xf7c58a;
  const CHEEK_PINK = 0xf8b4b4;

  // pes
  outlinedEllipse(g, -11, -2, 2, 1, BROWN);
  outlinedEllipse(g, -5, -2, 2, 1, BROWN);
  outlinedEllipse(g, 5, -2, 2, 1, BEAR_OUTLINE);
  outlinedEllipse(g, 11, -2, 2, 1, BEAR_OUTLINE);
  // corpos
  outlinedEllipse(g, -8, -6, 4, 4, BROWN);
  outlinedEllipse(g, 8, -6, 4, 4, WHITE);
  // bracinhos: os do meio se encontram (maos dadas)
  outlinedEllipse(g, -2, -7, 2, 1, BROWN);
  outlinedEllipse(g, 2, -7, 2, 1, WHITE);
  outlinedEllipse(g, -13, -7, 1, 2, BROWN);
  outlinedEllipse(g, 13, -7, 1, 2, WHITE);
  // orelhas
  outlinedEllipse(g, -14, -17, 2, 2, BROWN);
  outlinedEllipse(g, -2, -17, 2, 2, BROWN);
  fillPixels(g, [[-14, -17], [-2, -17]], BROWN_DARK);
  outlinedEllipse(g, 2, -17, 2, 2, BEAR_OUTLINE);
  outlinedEllipse(g, 14, -17, 2, 2, BEAR_OUTLINE);
  // cabecas
  outlinedEllipse(g, -8, -12, 7, 5, BROWN);
  outlinedEllipse(g, 8, -12, 7, 5, WHITE);
  // rostos
  fillPixels(g, [[-11, -12], [-5, -12], [5, -12], [11, -12]], BEAR_OUTLINE);
  fillPixels(g, [[-8, -10], [8, -10]], 0xf0707a); // bocas
  fillPixels(g, [[-13, -11], [-12, -11], [-4, -11], [-3, -11]], CHEEK_ORANGE);
  fillPixels(g, [[3, -11], [4, -11], [12, -11], [13, -11]], CHEEK_PINK);
}

const KUROMI_OUTLINE = 0x24242e;
const KUROMI_HOOD = 0x4b4b57;
const KUROMI_PINK = 0xf4a0c4;

/** Orelha do capuz (triangulo alto com bolinha na ponta). `side` = -1 esquerda, 1 direita. */
function kuromiEar(g: Graphics, side: -1 | 1): void {
  const rows: ReadonlyArray<readonly [number, number, number]> = [
    [-18, 3, 8],
    [-19, 4, 8],
    [-20, 5, 9],
    [-21, 6, 9],
    [-22, 7, 9],
    [-23, 8, 10],
  ];
  const span = (x1: number, x2: number): [number, number] => (side < 0 ? [-x2, -x1] : [x1, x2]);
  for (const [y, x1, x2] of rows) {
    const [a, b] = span(x1, x2);
    g.rect(a - 1, y - 1, b - a + 3, 3);
  }
  g.fill(KUROMI_OUTLINE);
  for (const [y, x1, x2] of rows) {
    const [a, b] = span(x1, x2);
    g.rect(a, y, b - a + 1, 1);
  }
  g.fill(KUROMI_HOOD);
  fillPixelEllipse(g, side * 10, -25, 1, 1, KUROMI_OUTLINE); // bolinha na ponta
}

/**
 * Kuromi: capuz preto com orelhas pontudas e caveirinha rosa, rosto branco,
 * gola com bolinhas rosa e rabinho de diabinho. Origem: chao, embaixo dela.
 */
function drawKuromi(g: Graphics): void {
  fillPixelEllipse(g, 0, -1, 9, 2, 0x050818, 0.3); // sombra
  // rabinho
  fillPixels(g, [[6, -3], [7, -3], [8, -4], [8, -5], [9, -6], [10, -6], [9, -7]], KUROMI_OUTLINE);
  // orelhas
  kuromiEar(g, -1);
  kuromiEar(g, 1);
  // corpo, bracinhos e pes (brancos)
  outlinedEllipse(g, 0, -4, 4, 3, 0xfdfdfd, KUROMI_OUTLINE);
  outlinedEllipse(g, -6, -5, 1, 2, 0xfdfdfd, KUROMI_OUTLINE);
  outlinedEllipse(g, 6, -5, 1, 2, 0xfdfdfd, KUROMI_OUTLINE);
  outlinedEllipse(g, -2, -1, 1, 1, 0xfdfdfd, KUROMI_OUTLINE);
  outlinedEllipse(g, 2, -1, 1, 1, 0xfdfdfd, KUROMI_OUTLINE);
  // gola escura com bolinhas rosa
  g.rect(-6, -9, 13, 2).fill(KUROMI_OUTLINE);
  g.rect(-5, -9, 11, 1).fill(KUROMI_HOOD);
  fillPixels(g, [[-5, -8], [-2, -7], [2, -7], [5, -8]], KUROMI_OUTLINE);
  fillPixels(g, [[-6, -7], [6, -7], [0, -6]], KUROMI_PINK);
  // capuz e rosto
  outlinedEllipse(g, 0, -13, 8, 6, KUROMI_HOOD, KUROMI_OUTLINE);
  fillPixelEllipse(g, 0, -12, 6, 4, 0xfdfdfd);
  // caveirinha rosa no capuz
  fillPixels(g, [[-1, -19], [0, -19], [1, -19], [-1, -18], [0, -18], [1, -18], [0, -17]], KUROMI_PINK);
  fillPixels(g, [[-1, -18], [1, -18]], KUROMI_OUTLINE);
  // olhos com cilios, nariz e sorrisinho
  fillPixels(g, [[-3, -13], [-3, -12], [3, -13], [3, -12]], KUROMI_OUTLINE);
  fillPixels(g, [[-4, -14], [4, -14]], KUROMI_OUTLINE);
  fillPixels(g, [[0, -11]], KUROMI_PINK);
  fillPixels(g, [[-1, -9], [0, -9], [1, -10]], 0x7a3a58);
}

const SPIDEY_OUTLINE = 0x1a0f14;
const SPIDEY_RED = 0xd8262e;
const SPIDEY_BLUE = 0x1f3b8a;
const SPIDEY_WEB = 0x8a1219;

function outlinedRect(g: Graphics, x: number, y: number, w: number, h: number, fill: number, outline: number): void {
  g.rect(x - 1, y - 1, w + 2, h + 2).fill(outline);
  g.rect(x, y, w, h).fill(fill);
}

/**
 * Homem-Aranha de pe, com um braco levantado fazendo o gesto de lancar teia.
 * Origem: chao, embaixo dele.
 */
function drawSpiderman(g: Graphics): void {
  fillPixelEllipse(g, 0, -1, 8, 2, 0x050818, 0.3); // sombra
  // pernas (azuis) e botas (vermelhas)
  outlinedRect(g, -4, -10, 3, 7, SPIDEY_BLUE, SPIDEY_OUTLINE);
  outlinedRect(g, 1, -10, 3, 7, SPIDEY_BLUE, SPIDEY_OUTLINE);
  outlinedRect(g, -4, -4, 3, 3, SPIDEY_RED, SPIDEY_OUTLINE);
  outlinedRect(g, 1, -4, 3, 3, SPIDEY_RED, SPIDEY_OUTLINE);
  // tronco: peito vermelho, barriga azul
  outlinedRect(g, -5, -19, 11, 10, SPIDEY_RED, SPIDEY_OUTLINE);
  g.rect(-3, -12, 7, 3).fill(SPIDEY_BLUE);
  fillPixels(g, [[0, -17], [-1, -16], [1, -16], [0, -15]], SPIDEY_OUTLINE); // aranha no peito
  // braco esquerdo (para baixo)
  outlinedRect(g, -8, -19, 3, 8, SPIDEY_RED, SPIDEY_OUTLINE);
  // braco direito levantado, com o gesto de teia
  const arm = linePixels(6, -17, 10, -24);
  const armBody = arm.flatMap(([x, y]) => [[x, y], [x + 1, y]] as Array<[number, number]>);
  const ring = new Set<string>();
  const ringPixels: Array<[number, number]> = [];
  for (const [x, y] of armBody) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = (x + dx) + "," + (y + dy);
        if (!ring.has(key)) {
          ring.add(key);
          ringPixels.push([x + dx, y + dy]);
        }
      }
    }
  }
  fillPixels(g, ringPixels, SPIDEY_OUTLINE);
  fillPixels(g, armBody, SPIDEY_RED);
  outlinedRect(g, 9, -28, 4, 4, SPIDEY_RED, SPIDEY_OUTLINE);
  fillPixels(g, [[9, -30], [12, -30], [9, -29], [12, -29]], SPIDEY_OUTLINE);
  fillPixels(g, [[9, -29], [12, -29]], SPIDEY_RED); // dedos do gesto (indicador e minimo)
  // cabeca com mascara
  outlinedEllipse(g, 0, -24, 5, 5, SPIDEY_RED, SPIDEY_OUTLINE);
  fillPixels(g, [[0, -28], [0, -27], [0, -26], [0, -22], [0, -21], [-3, -26], [3, -26], [-4, -22], [4, -22]], SPIDEY_WEB);
  // olhos grandes, brancos com contorno preto, inclinados
  fillPixels(g, [[-5, -26], [-4, -26], [-3, -26], [-2, -25], [-5, -25], [-1, -25], [1, -25], [2, -25], [3, -26], [4, -26], [5, -26]], SPIDEY_OUTLINE);
  fillPixels(g, [[-4, -25], [-3, -25], [-2, -24], [-3, -24], [4, -25], [3, -25], [2, -24], [3, -24]], 0xffffff);
}

const DUO_OUTLINE = 0x14141c;

/** Leon (jaqueta de couro marrom com gola de la, cabelo castanho, pistola na mao). ox = deslocamento em x. */
function drawLeon(g: Graphics, ox: number): void {
  const SKIN = 0xe8bf9f;
  const HAIR = 0x6b5236;
  const JACKET = 0x4a2c26;
  const TAN = 0xc9a06a;
  const PANTS = 0x22232b;
  // pernas e botas
  outlinedRect(g, ox - 4, -12, 3, 9, PANTS, DUO_OUTLINE);
  outlinedRect(g, ox + 1, -12, 3, 9, PANTS, DUO_OUTLINE);
  outlinedRect(g, ox - 5, -4, 4, 3, 0x3a3a40, DUO_OUTLINE);
  outlinedRect(g, ox + 1, -4, 4, 3, 0x3a3a40, DUO_OUTLINE);
  // jaqueta e camisa azul-marinho
  outlinedRect(g, ox - 6, -24, 13, 12, JACKET, DUO_OUTLINE);
  g.rect(ox - 1, -24, 3, 7).fill(0x1a2238);
  g.rect(ox - 6, -25, 4, 3).fill(TAN);
  g.rect(ox + 3, -25, 4, 3).fill(TAN);
  g.rect(ox - 5, -13, 11, 1).fill(0x101018); // cinto
  // bracos com punhos de la e luvas
  for (const sx of [-9, 7]) {
    outlinedRect(g, ox + sx, -23, 3, 9, JACKET, DUO_OUTLINE);
    g.rect(ox + sx, -16, 3, 2).fill(TAN);
    g.rect(ox + sx, -14, 3, 2).fill(0x14141c);
  }
  // pistola na mao esquerda (do lado de quem olha)
  fillPixels(g, [[ox - 11, -17], [ox - 11, -16], [ox - 11, -15], [ox - 10, -17], [ox - 10, -18]], 0xaab0ba);
  // cabeca
  outlinedEllipse(g, ox, -29, 5, 5, SKIN, DUO_OUTLINE);
  fillPixelEllipse(g, ox, -31, 5, 3, HAIR);
  fillPixels(g, [[ox - 5, -30], [ox - 5, -29], [ox + 5, -30], [ox - 3, -28], [ox - 2, -28], [ox + 2, -28], [ox + 3, -28]], HAIR);
  fillPixels(g, [[ox - 2, -27], [ox + 2, -27]], DUO_OUTLINE);
  fillPixels(g, [[ox, -25]], 0xb98a72);
}

/** Ada (vestido vermelho justo com arnes preto, cabelo curto preto, botas longas e pistola na coxa). */
function drawAda(g: Graphics, ox: number): void {
  const SKIN = 0xf0cdb0;
  const HAIR = 0x14141a;
  const RED = 0x9e1b33;
  const BLACK = 0x1a1a20;
  // botas longas pretas
  outlinedRect(g, ox - 4, -14, 3, 12, BLACK, DUO_OUTLINE);
  outlinedRect(g, ox + 1, -14, 3, 12, BLACK, DUO_OUTLINE);
  fillPixels(g, [[ox - 3, -1], [ox + 3, -1]], DUO_OUTLINE); // saltos
  // vestido, gola alta e arnes
  outlinedRect(g, ox - 5, -26, 11, 12, RED, DUO_OUTLINE);
  g.rect(ox - 1, -28, 3, 2).fill(RED);
  fillPixels(g, linePixels(ox - 4, -26, ox + 1, -20), BLACK);
  g.rect(ox - 5, -17, 11, 1).fill(BLACK); // cinto
  // bracos (mangas vermelhas) e luvas pretas
  for (const sx of [-8, 6]) {
    outlinedRect(g, ox + sx, -25, 3, 9, RED, DUO_OUTLINE);
    g.rect(ox + sx, -16, 3, 3).fill(BLACK);
  }
  // pistola no coldre da coxa
  outlinedRect(g, ox + 4, -13, 3, 4, 0x2a2a32, DUO_OUTLINE);
  fillPixels(g, [[ox + 7, -13], [ox + 7, -14]], 0x9a8a78);
  // cabeca com cabelo curto
  outlinedEllipse(g, ox, -31, 5, 5, SKIN, DUO_OUTLINE);
  fillPixelEllipse(g, ox, -33, 6, 4, HAIR);
  g.rect(ox - 6, -33, 2, 6).fill(HAIR);
  g.rect(ox + 5, -33, 2, 5).fill(HAIR);
  fillPixels(g, [[ox - 3, -30], [ox - 2, -30], [ox - 1, -30]], HAIR); // franja de lado
  fillPixels(g, [[ox - 2, -29], [ox + 2, -29]], DUO_OUTLINE);
  fillPixels(g, [[ox, -27]], 0xc02a40);
}

/** Leon e Ada lado a lado. Origem: chao, entre os dois. */
function drawDuo(g: Graphics): void {
  fillPixelEllipse(g, 0, -1, 17, 2, 0x050818, 0.3); // sombra
  drawLeon(g, -9);
  drawAda(g, 9);
}

const FLASH_RED = 0xc4161f;
const FLASH_RED_DARK = 0x8f0f18;
const FLASH_GOLD = 0xf0b030;
const FLASH_OUTLINE = 0x2a0a0c;

/**
 * O Flash: uniforme vermelho, botas e raio dourados, mascara com raios nas laterais.
 * Em pe, de bracos fechados ao lado do corpo. Origem: chao, embaixo dele.
 */
function drawFlash(g: Graphics): void {
  fillPixelEllipse(g, 0, -1, 8, 2, 0x050818, 0.3); // sombra
  // pernas e botas douradas
  outlinedRect(g, -4, -15, 3, 8, FLASH_RED, FLASH_OUTLINE);
  outlinedRect(g, 1, -15, 3, 8, FLASH_RED, FLASH_OUTLINE);
  outlinedRect(g, -5, -9, 4, 8, FLASH_GOLD, FLASH_OUTLINE);
  outlinedRect(g, 1, -9, 4, 8, FLASH_GOLD, FLASH_OUTLINE);
  fillPixels(g, [[-6, -2], [-6, -1], [5, -2], [5, -1]], FLASH_GOLD);
  fillPixels(g, [[-5, -9], [-3, -9], [2, -9], [4, -9]], FLASH_RED); // zig-zag no topo das botas
  // tronco musculoso (ombros largos)
  outlinedRect(g, -6, -27, 13, 13, FLASH_RED, FLASH_OUTLINE);
  g.rect(-6, -25, 2, 7).fill(FLASH_RED_DARK);
  g.rect(5, -25, 2, 7).fill(FLASH_RED_DARK);
  g.rect(-1, -19, 3, 1).fill(FLASH_RED_DARK); // abdomen
  // emblema do raio no peito
  fillPixelEllipse(g, 0, -23, 3, 3, FLASH_GOLD);
  fillPixelEllipse(g, 0, -23, 2, 2, 0xfdfdfd);
  fillPixels(g, [[0, -25], [-1, -24], [0, -23], [1, -22], [0, -21]], FLASH_RED);
  // cinto com raios dourados
  g.rect(-6, -15, 13, 1).fill(FLASH_GOLD);
  // bracos de punho fechado, com faixas douradas nos pulsos
  for (const sx of [-9, 7]) {
    outlinedRect(g, sx, -26, 3, 12, FLASH_RED, FLASH_OUTLINE);
    g.rect(sx, -17, 3, 1).fill(FLASH_GOLD);
    outlinedRect(g, sx, -14, 3, 3, FLASH_RED_DARK, FLASH_OUTLINE);
  }
  // cabeca: capuz vermelho com o rosto aparecendo
  outlinedEllipse(g, 0, -32, 5, 5, FLASH_RED, FLASH_OUTLINE);
  g.rect(-3, -31, 7, 4).fill(0xf0cdb0);
  fillPixels(g, [[-3, -31], [-2, -31], [2, -31], [3, -31]], 0xfdfdfd);
  fillPixels(g, [[-2, -31], [2, -31]], 0x4a90d8); // olhos azuis
  fillPixels(g, [[0, -28]], 0xb98a72);
  // raios dourados nas laterais do capuz
  fillPixels(g, [[-7, -35], [-6, -34], [-7, -33], [-6, -32]], FLASH_GOLD);
  fillPixels(g, [[7, -35], [6, -34], [7, -33], [6, -32]], FLASH_GOLD);
}

const Z_OUTLINE = 0x14141c;
const Z_SKIN = 0xf0c4a0;

/** Goku: cabelo preto espetado, gi laranja com faixa e munhequeiras azuis. ox = deslocamento em x. */
function drawGoku(g: Graphics, ox: number): void {
  const ORANGE = 0xf06a10;
  const BLUE = 0x1d3fa0;
  const HAIR = 0x14141c;
  outlinedRect(g, ox - 5, -14, 5, 9, ORANGE, Z_OUTLINE);
  outlinedRect(g, ox + 1, -14, 5, 9, ORANGE, Z_OUTLINE);
  outlinedRect(g, ox - 5, -6, 4, 5, BLUE, Z_OUTLINE);
  outlinedRect(g, ox + 1, -6, 4, 5, BLUE, Z_OUTLINE);
  fillPixels(g, [[ox - 5, -3], [ox + 4, -3], [ox - 5, -2], [ox + 4, -2]], 0xe8c020);
  outlinedRect(g, ox - 6, -26, 13, 12, ORANGE, Z_OUTLINE);
  g.rect(ox - 2, -26, 5, 4).fill(BLUE);
  g.rect(ox - 6, -15, 13, 2).fill(BLUE);
  for (const sx of [-9, 7]) {
    outlinedRect(g, ox + sx, -25, 3, 11, Z_SKIN, Z_OUTLINE);
    g.rect(ox + sx, -25, 3, 2).fill(BLUE);
    g.rect(ox + sx, -18, 3, 2).fill(BLUE);
  }
  outlinedEllipse(g, ox, -30, 5, 5, Z_SKIN, Z_OUTLINE);
  fillPixelEllipse(g, ox, -33, 6, 4, HAIR);
  fillPixels(g, [[ox - 4, -37], [ox - 3, -38], [ox - 3, -37], [ox - 1, -39], [ox - 1, -38], [ox + 1, -40], [ox + 1, -39], [ox + 3, -38], [ox + 3, -37], [ox + 5, -37], [ox - 6, -34], [ox + 6, -34], [ox - 7, -33], [ox + 7, -33]], HAIR);
  fillPixels(g, [[ox - 2, -30], [ox + 2, -30], [ox - 3, -31], [ox + 3, -31]], Z_OUTLINE);
}

/** Vegeta: cabelo preto em chama, armadura branca com ombreiras douradas sobre malha azul. */
function drawVegeta(g: Graphics, ox: number): void {
  const BLUE = 0x2a6fdc;
  const WHITE = 0xe6e6ea;
  const GOLD = 0xe8c060;
  const HAIR = 0x0c0c10;
  outlinedRect(g, ox - 4, -15, 3, 8, BLUE, Z_OUTLINE);
  outlinedRect(g, ox + 1, -15, 3, 8, BLUE, Z_OUTLINE);
  outlinedRect(g, ox - 5, -8, 4, 7, WHITE, Z_OUTLINE);
  outlinedRect(g, ox + 1, -8, 4, 7, WHITE, Z_OUTLINE);
  fillPixels(g, [[ox - 5, -2], [ox - 4, -2], [ox + 4, -2], [ox + 3, -2], [ox - 5, -1], [ox + 4, -1]], GOLD);
  outlinedRect(g, ox - 6, -27, 13, 13, BLUE, Z_OUTLINE);
  g.rect(ox - 4, -25, 9, 8).fill(WHITE);
  g.rect(ox - 2, -23, 5, 4).fill(GOLD);
  g.rect(ox - 2, -21, 5, 1).fill(0xb89030);
  g.rect(ox - 6, -28, 3, 2).fill(GOLD);
  g.rect(ox + 4, -28, 3, 2).fill(GOLD);
  g.rect(ox - 4, -17, 9, 1).fill(WHITE);
  for (const sx of [-9, 7]) {
    outlinedRect(g, ox + sx, -26, 3, 11, BLUE, Z_OUTLINE);
    outlinedRect(g, ox + sx, -17, 3, 5, WHITE, Z_OUTLINE);
  }
  outlinedEllipse(g, ox, -31, 5, 5, Z_SKIN, Z_OUTLINE);
  fillPixelEllipse(g, ox, -34, 6, 4, HAIR);
  g.rect(ox - 1, -43, 3, 7).fill(HAIR);
  g.rect(ox - 4, -40, 2, 5).fill(HAIR);
  g.rect(ox + 3, -40, 2, 5).fill(HAIR);
  fillPixels(g, [[ox - 6, -37], [ox + 6, -37], [ox - 7, -35], [ox + 7, -35]], HAIR);
  fillPixels(g, [[ox - 2, -31], [ox + 2, -31], [ox - 3, -32], [ox + 3, -32]], Z_OUTLINE);
  fillPixels(g, [[ox - 1, -33], [ox, -34], [ox + 1, -33]], Z_SKIN); // testa em "M"
}

/** Trunks: cabelo lilas, jaqueta roxa, cinto amarelo, calca preta, botas amarelas e espada nas costas. */
function drawTrunks(g: Graphics, ox: number): void {
  const PURPLE = 0x6a4fd8;
  const LAVENDER = 0xb9a0e8;
  const YELLOW = 0xf0c020;
  const BLACK = 0x30303a;
  outlinedRect(g, ox - 5, -16, 5, 9, BLACK, Z_OUTLINE);
  outlinedRect(g, ox + 1, -16, 5, 9, BLACK, Z_OUTLINE);
  outlinedRect(g, ox - 5, -8, 4, 7, YELLOW, Z_OUTLINE);
  outlinedRect(g, ox + 1, -8, 4, 7, YELLOW, Z_OUTLINE);
  fillPixels(g, [[ox - 5, -2], [ox - 4, -2], [ox + 4, -2], [ox + 3, -2]], 0xa86a5a);
  // espada nas costas: cabo e guarda aparecendo atras do ombro
  g.rect(ox + 8, -37, 3, 2).fill(0xc8c8d4);
  g.rect(ox + 8, -35, 2, 5).fill(0x7a3a28);
  outlinedRect(g, ox - 6, -26, 13, 11, PURPLE, Z_OUTLINE);
  g.rect(ox - 2, -26, 5, 9).fill(0x1a1a20);
  fillPixels(g, linePixels(ox - 3, -27, ox + 3, -18), 0x30c0d0);
  g.rect(ox - 6, -16, 13, 2).fill(YELLOW);
  fillPixels(g, [[ox, -16], [ox, -15]], 0xd83020);
  // braco esquerdo caido e braco direito levantado segurando o cabo
  outlinedRect(g, ox - 9, -25, 3, 10, PURPLE, Z_OUTLINE);
  g.rect(ox - 9, -15, 3, 2).fill(Z_SKIN);
  const arm = linePixels(ox + 6, -24, ox + 9, -31).flatMap(([x, y]) => [[x, y], [x + 1, y]] as Array<[number, number]>);
  fillPixels(g, arm, PURPLE);
  g.rect(ox + 9, -33, 3, 3).fill(Z_SKIN);
  // cabeca
  outlinedEllipse(g, ox, -30, 5, 5, Z_SKIN, Z_OUTLINE);
  fillPixelEllipse(g, ox, -33, 6, 4, LAVENDER);
  g.rect(ox - 6, -33, 2, 7).fill(LAVENDER);
  g.rect(ox + 5, -33, 2, 5).fill(LAVENDER);
  fillPixels(g, [[ox - 3, -30], [ox - 2, -30], [ox - 1, -31]], LAVENDER); // franja
  fillPixels(g, [[ox - 2, -29], [ox + 2, -29]], 0x2a90e0);
}

/** Goku, Vegeta e Trunks lado a lado. Origem: chao, no meio do grupo. */
function drawSaiyans(g: Graphics): void {
  fillPixelEllipse(g, 0, -1, 28, 2, 0x050818, 0.3); // sombra
  drawGoku(g, -19);
  drawTrunks(g, 19);
  drawVegeta(g, 0);
}

/** Gengar: corpo roxo redondo, espinhos e orelhas, olhos vermelhos e sorriso enorme. ox = deslocamento em x. */
function drawGengar(g: Graphics, ox: number): void {
  const OUT = 0x2a1f4a;
  const PURPLE = 0x6a52a0;
  // rabinho, pes e bracinhos
  fillPixels(g, [[ox + 9, -3], [ox + 10, -4], [ox + 10, -3]], PURPLE);
  outlinedEllipse(g, ox - 5, -1, 2, 1, PURPLE, OUT);
  outlinedEllipse(g, ox + 5, -1, 2, 1, PURPLE, OUT);
  outlinedEllipse(g, ox - 9, -6, 1, 2, PURPLE, OUT);
  outlinedEllipse(g, ox + 9, -6, 1, 2, PURPLE, OUT);
  // orelhas e espinhos
  outlinedRect(g, ox - 8, -19, 3, 6, PURPLE, OUT);
  outlinedRect(g, ox + 6, -19, 3, 6, PURPLE, OUT);
  outlinedRect(g, ox - 4, -18, 2, 4, PURPLE, OUT);
  outlinedRect(g, ox, -19, 2, 5, PURPLE, OUT);
  outlinedRect(g, ox + 3, -18, 2, 4, PURPLE, OUT);
  // corpo
  outlinedEllipse(g, ox, -8, 8, 7, PURPLE, OUT);
  g.rect(ox - 5, -5, 11, 1).fill(0x57428a); // sombra da barriga
  // olhos vermelhos inclinados
  fillPixels(g, [[ox - 6, -12], [ox - 5, -11], [ox - 4, -11], [ox - 3, -10], [ox + 6, -12], [ox + 5, -11], [ox + 4, -11], [ox + 3, -10]], 0xe03a4a);
  fillPixels(g, [[ox - 4, -10], [ox + 4, -10]], 0xfdfdfd);
  // sorriso enorme com dentes
  g.rect(ox - 6, -9, 13, 5).fill(OUT);
  g.rect(ox - 5, -8, 11, 3).fill(0xfdfdfd);
  fillPixels(g, [[ox - 3, -8], [ox - 3, -7], [ox - 3, -6], [ox - 1, -8], [ox - 1, -7], [ox - 1, -6], [ox + 1, -8], [ox + 1, -7], [ox + 1, -6], [ox + 3, -8], [ox + 3, -7], [ox + 3, -6]], 0xc8c8d4);
}

/** Jigglypuff: bolinha rosa de orelhas pontudas, topete enrolado, olhos grandes azul-turquesa e sorrisinho. */
function drawJigglypuff(g: Graphics, ox: number): void {
  const OUT = 0x5a3a40;
  const PINK = 0xf8b8c8;
  // pes e bracinho levantado
  outlinedEllipse(g, ox - 4, -1, 2, 1, PINK, OUT);
  outlinedEllipse(g, ox + 4, -1, 2, 1, PINK, OUT);
  outlinedEllipse(g, ox - 8, -10, 1, 2, PINK, OUT);
  outlinedEllipse(g, ox + 8, -6, 1, 1, PINK, OUT);
  // orelhas com interior escuro
  outlinedRect(g, ox - 7, -18, 4, 5, PINK, OUT);
  outlinedRect(g, ox + 4, -18, 4, 5, PINK, OUT);
  g.rect(ox - 6, -17, 2, 3).fill(0x3a3a46);
  g.rect(ox + 5, -17, 2, 3).fill(0x3a3a46);
  // corpo e topete
  outlinedEllipse(g, ox, -8, 7, 7, PINK, OUT);
  outlinedEllipse(g, ox, -15, 3, 2, PINK, OUT);
  fillPixels(g, [[ox - 1, -15], [ox, -16], [ox + 1, -15], [ox, -14]], 0xe898ae);
  // olhos grandes
  outlinedEllipse(g, ox - 3, -9, 2, 2, 0xfdfdfd, OUT);
  outlinedEllipse(g, ox + 3, -9, 2, 2, 0xfdfdfd, OUT);
  fillPixels(g, [[ox - 3, -9], [ox - 3, -8], [ox + 3, -9], [ox + 3, -8]], 0x30a0b8);
  fillPixels(g, [[ox - 4, -10], [ox + 2, -10]], 0xfdfdfd);
  // sorrisinho
  fillPixels(g, [[ox - 1, -5], [ox, -4], [ox + 1, -5]], OUT);
}

/** Gengar e Jigglypuff juntinhos. Origem: chao, entre os dois. */
function drawPokemon(g: Graphics): void {
  fillPixelEllipse(g, 0, -1, 21, 2, 0x050818, 0.3); // sombra
  drawGengar(g, -11);
  drawJigglypuff(g, 11);
}

/**
 * Cowboy: chapeu marrom, barba, lenco preto, camisa azul com suspensorios, cinto com
 * fivela dourada, coldre no quadril e bolsa de couro. Origem: chao, embaixo dele.
 */
function drawCowboy(g: Graphics): void {
  const OUT = 0x1a1008;
  const SHIRT = 0x6f8fb8;
  const SKIN = 0xe0b090;
  const LEATHER = 0x5a3a20;
  fillPixelEllipse(g, 0, -1, 9, 2, 0x050818, 0.3); // sombra
  // botas e calca marrom
  outlinedRect(g, -5, -16, 4, 10, 0x4a3a2c, OUT);
  outlinedRect(g, 1, -16, 4, 10, 0x4a3a2c, OUT);
  outlinedRect(g, -6, -7, 5, 6, 0x2a2218, OUT);
  outlinedRect(g, 1, -7, 5, 6, 0x2a2218, OUT);
  // camisa azul desbotada
  outlinedRect(g, -6, -27, 13, 12, SHIRT, OUT);
  g.rect(-4, -27, 1, 11).fill(0x3a2a1c); // suspensorios
  g.rect(3, -27, 1, 11).fill(0x3a2a1c);
  // cinto com fivela dourada
  g.rect(-6, -16, 13, 2).fill(0x2a1c10);
  g.rect(-1, -16, 3, 2).fill(0xe0b040);
  // lenco preto no pescoco
  fillPixels(g, [[-2, -27], [-1, -27], [0, -27], [1, -27], [2, -27], [-1, -26], [0, -26], [1, -26], [0, -25]], 0x14141c);
  // bracos: mangas dobradas, antebracos e maos perto do cinto
  for (const sx of [-9, 7]) {
    outlinedRect(g, sx, -26, 3, 6, SHIRT, OUT);
    outlinedRect(g, sx, -20, 3, 5, SKIN, OUT);
  }
  // coldre e bolsa de couro
  outlinedRect(g, -9, -14, 3, 5, LEATHER, OUT);
  fillPixels(g, [[-8, -15], [-7, -15]], 0x8a8a94);
  outlinedRect(g, 7, -17, 3, 4, 0x6a4a2a, OUT);
  // cabeca com barba
  outlinedEllipse(g, 0, -31, 4, 4, SKIN, OUT);
  g.rect(-3, -30, 7, 3).fill(0x3a2a1c);
  g.rect(-1, -29, 3, 1).fill(SKIN); // boca
  fillPixels(g, [[-2, -32], [2, -32]], OUT);
  // chapeu de aba larga
  outlinedRect(g, -8, -36, 17, 2, 0x3a2414, OUT);
  outlinedRect(g, -5, -42, 11, 6, 0x4a2e18, OUT);
  g.rect(-5, -37, 11, 1).fill(0x1a1008); // fita do chapeu
}

const N_OUT = 0x1a1418;
const N_SKIN = 0xf2d6bc;

/** Sasuke: cabelo preto espetado com franja, camisa cinza de gola alta, corda roxa na cintura. ox = deslocamento em x. */
function drawSasuke(g: Graphics, ox: number): void {
  const HAIR = 0x14141c;
  // pernas escuras, faixas nos tornozelos e sandalias
  outlinedRect(g, ox - 5, -12, 4, 8, 0x22222a, N_OUT);
  outlinedRect(g, ox + 1, -12, 4, 8, 0x22222a, N_OUT);
  g.rect(ox - 5, -7, 4, 4).fill(0x5a5a3a);
  g.rect(ox + 1, -7, 4, 4).fill(0x5a5a3a);
  g.rect(ox - 6, -3, 5, 2).fill(0x3a3226);
  g.rect(ox + 1, -3, 5, 2).fill(0x3a3226);
  // saia azul-acinzentada e corda roxa
  outlinedRect(g, ox - 6, -17, 13, 6, 0x4a4a6a, N_OUT);
  g.rect(ox - 6, -19, 13, 2).fill(0x7a5a90);
  fillPixels(g, [[ox + 2, -18], [ox + 3, -17], [ox + 3, -16], [ox + 4, -15]], 0x7a5a90);
  // camisa cinza com gola alta e ziper
  outlinedRect(g, ox - 6, -29, 13, 10, 0xa8abb0, N_OUT);
  g.rect(ox - 6, -31, 3, 3).fill(0xa8abb0);
  g.rect(ox + 4, -31, 3, 3).fill(0xa8abb0);
  fillPixels(g, [[ox, -28], [ox, -27], [ox, -26], [ox, -25], [ox, -24], [ox, -23], [ox, -22]], 0x6a6a72);
  // bracos: manga curta cinza, antebraco claro, munhequeira preta
  for (const sx of [-9, 7]) {
    outlinedRect(g, ox + sx, -28, 3, 5, 0xa8abb0, N_OUT);
    outlinedRect(g, ox + sx, -23, 3, 7, N_SKIN, N_OUT);
    g.rect(ox + sx, -19, 3, 2).fill(0x14141c);
  }
  // cabeca e cabelo
  outlinedEllipse(g, ox, -34, 4, 4, N_SKIN, N_OUT);
  fillPixelEllipse(g, ox, -36, 5, 3, HAIR);
  fillPixels(g, [[ox - 4, -40], [ox - 2, -41], [ox, -41], [ox + 2, -41], [ox + 4, -40], [ox - 5, -37], [ox + 5, -37], [ox - 4, -41], [ox + 5, -39]], HAIR);
  g.rect(ox - 4, -35, 2, 4).fill(HAIR); // franja
  fillPixels(g, [[ox - 1, -33], [ox + 2, -33]], N_OUT);
}

/** Sakura: cabelo rosa curto com bandana prateada, olhos verdes, blusa vermelha, short rosa e botas marrons. */
function drawSakura(g: Graphics, ox: number): void {
  const PINK = 0xf0a0b0;
  // botas marrons altas, sandalias e pernas
  outlinedRect(g, ox - 4, -17, 3, 7, N_SKIN, N_OUT);
  outlinedRect(g, ox + 1, -17, 3, 7, N_SKIN, N_OUT);
  outlinedRect(g, ox - 5, -11, 4, 9, 0x6a5a50, N_OUT);
  outlinedRect(g, ox + 1, -11, 4, 9, 0x6a5a50, N_OUT);
  g.rect(ox - 6, -3, 5, 2).fill(0x2a2420);
  g.rect(ox + 1, -3, 5, 2).fill(0x2a2420);
  // short/avental rosa e blusa vermelha sem manga
  outlinedRect(g, ox - 5, -19, 11, 5, 0xe0b8b0, N_OUT);
  outlinedRect(g, ox - 5, -29, 11, 10, 0xa02a34, N_OUT);
  fillPixels(g, [[ox + 1, -28], [ox + 1, -27], [ox + 1, -26], [ox + 2, -25], [ox + 2, -24], [ox + 3, -22]], 0x4a1018); // ziper
  // bracos de pele, cotoveleiras rosa e luvas marrons
  for (const sx of [-8, 6]) {
    outlinedRect(g, ox + sx, -28, 3, 9, N_SKIN, N_OUT);
    g.rect(ox + sx, -24, 3, 2).fill(0xd8aaa0);
    outlinedRect(g, ox + sx, -19, 3, 3, 0x5a4a44, N_OUT);
  }
  // cabeca, cabelo curto e bandana
  outlinedEllipse(g, ox, -34, 4, 4, N_SKIN, N_OUT);
  fillPixelEllipse(g, ox, -36, 5, 3, PINK);
  g.rect(ox - 5, -36, 2, 6).fill(PINK);
  g.rect(ox + 4, -36, 2, 5).fill(PINK);
  g.rect(ox - 4, -38, 9, 1).fill(0xb4b4be); // bandana
  fillPixels(g, [[ox - 2, -34], [ox - 1, -34], [ox + 1, -34]], PINK); // franja
  fillPixels(g, [[ox - 2, -33], [ox + 2, -33]], 0x40c090);
  fillPixels(g, [[ox, -30]], 0xb06070);
}

/** Sasuke e Sakura lado a lado. Origem: chao, entre os dois. */
function drawNinjas(g: Graphics): void {
  fillPixelEllipse(g, 0, -1, 19, 2, 0x050818, 0.3); // sombra
  drawSasuke(g, -10);
  drawSakura(g, 10);
}

const K_OUT = 0x14141c;

/** Guts: armadura escura, capa preta rasgada, cabelo preto curto e a espada gigante nas costas. ox = deslocamento em x. */
function drawGuts(g: Graphics, ox: number): void {
  const STEEL = 0x6a6e78;
  const STEEL_LIGHT = 0x8a8e98;
  const LEATHER = 0x6a4a2a;
  const SKIN = 0xe0b090;
  // capa preta atras do corpo, com a barra rasgada
  outlinedRect(g, ox - 8, -28, 17, 22, 0x1c1c24, K_OUT);
  fillPixels(g, [[ox - 8, -5], [ox - 6, -4], [ox - 3, -5], [ox, -4], [ox + 3, -5], [ox + 6, -4], [ox + 8, -5]], K_OUT);
  // pernas blindadas, joelheiras e botas
  outlinedRect(g, ox - 5, -15, 4, 10, STEEL, K_OUT);
  outlinedRect(g, ox + 1, -15, 4, 10, STEEL, K_OUT);
  g.rect(ox - 5, -9, 4, 2).fill(STEEL_LIGHT);
  g.rect(ox + 1, -9, 4, 2).fill(STEEL_LIGHT);
  outlinedRect(g, ox - 6, -6, 5, 5, 0x4a4e58, K_OUT);
  outlinedRect(g, ox + 1, -6, 5, 5, 0x4a4e58, K_OUT);
  g.rect(ox - 6, -6, 5, 2).fill(LEATHER);
  g.rect(ox + 1, -6, 5, 2).fill(LEATHER);
  // peitoral com tiras de couro, cinto e bolsa
  outlinedRect(g, ox - 6, -29, 13, 14, STEEL, K_OUT);
  fillPixels(g, linePixels(ox - 5, -28, ox + 3, -19), LEATHER);
  fillPixels(g, linePixels(ox - 5, -27, ox + 3, -18), LEATHER);
  g.rect(ox - 6, -16, 13, 2).fill(LEATHER);
  outlinedRect(g, ox - 9, -16, 3, 4, LEATHER, K_OUT);
  // ombreira e braco blindado (direita) e braco nu levantado (esquerda)
  outlinedRect(g, ox + 5, -30, 5, 5, STEEL_LIGHT, K_OUT);
  outlinedRect(g, ox + 7, -25, 3, 11, STEEL_LIGHT, K_OUT);
  const raised = linePixels(ox - 6, -26, ox - 8, -36).flatMap(([x, y]) => [[x, y], [x - 1, y]] as Array<[number, number]>);
  fillPixels(g, raised, K_OUT);
  fillPixels(g, raised.map(([x, y]) => [x, y] as [number, number]), SKIN);
  g.rect(ox - 10, -39, 3, 3).fill(0xdad2c0); // mao com bandagem
  // espada gigante apoiada no ombro (atras da cabeca)
  const blade = linePixels(ox - 8, -38, ox + 17, -48);
  const bladeThick = blade.flatMap(([x, y]) => [0, 1, 2, 3].map((d) => [x, y + d] as [number, number]));
  fillPixels(g, bladeThick.map(([x, y]) => [x, y - 1] as [number, number]), K_OUT);
  fillPixels(g, bladeThick, 0x4a4e58);
  fillPixels(g, blade, 0x9a9ea8); // fio da lamina
  g.rect(ox - 12, -41, 5, 2).fill(LEATHER); // cabo
  // cabeca e cabelo preto curto
  outlinedEllipse(g, ox, -34, 4, 4, SKIN, K_OUT);
  fillPixelEllipse(g, ox, -36, 5, 3, 0x14141c);
  fillPixels(g, [[ox - 4, -40], [ox - 2, -41], [ox, -41], [ox + 2, -41], [ox + 4, -40]], 0x14141c);
  fillPixels(g, [[ox - 2, -34], [ox + 2, -34]], K_OUT);
  fillPixels(g, [[ox - 1, -31]], 0xb07a60); // cicatriz
}

/** Griffith: cabelo longo prateado, armadura de placas prateada, capa branca e florete. */
function drawGriffith(g: Graphics, ox: number): void {
  const SILVER = 0xc4ccd6;
  const SHADE = 0xaab2be;
  const HAIR = 0xdfe6f0;
  const GOLD = 0xe0b040;
  // capa branca atras
  outlinedRect(g, ox - 10, -28, 11, 22, 0xeef1f6, K_OUT);
  // pernas, coxas escuras e botas de placas
  outlinedRect(g, ox - 4, -14, 3, 9, SILVER, K_OUT);
  outlinedRect(g, ox + 1, -14, 3, 9, SILVER, K_OUT);
  g.rect(ox - 3, -16, 7, 3).fill(0x22222a);
  outlinedRect(g, ox - 5, -6, 4, 5, SHADE, K_OUT);
  outlinedRect(g, ox + 1, -6, 4, 5, SHADE, K_OUT);
  // peitoral prateado com brilho, cinto e ombreiras
  outlinedRect(g, ox - 6, -29, 13, 14, SILVER, K_OUT);
  g.rect(ox - 3, -28, 3, 6).fill(0xe6ecf4);
  g.rect(ox - 6, -16, 13, 2).fill(0x8a7a6a);
  outlinedRect(g, ox - 9, -30, 4, 5, SHADE, K_OUT);
  outlinedRect(g, ox + 6, -30, 4, 5, SHADE, K_OUT);
  fillPixels(g, [[ox + 8, -33], [ox + 9, -34], [ox + 9, -35], [ox + 10, -35]], GOLD); // asa dourada
  // bracos blindados
  outlinedRect(g, ox - 9, -25, 3, 11, SHADE, K_OUT);
  outlinedRect(g, ox + 7, -25, 3, 11, SHADE, K_OUT);
  // florete fino
  fillPixels(g, linePixels(ox - 9, -15, ox + 5, -1), 0xa4aab4);
  fillPixels(g, [[ox - 10, -15], [ox - 9, -16], [ox - 8, -15]], GOLD);
  // cabeca com cabelo longo e ondulado
  g.rect(ox - 7, -35, 4, 11).fill(HAIR);
  g.rect(ox + 5, -35, 4, 11).fill(HAIR);
  outlinedEllipse(g, ox, -34, 4, 4, 0xf4dfcc, K_OUT);
  fillPixelEllipse(g, ox, -36, 6, 3, HAIR);
  fillPixels(g, [[ox - 3, -34], [ox - 2, -34], [ox + 2, -34]], HAIR); // franja
  fillPixels(g, [[ox - 2, -33], [ox + 2, -33]], 0x6aa0d8);
}

/** Guts e Griffith lado a lado. Origem: chao, entre os dois. */
function drawKnights(g: Graphics): void {
  fillPixelEllipse(g, 0, -1, 21, 2, 0x050818, 0.3); // sombra
  drawGuts(g, -12);
  drawGriffith(g, 12);
}

/** Desenha um obstaculo com a origem nos pes (ou no centro, no caso do lago). */
export function drawObstacle(g: Graphics, obstacle: WorldObstacle): void {
  g.clear();
  switch (obstacle.kind) {
    case "tree":
      return drawTree(g);
    case "rock":
      return drawRock(g);
    case "bush":
      return drawBush(g);
    case "cat":
      return drawCat(g, false);
    case "bears":
      return drawBears(g);
    case "kuromi":
      return drawKuromi(g);
    case "spiderman":
      return drawSpiderman(g);
    case "duo":
      return drawDuo(g);
    case "flash":
      return drawFlash(g);
    case "saiyans":
      return drawSaiyans(g);
    case "pokemon":
      return drawPokemon(g);
    case "cowboy":
      return drawCowboy(g);
    case "ninjas":
      return drawNinjas(g);
    case "knights":
      return drawKnights(g);
    case "pond":
      return drawPond(g, obstacle.width ?? 64, obstacle.height ?? 24);
  }
}
