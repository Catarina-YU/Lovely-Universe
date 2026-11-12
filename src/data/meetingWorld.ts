import type { WorldConfig, WorldObstacle } from "@/types/types";

const tree = (x: number, y: number): WorldObstacle => ({
  kind: "tree",
  x,
  y,
  hitbox: { x: x - 5, y: y - 6, width: 10, height: 6 },
});

const rock = (x: number, y: number): WorldObstacle => ({
  kind: "rock",
  x,
  y,
  hitbox: { x: x - 7, y: y - 6, width: 14, height: 6 },
});

const bush = (x: number, y: number): WorldObstacle => ({
  kind: "bush",
  x,
  y,
  hitbox: { x: x - 7, y: y - 5, width: 14, height: 5 },
});

/** Gata cinza deitada. (x, y) e o ponto no chao, embaixo do corpo. */
const cat = (x: number, y: number): WorldObstacle => ({
  kind: "cat",
  x,
  y,
  hitbox: { x: x - 10, y: y - 5, width: 20, height: 5 },
});

/** Dupla de ursinhos (marrom e panda) de maos dadas. (x, y) e o chao entre os dois. */
const bears = (x: number, y: number): WorldObstacle => ({
  kind: "bears",
  x,
  y,
  hitbox: { x: x - 14, y: y - 4, width: 28, height: 4 },
});

/** Kuromi (capuz preto com caveirinha rosa) em pe. (x, y) e o chao embaixo dela. */
const kuromi = (x: number, y: number): WorldObstacle => ({
  kind: "kuromi",
  x,
  y,
  hitbox: { x: x - 7, y: y - 4, width: 14, height: 4 },
});

/** Homem-Aranha em pe, fazendo o gesto de teia. (x, y) e o chao embaixo dele. */
const spiderman = (x: number, y: number): WorldObstacle => ({
  kind: "spiderman",
  x,
  y,
  hitbox: { x: x - 6, y: y - 4, width: 12, height: 4 },
});

/** Dupla de personagens (Leon e Ada) lado a lado. (x, y) e o chao entre os dois. */
const duo = (x: number, y: number): WorldObstacle => ({
  kind: "duo",
  x,
  y,
  hitbox: { x: x - 17, y: y - 4, width: 34, height: 4 },
});

/** O Flash em pe, de bracos ao lado do corpo. (x, y) e o chao embaixo dele. */
const flash = (x: number, y: number): WorldObstacle => ({
  kind: "flash",
  x,
  y,
  hitbox: { x: x - 7, y: y - 4, width: 14, height: 4 },
});

/** Trio (Goku, Vegeta e Trunks) lado a lado. (x, y) e o chao no meio do grupo. */
const saiyans = (x: number, y: number): WorldObstacle => ({
  kind: "saiyans",
  x,
  y,
  hitbox: { x: x - 28, y: y - 4, width: 56, height: 4 },
});

/** Dupla de Pokemon (Gengar e Jigglypuff) juntos. (x, y) e o chao entre os dois. */
const pokemon = (x: number, y: number): WorldObstacle => ({
  kind: "pokemon",
  x,
  y,
  hitbox: { x: x - 22, y: y - 4, width: 44, height: 4 },
});

/** Cowboy (chapeu, lenco preto, suspensorios e coldre) em pe. (x, y) e o chao embaixo dele. */
const cowboy = (x: number, y: number): WorldObstacle => ({
  kind: "cowboy",
  x,
  y,
  hitbox: { x: x - 7, y: y - 4, width: 14, height: 4 },
});

/** Dupla de ninjas (Sasuke e Sakura) lado a lado. (x, y) e o chao entre os dois. */
const ninjas = (x: number, y: number): WorldObstacle => ({
  kind: "ninjas",
  x,
  y,
  hitbox: { x: x - 19, y: y - 4, width: 38, height: 4 },
});

/** Dupla de guerreiros (Guts e Griffith) lado a lado. (x, y) e o chao entre os dois. */
const knights = (x: number, y: number): WorldObstacle => ({
  kind: "knights",
  x,
  y,
  hitbox: { x: x - 22, y: y - 4, width: 44, height: 4 },
});

/** (x, y) e o centro do lago. */
const pond = (x: number, y: number, width: number, height: number): WorldObstacle => ({
  kind: "pond",
  x,
  y,
  width,
  height,
  hitbox: { x: x - width / 2 + 3, y: y - height / 2 + 2, width: width - 6, height: height - 4 },
});

/** Campo noturno da tela de encontro. Ajuste obstaculos e posicoes aqui. */
export const MEETING_WORLD: WorldConfig = {
  width: 512,
  height: 300,
  bounds: { x: 16, y: 132, width: 480, height: 160 },
  spawn: { x: 64, y: 252 },
  catarina: { x: 404, y: 174 },
  sitSpot: { x: 260, y: 140 },
  interactDistance: 38,
  obstacles: [
    tree(48, 196),
    tree(110, 160),
    tree(170, 146),
    tree(300, 150),
    tree(430, 148),
    tree(480, 238),
    rock(140, 270),
    rock(236, 196),
    rock(330, 254),
    bush(90, 236),
    bush(452, 190),
    bush(360, 190),
    pond(250, 258, 64, 24),
    knights(205, 170), // no alto, ao lado da arvore
    ninjas(302, 284), // lado a lado, perto do lago
    cowboy(352, 142), // no alto, olhando o campo
    pokemon(376, 278), // cantinho inferior, juntinhos
    saiyans(62, 152), // cantinho superior esquerdo, o trio lado a lado
    flash(474, 170), // cantinho direito, de pose firme
    duo(46, 282), // cantinho inferior esquerdo, lado a lado
    spiderman(318, 224), // perto do lago, de olho em tudo
    kuromi(150, 214), // passeando pelo campo
    bears(430, 268), // cantinho do mapa, de maos dadas
    cat(200, 272), // deitada na beira do lago, olhando para a agua
  ],
};
