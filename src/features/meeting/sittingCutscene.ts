import { directionFromVector, face, parallel, run, sequence, sit, wait, walkTo } from "@/core/cutscene/cutscene";
import type { CutsceneActor, Step } from "@/core/cutscene/cutscene.types";
import type { Vec2 } from "@/types/types";

/** Distancia (em pixels) entre cada um e o centro do ponto onde sentam. */
const SEAT_OFFSET = 14;
const APPROACH_DISTANCE = 15;
const APPROACH_SPEED = 44;
const WALK_SPEED = 46;

/** Onde cada um fica sentado: Pedro a esquerda, Catarina a direita, lado a lado. */
export function seatPositions(spot: Vec2): { pedro: Vec2; catarina: Vec2 } {
  return {
    pedro: { x: spot.x - SEAT_OFFSET, y: spot.y },
    catarina: { x: spot.x + SEAT_OFFSET, y: spot.y },
  };
}

interface SittingCutsceneDeps {
  pedro: CutsceneActor;
  catarina: CutsceneActor;
  spot: Vec2;
  /** Passo que sobe a camera ate o enquadramento do ceu. */
  panCamera: Step;
  /** Passo que faz a estrela cadente cruzar o ceu. */
  shootingStar: Step;
  onSeated: () => void;
}

/**
 * Tela 3: os dois se aproximam, caminham juntos ate o ponto combinado,
 * olham para cima, sentam, a camera sobe e uma estrela cadente cruza o ceu.
 */
export function buildSittingCutscene({
  pedro,
  catarina,
  spot,
  panCamera,
  shootingStar,
  onSeated,
}: SittingCutsceneDeps): Step {
  const seats = seatPositions(spot);

  // A Catarina se vira para o Pedro.
  const catarinaTurns: Step = () =>
    face(
      catarina,
      directionFromVector(pedro.position.x - catarina.position.x, pedro.position.y - catarina.position.y),
    )();

  // O Pedro chega bem perto dela.
  const pedroApproaches: Step = () => {
    const dx = pedro.position.x - catarina.position.x;
    const dy = pedro.position.y - catarina.position.y;
    const distance = Math.hypot(dx, dy);
    const target =
      distance <= APPROACH_DISTANCE
        ? { ...pedro.position }
        : {
            x: catarina.position.x + (dx / distance) * APPROACH_DISTANCE,
            y: catarina.position.y + (dy / distance) * APPROACH_DISTANCE,
          };
    return walkTo(pedro, target, APPROACH_SPEED)();
  };

  return sequence(
    catarinaTurns,
    pedroApproaches,
    wait(0.5),
    // Catarina vai na frente; o Pedro a acompanha logo em seguida.
    parallel(
      walkTo(catarina, seats.catarina, WALK_SPEED),
      sequence(wait(0.3), walkTo(pedro, seats.pedro, WALK_SPEED)),
    ),
    wait(0.3),
    face(pedro, "up"),
    face(catarina, "up"),
    wait(0.6),
    sit(pedro),
    sit(catarina),
    wait(0.9),
    panCamera,
    wait(0.5),
    shootingStar,
    wait(0.8),
    run(onSeated),
  );
}
