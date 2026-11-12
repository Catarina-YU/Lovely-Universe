import type { Graphics } from "pixi.js";

/** Pixels de uma linha reta entre dois pontos (Bresenham), do primeiro ao ultimo. */
export function linePixels(x0: number, y0: number, x1: number, y1: number): Array<[number, number]> {
  const pixels: Array<[number, number]> = [];
  let x = Math.round(x0);
  let y = Math.round(y0);
  const tx = Math.round(x1);
  const ty = Math.round(y1);
  const dx = Math.abs(tx - x);
  const dy = -Math.abs(ty - y);
  const sx = x < tx ? 1 : -1;
  const sy = y < ty ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    pixels.push([x, y]);
    if (x === tx && y === ty) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
  return pixels;
}

/** Elipse preenchida em pixels (linha a linha, sem serrilhado suave). */
export function fillPixelEllipse(
  g: Graphics,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: number,
  alpha = 1,
): void {
  for (let dy = -ry; dy <= ry; dy++) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + 0.5)) ** 2)));
    if (half > 0) g.rect(cx - half, cy + dy, half * 2, 1);
  }
  g.fill({ color, alpha });
}

/** Desenha varios pixels 1x1 de uma mesma cor com um unico fill. */
export function fillPixels(
  g: Graphics,
  pixels: ReadonlyArray<readonly [number, number]>,
  color: number,
  alpha = 1,
): void {
  if (pixels.length === 0) return;
  for (const [x, y] of pixels) g.rect(x, y, 1, 1);
  g.fill({ color, alpha });
}
