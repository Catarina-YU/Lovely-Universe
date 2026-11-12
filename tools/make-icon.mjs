// Gera o icone do app (electron/icon.ico): uma estrela dourada num ceu noturno, em pixel art.
// Uso: node tools/make-icon.mjs
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GRID = 32;
const SCALE = 8; // 32 * 8 = 256
const SIZE = GRID * SCALE;

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const grid = Array.from({ length: GRID }, () => Array(GRID).fill(null));
const px = (x, y, c) => {
  if (x >= 0 && x < GRID && y >= 0 && y < GRID) grid[y][x] = c;
};

// ceu em degraus dentro de um quadrado arredondado
const sky = ["#0b1033", "#141a4a", "#1f2260", "#2c2a78"];
for (let y = 0; y < GRID; y++) {
  for (let x = 0; x < GRID; x++) {
    const corner = Math.min(x, GRID - 1 - x) + Math.min(y, GRID - 1 - y) < 3 && (x < 3 || x > GRID - 4) && (y < 3 || y > GRID - 4);
    if (!corner) px(x, y, sky[Math.min(sky.length - 1, Math.floor((y / GRID) * sky.length))]);
  }
}
// estrelinhas
for (const [x, y, c] of [[4, 5, "#c9d0ff"], [26, 4, "#c9d0ff"], [6, 24, "#c9d0ff"], [25, 25, "#f5d98b"], [14, 3, "#ffffff"], [28, 14, "#c9d0ff"], [3, 14, "#ffffff"]]) {
  px(x, y, c);
  px(x - 1, y, c);
  px(x + 1, y, c);
  px(x, y - 1, c);
  px(x, y + 1, c);
}
// estrela grande de 4 pontas
const cx = 16;
const cy = 16;
for (let i = -10; i <= 10; i++) {
  const w = Math.max(0, Math.round(2.4 * (1 - Math.abs(i) / 11)));
  for (let d = -w; d <= w; d++) {
    px(cx + i, cy + d, "#f5d98b");
    px(cx + d, cy + i, "#f5d98b");
  }
}
for (let d = -3; d <= 3; d++) {
  for (let e = -3; e <= 3; e++) if (Math.abs(d) + Math.abs(e) <= 3) px(cx + d, cy + e, "#fff0b8");
}
px(cx, cy, "#ffffff");

// PNG 256x256
const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0;
  for (let x = 0; x < SIZE; x++) {
    const c = grid[Math.floor(y / SCALE)][Math.floor(x / SCALE)];
    const o = y * (SIZE * 4 + 1) + 1 + x * 4;
    if (c) {
      const [r, g, b] = hex(c);
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = 255;
    }
  }
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(td) >>> 0);
  return Buffer.concat([len, td, crc]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);

// ICO com uma unica imagem PNG de 256x256
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reservado
header.writeUInt16LE(1, 2); // tipo: icone
header.writeUInt16LE(1, 4); // quantidade
header[6] = 0; // largura 256
header[7] = 0; // altura 256
header.writeUInt16LE(1, 10); // planos
header.writeUInt16LE(32, 12); // bits por pixel
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../electron/icon.ico");
fs.writeFileSync(out, Buffer.concat([header, png]));
fs.writeFileSync(out.replace(".ico", ".png"), png);
console.log("icone gerado em", out);
