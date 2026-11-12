import type { Direction, Vec2 } from "@/types/types";
import type { CutsceneActor, Step, StepRunner } from "./cutscene.types";

/** Direcao dominante de um vetor. */
export function directionFromVector(dx: number, dy: number): Direction {
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? "left" : "right";
  return dy < 0 ? "up" : "down";
}

/** Executa os passos um depois do outro. Passos instantaneos encadeiam no mesmo quadro. */
export function sequence(...steps: Step[]): Step {
  return () => {
    let index = 0;
    let current: StepRunner | null = null;
    return (dt) => {
      let delta = dt;
      while (index < steps.length) {
        current ??= steps[index]();
        if (!current(delta)) return false;
        current = null;
        index += 1;
        delta = 0;
      }
      return true;
    };
  };
}

/** Executa os passos ao mesmo tempo; termina quando todos terminam. */
export function parallel(...steps: Step[]): Step {
  return () => {
    const runners = steps.map((step) => step());
    const done = runners.map(() => false);
    return (dt) => {
      runners.forEach((runner, i) => {
        if (!done[i]) done[i] = runner(dt);
      });
      return done.every(Boolean);
    };
  };
}

export function wait(seconds: number): Step {
  return () => {
    let elapsed = 0;
    return (dt) => (elapsed += dt) >= seconds;
  };
}

/** Passo instantaneo. */
export function run(fn: () => void): Step {
  return () => {
    fn();
    return () => true;
  };
}

function place(actor: CutsceneActor, position: Vec2): void {
  actor.position.x = position.x;
  actor.position.y = position.y;
  actor.handle.current?.setPosition(position.x, position.y);
}

/** Anda em linha reta ate `target` e termina parado, olhando na direcao do trajeto. */
export function walkTo(actor: CutsceneActor, target: Vec2, speed: number): Step {
  return () => {
    const dx = target.x - actor.position.x;
    const dy = target.y - actor.position.y;
    const facing = directionFromVector(dx, dy);
    return (dt) => {
      const rx = target.x - actor.position.x;
      const ry = target.y - actor.position.y;
      const distance = Math.hypot(rx, ry);
      const step = speed * dt;
      if (distance <= step || distance < 0.01) {
        place(actor, target);
        actor.handle.current?.play(`idle-${facing}`);
        return true;
      }
      place(actor, { x: actor.position.x + (rx / distance) * step, y: actor.position.y + (ry / distance) * step });
      actor.handle.current?.play(`walk-${facing}`);
      return false;
    };
  };
}

export function face(actor: CutsceneActor, direction: Direction): Step {
  return run(() => actor.handle.current?.play(`idle-${direction}`));
}

export function sit(actor: CutsceneActor): Step {
  return run(() => actor.handle.current?.play("sit-back"));
}
