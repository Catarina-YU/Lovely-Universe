import { clamp } from "@/lib/utils";
import type { Direction, Rect, StageSize, Vec2 } from "@/types/types";
import type { MoveInput, MovementResult } from "./movement.types";

/** Area dos pes usada nas colisoes (centro-base em x,y). */
export const FEET_WIDTH = 10;
export const FEET_HEIGHT = 5;

export function feetBox(x: number, y: number): Rect {
  return { x: x - FEET_WIDTH / 2, y: y - FEET_HEIGHT, width: FEET_WIDTH, height: FEET_HEIGHT };
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function createEmptyInput(): MoveInput {
  return { up: false, down: false, left: false, right: false };
}

function pickFacing(dx: number, dy: number, previous: Direction): Direction {
  if (dx !== 0 && dy === 0) return dx < 0 ? "left" : "right";
  if (dy !== 0 && dx === 0) return dy < 0 ? "up" : "down";
  if (dx !== 0 && dy !== 0) {
    // diagonal: mantem a direcao anterior se ela faz parte do movimento
    const horizontal: Direction = dx < 0 ? "left" : "right";
    const vertical: Direction = dy < 0 ? "up" : "down";
    return previous === horizontal || previous === vertical ? previous : horizontal;
  }
  return previous;
}

/**
 * Um passo de movimento: diagonal normalizada, eixos resolvidos separadamente
 * (permite deslizar em obstaculos), limites da area jogavel e colisao AABB.
 */
export function resolveMovement(
  position: Vec2,
  input: MoveInput,
  deltaSeconds: number,
  speed: number,
  bounds: Rect,
  blockers: readonly Rect[],
  previousFacing: Direction,
): MovementResult {
  let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const facing = pickFacing(dx, dy, previousFacing);
  if (dx !== 0 && dy !== 0) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }

  let { x, y } = position;
  const step = speed * deltaSeconds;

  const tryMove = (nextX: number, nextY: number) => {
    const cx = clamp(nextX, bounds.x, bounds.x + bounds.width);
    const cy = clamp(nextY, bounds.y, bounds.y + bounds.height);
    const box = feetBox(cx, cy);
    if (blockers.some((b) => rectsOverlap(box, b))) return;
    x = cx;
    y = cy;
  };

  if (dx !== 0) tryMove(x + dx * step, y);
  if (dy !== 0) tryMove(x, y + dy * step);

  return { x, y, facing, moving: x !== position.x || y !== position.y };
}

/** Distancia entre os pes dos personagens sentados e a borda inferior da tela. */
const SEATED_FOOT_MARGIN = 26;

/** Camera com o casal sentado na parte de baixo da tela e o ceu ocupando o resto. */
export function computeSeatedCamera(spot: Vec2, stage: StageSize): Vec2 {
  return {
    x: Math.round(spot.x - stage.width / 2),
    y: Math.round(spot.y + SEATED_FOOT_MARGIN - stage.height),
  };
}

/**
 * Posicao do canto superior esquerdo da camera. Se a tela for maior que o mundo,
 * centraliza na horizontal e encosta o mundo embaixo (mostra mais ceu em telas altas).
 */
export function computeCamera(target: Vec2, stage: StageSize, worldWidth: number, worldHeight: number): Vec2 {
  const x =
    stage.width >= worldWidth
      ? (worldWidth - stage.width) / 2
      : clamp(target.x - stage.width / 2, 0, worldWidth - stage.width);
  const y =
    stage.height >= worldHeight
      ? worldHeight - stage.height
      : clamp(target.y - 24 - stage.height / 2, 0, worldHeight - stage.height);
  return { x: Math.round(x), y: Math.round(y) };
}
