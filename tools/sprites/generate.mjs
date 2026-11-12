// Gerador dos spritesheets de Pedro e Catarina (pixel art desenhada em codigo).
// Uso: node tools/sprites/generate.mjs
// Saida: public/assets/characters/{pedro,catarina}.png, characters.json e uma previa em tools/sprites/sheet-preview.png
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const W = 32, H = 48;
const OUT = "#1a1226";
const EYE = "#1b1630", WHITE = "#ffffff", BLUSH = "#e89a98", MOUTH = "#a5545a";

class Canvas {
  constructor() { this.p = Array.from({ length: H }, () => Array(W).fill(null)); }
  px(x, y, c) { if (x >= 0 && x < W && y >= 0 && y < H) this.p[y][x] = c; }
  rect(x1, y1, x2, y2, c) { for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) this.px(x, y, c); }
  ellipse(cx, cy, rx, ry, c, skip) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1 && !(skip && skip(x, y))) this.px(x, y, c);
    }
  }
  curl(cx, cy, r, base, dark, hi) {
    this.ellipse(cx, cy, r, r, dark);
    this.ellipse(cx, cy, r - 1, r - 1, base);
    this.px(Math.round(cx - r / 2), Math.round(cy - r / 2), hi);
    this.px(Math.round(cx - r / 2) + 1, Math.round(cy - r / 2), hi);
    this.px(Math.round(cx + 1), Math.round(cy + 1), dark);
    this.px(Math.round(cx), Math.round(cy + 1), dark);
  }
  paste(src, dx = 0, dy = 0) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = src.p[y][x];
      if (v) this.px(x + dx, y + dy, v);
    }
  }
  flipX() { this.p = this.p.map(r => r.slice().reverse()); }
  outline() {
    const o = this.p.map(r => r.slice());
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (this.p[y][x]) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (this.p[y + dy]?.[x + dx]) { o[y][x] = OUT; break; }
      }
    }
    this.p = o;
  }
}

// ---------------- Paletas ----------------
const PEDRO = {
  id: "pedro",
  skin: "#f2c9a5", skinSh: "#dfa883", hair: "#2a2438", hairHi: "#4a4066",
  top: "#4f7fd1", topSh: "#3a62ab", pants: "#2f3b6b", pantsSh: "#232d55",
  shoe: "#f0eef5", sole: "#b9b4c9",
};
const CATARINA = {
  id: "catarina",
  skin: "#f6d2b4", skinSh: "#e3ae8a",
  hair: "#e0742a", dark: "#a8441a", hi: "#f7a95a",
  frame: "#3d2347", lens: "#dff0ff",
  top: "#b79ae6", topSh: "#9578c9", cream: "#f6efe0",
  skirt: "#e8b84a", skirtSh: "#c4912a", boot: "#6b4a3a", sole: "#3e2a22",
};

// ---------------- Pernas ----------------
function legsFront(c, w, liftL, liftR) {
  for (const [x1, x2, lift, sx1, sx2] of [[12, 14, liftL, 11, 14], [17, 19, liftR, 17, 20]]) {
    if (w.id === "pedro") {
      c.rect(x1, 35, x2, 43 - lift, w.pants); c.rect(x2, 35, x2, 43 - lift, w.pantsSh);
      c.rect(sx1, 43 - lift, sx2, 45 - lift, w.shoe); c.rect(sx1, 46 - lift, sx2, 46 - lift, w.sole);
    } else {
      c.rect(x1, 39, x2, 45 - lift, w.skin);
      c.rect(x1, 43 - lift, x2, 44 - lift, w.cream);
      c.rect(sx1, 44 - lift, sx2, 45 - lift, w.boot); c.rect(sx1, 46 - lift, sx2, 46 - lift, w.sole);
    }
  }
}

function legSide(c, w, dx, lift, far) {
  const x1 = 14 + dx, x2 = 17 + dx;
  if (w.id === "pedro") {
    c.rect(x1, 35, x2, 43 - lift, far ? w.pantsSh : w.pants);
    c.rect(x1, 43 - lift, x2 + 1, 45 - lift, far ? "#c9c6d6" : w.shoe);
    c.rect(x1, 46 - lift, x2 + 1, 46 - lift, w.sole);
  } else {
    c.rect(x1, 39, x2, 45 - lift, far ? w.skinSh : w.skin);
    c.rect(x1, 43 - lift, x2, 44 - lift, w.cream);
    c.rect(x1, 44 - lift, x2 + 1, 45 - lift, w.boot);
    c.rect(x1, 46 - lift, x2 + 1, 46 - lift, w.sole);
  }
}

// ---------------- Vista frontal ----------------
function bodyFront(w, armL = 0, armR = 0) {
  const c = new Canvas();
  if (w.id === "pedro") {
    for (const [x1, dy] of [[8, armL], [21, armR]]) {
      c.rect(x1, 26 + dy, x1 + 2, 30 + dy, w.top);
      c.rect(x1, 31 + dy, x1 + 2, 34 + dy, w.skin); c.rect(x1, 34 + dy, x1 + 2, 34 + dy, w.skinSh);
    }
    c.rect(11, 25, 20, 35, w.top); c.rect(19, 26, 20, 35, w.topSh); c.rect(11, 34, 20, 35, w.topSh);
    c.rect(14, 24, 17, 25, w.skinSh); c.rect(14, 26, 17, 26, w.topSh);
  } else {
    for (const [x1, dy] of [[8, armL], [21, armR]]) {
      c.rect(x1, 26 + dy, x1 + 2, 33 + dy, w.top); c.rect(x1, 33 + dy, x1 + 2, 33 + dy, w.topSh);
      c.rect(x1, 34 + dy, x1 + 2, 35 + dy, w.skin);
    }
    c.rect(11, 25, 20, 33, w.top); c.rect(19, 26, 20, 33, w.topSh); c.rect(13, 25, 18, 26, w.cream);
    c.rect(11, 34, 20, 34, w.skirt); c.rect(10, 35, 21, 36, w.skirt); c.rect(9, 37, 22, 38, w.skirt);
    c.rect(9, 38, 22, 38, w.skirtSh); c.rect(20, 35, 21, 37, w.skirtSh);
    c.rect(14, 24, 17, 25, w.skinSh);
  }
  return c;
}

function glassesFront(c, w) {
  for (const [x1, x2] of [[9, 14], [17, 22]]) {
    c.rect(x1, 15, x2, 19, w.frame); c.rect(x1 + 1, 16, x2 - 1, 18, w.lens);
  }
  c.rect(11, 17, 12, 18, EYE); c.rect(19, 17, 20, 18, EYE);
  c.px(11, 17, WHITE); c.px(19, 17, WHITE);
  c.rect(15, 16, 16, 16, w.frame);
}

const CATARINA_BACK_CURLS = [[7, 12, 4], [5, 17, 4], [6, 23, 4], [8, 29, 3], [24, 12, 4], [26, 17, 4], [25, 23, 4], [23, 29, 3], [11, 7, 4], [16, 5, 4], [20, 7, 4]];

function headFront(w) {
  const behind = new Canvas(), head = new Canvas();
  if (w.id === "pedro") {
    head.ellipse(16, 16, 9, 8, w.skin);
    head.px(7, 18, w.skinSh); head.px(24, 18, w.skinSh);
    head.ellipse(16, 13, 10, 8, w.hair, (x, y) => y >= 15 && x >= 9 && x <= 22);
    head.rect(9, 14, 22, 14, w.hair); head.rect(9, 15, 12, 15, w.hair);
    head.rect(7, 15, 8, 19, w.hair); head.rect(23, 15, 24, 19, w.hair);
    head.rect(15, 4, 17, 4, w.hair); head.rect(16, 3, 17, 3, w.hair);
    head.rect(12, 7, 15, 7, w.hairHi); head.rect(18, 8, 19, 8, w.hairHi);
    head.rect(12, 17, 13, 19, EYE); head.rect(18, 17, 19, 19, EYE);
    head.px(12, 17, WHITE); head.px(18, 17, WHITE);
    head.rect(12, 16, 13, 16, w.hair); head.rect(18, 16, 19, 16, w.hair);
    head.px(15, 20, w.skinSh);
    head.rect(10, 20, 11, 20, BLUSH); head.rect(20, 20, 21, 20, BLUSH);
    head.rect(15, 22, 16, 22, MOUTH); head.px(14, 21, MOUTH); head.px(17, 21, MOUTH);
  } else {
    for (const [x, y, r] of CATARINA_BACK_CURLS) behind.curl(x, y, r, w.hair, w.dark, w.hi);
    behind.ellipse(16, 14, 9, 9, w.dark);
    head.ellipse(16, 16, 9, 8, w.skin);
    head.px(7, 18, w.skinSh); head.px(24, 18, w.skinSh);
    head.rect(10, 21, 11, 21, "#ee9a98"); head.rect(20, 21, 21, 21, "#ee9a98");
    head.rect(15, 22, 16, 22, MOUTH);
    for (const [x, y, r] of [[10, 11, 4], [14, 8, 4], [18, 8, 4], [22, 11, 4], [16, 10, 4], [7, 16, 3], [25, 16, 3]]) head.curl(x, y, r, w.hair, w.dark, w.hi);
    for (const [x, y, r] of [[5, 22, 4], [7, 27, 4], [6, 32, 3], [26, 22, 4], [24, 27, 4], [25, 32, 3]]) head.curl(x, y, r, w.hair, w.dark, w.hi);
    glassesFront(head, w);
  }
  return { behind, head };
}

// ---------------- Vista de costas ----------------
function bodyBack(w, armL = 0, armR = 0) {
  const c = new Canvas();
  if (w.id === "pedro") {
    for (const [x1, dy] of [[8, armL], [21, armR]]) {
      c.rect(x1, 26 + dy, x1 + 2, 30 + dy, w.top);
      c.rect(x1, 31 + dy, x1 + 2, 34 + dy, w.skin); c.rect(x1, 34 + dy, x1 + 2, 34 + dy, w.skinSh);
    }
    c.rect(11, 25, 20, 35, w.top); c.rect(11, 25, 20, 26, w.topSh); c.rect(19, 27, 20, 35, w.topSh); c.rect(11, 34, 20, 35, w.topSh);
    c.rect(14, 24, 17, 25, w.skinSh);
  } else {
    for (const [x1, dy] of [[8, armL], [21, armR]]) {
      c.rect(x1, 26 + dy, x1 + 2, 33 + dy, w.top); c.rect(x1, 33 + dy, x1 + 2, 33 + dy, w.topSh);
      c.rect(x1, 34 + dy, x1 + 2, 35 + dy, w.skin);
    }
    c.rect(11, 25, 20, 33, w.top); c.rect(19, 26, 20, 33, w.topSh);
    c.rect(11, 34, 20, 34, w.skirt); c.rect(10, 35, 21, 36, w.skirt); c.rect(9, 37, 22, 38, w.skirt);
    c.rect(9, 38, 22, 38, w.skirtSh); c.rect(20, 35, 21, 37, w.skirtSh);
    c.rect(14, 24, 17, 25, w.skinSh);
  }
  return c;
}

const CATARINA_BACK_MASS = [
  [11, 7, 4], [16, 5, 4], [21, 7, 4],
  [8, 11, 4], [13, 10, 4], [18, 10, 4], [23, 11, 4],
  [6, 16, 4], [11, 15, 4], [16, 15, 4], [21, 15, 4], [26, 16, 4],
  [6, 21, 4], [11, 20, 4], [16, 20, 4], [21, 20, 4], [26, 21, 4],
  [7, 26, 4], [12, 25, 4], [17, 25, 4], [22, 25, 4], [25, 26, 3],
  [9, 30, 3], [14, 30, 3], [18, 30, 3], [23, 30, 3],
];

function headBack(w) {
  const behind = new Canvas(), head = new Canvas();
  if (w.id === "pedro") {
    head.ellipse(16, 16, 9, 8, w.skin);
    head.ellipse(16, 13.5, 10, 9, w.hair, (x, y) => y >= 22);
    head.rect(10, 21, 21, 21, w.hair);
    head.rect(15, 4, 17, 4, w.hair); head.rect(16, 3, 17, 3, w.hair);
    head.rect(12, 7, 15, 7, w.hairHi); head.rect(18, 8, 19, 8, w.hairHi);
    head.rect(15, 10, 16, 12, w.hairHi);
  } else {
    head.ellipse(16, 18, 11, 14, w.dark);
    for (const [x, y, r] of CATARINA_BACK_MASS) head.curl(x, y, r, w.hair, w.dark, w.hi);
    // hastes dos oculos aparecendo entre os cachos
    head.rect(7, 15, 7, 16, w.frame); head.rect(24, 15, 24, 16, w.frame);
  }
  return { behind, head };
}

// ---------------- Vista lateral (olhando para a direita) ----------------
function bodySide(w, adx = 0) {
  const c = new Canvas();
  if (w.id === "pedro") {
    c.rect(12, 25, 19, 35, w.top); c.rect(12, 34, 19, 35, w.topSh); c.rect(12, 25, 13, 33, w.topSh);
    c.rect(15, 24, 17, 25, w.skinSh);
    const ax = 14 + adx;
    c.rect(ax, 26, ax + 2, 30, w.top); c.rect(ax, 26, ax, 30, w.topSh);
    c.rect(ax, 31, ax + 2, 34, w.skin); c.rect(ax, 34, ax + 2, 34, w.skinSh);
  } else {
    c.rect(12, 25, 19, 33, w.top); c.rect(12, 26, 13, 33, w.topSh); c.rect(14, 25, 17, 25, w.cream);
    c.rect(12, 34, 19, 34, w.skirt); c.rect(11, 35, 20, 36, w.skirt); c.rect(10, 37, 21, 38, w.skirt);
    c.rect(10, 38, 21, 38, w.skirtSh); c.rect(11, 35, 12, 37, w.skirtSh);
    c.rect(15, 24, 17, 25, w.skinSh);
    const ax = 14 + adx;
    c.rect(ax, 26, ax + 2, 33, w.top); c.rect(ax, 26, ax, 33, w.topSh); c.rect(ax, 33, ax + 2, 33, w.topSh);
    c.rect(ax, 34, ax + 2, 35, w.skin);
  }
  return c;
}

function headSide(w) {
  const behind = new Canvas(), head = new Canvas();
  if (w.id === "pedro") {
    head.ellipse(16, 16, 8, 8, w.skin);
    head.px(24, 19, w.skin); head.px(24, 20, w.skin);
    head.ellipse(15, 13, 9.5, 8, w.hair, (x, y) => x >= 18 && y >= 15);
    head.rect(8, 15, 13, 21, w.hair);
    head.rect(14, 14, 23, 14, w.hair); head.rect(20, 15, 23, 15, w.hair);
    head.rect(14, 15, 17, 16, w.hair);
    head.rect(14, 17, 15, 19, w.skinSh);
    head.rect(19, 3, 21, 3, w.hair); head.rect(18, 4, 22, 4, w.hair);
    head.rect(12, 7, 15, 7, w.hairHi);
    head.rect(20, 17, 21, 19, EYE); head.px(20, 17, WHITE);
    head.rect(20, 16, 22, 16, w.hair);
    head.rect(18, 20, 19, 20, BLUSH);
    head.rect(21, 22, 22, 22, MOUTH);
  } else {
    for (const [x, y, r] of [[8, 13, 4], [6, 18, 4], [6, 24, 4], [8, 29, 4], [11, 33, 3], [12, 8, 4], [15, 6, 4], [10, 20, 4], [10, 26, 4], [13, 31, 3]])
      behind.curl(x, y, r, w.hair, w.dark, w.hi);
    behind.ellipse(12, 18, 6, 12, w.dark);
    head.ellipse(16, 16, 8, 8, w.skin);
    head.px(24, 19, w.skin); head.px(24, 20, w.skin);
    head.rect(14, 17, 15, 19, w.skinSh);
    head.rect(18, 20, 19, 20, "#ee9a98"); head.rect(21, 22, 22, 22, MOUTH);
    // oculos de perfil
    head.rect(13, 16, 19, 16, w.frame);
    head.rect(20, 15, 24, 19, w.frame); head.rect(21, 16, 23, 18, w.lens);
    head.rect(22, 17, 23, 18, EYE); head.px(22, 17, WHITE);
    for (const [x, y, r] of [[13, 9, 4], [17, 8, 4], [21, 10, 4], [10, 13, 4], [12, 5, 3], [16, 4, 3], [22, 13, 2]])
      head.curl(x, y, r, w.hair, w.dark, w.hi);
    head.rect(12, 14, 14, 15, w.hair);
    head.rect(13, 16, 15, 16, w.frame);
  }
  return { behind, head };
}

// ---------------- Montagem ----------------
function render({ behind, legs, body, head, bob = 0, hx = 0, hy = 0, flip = false }) {
  const c = new Canvas();
  c.paste(behind, hx, hy - bob);
  c.paste(legs);
  c.paste(body, 0, -bob);
  c.paste(head, hx, hy - bob);
  if (flip) c.flipX();
  c.outline();
  return c;
}

function frameFront(w, dir, { liftL = 0, liftR = 0, bob = 0, armL = 0, armR = 0 } = {}) {
  const back = dir === "up";
  const legs = new Canvas(); legsFront(legs, w, liftL, liftR);
  const body = back ? bodyBack(w, armL, armR) : bodyFront(w, armL, armR);
  const { behind, head } = back ? headBack(w) : headFront(w);
  return render({ behind, legs, body, head, bob });
}

function frameSide(w, dir, { ldx = 0, liftN = 0, liftF = 0, bob = 0 } = {}) {
  const legs = new Canvas();
  legSide(legs, w, -ldx, liftF, true);
  legSide(legs, w, ldx, liftN, false);
  const body = bodySide(w, -ldx);
  const { behind, head } = headSide(w);
  return render({ behind, legs, body, head, bob, flip: dir === "left" });
}

function frameSit(w, f) {
  const SHIFT = 11;
  const body = bodyBack(w); // sem pernas
  const { behind, head } = headBack(w);
  const c = new Canvas();
  const hx = f === 1 ? 1 : 0;
  c.paste(behind, hx, SHIFT);
  c.paste(body, 0, SHIFT);
  if (w.id === "pedro") { c.rect(10, 43, 21, 46, w.pants); c.rect(10, 46, 21, 46, w.pantsSh); }
  else { c.rect(7, 44, 24, 46, w.skirt); c.rect(7, 46, 24, 46, w.skirtSh); }
  c.paste(head, hx, SHIFT);
  c.outline();
  return c;
}

const WALK_FRONT = [
  {}, { liftL: 2, bob: 1, armL: 1, armR: -1 }, {}, { liftR: 2, bob: 1, armL: -1, armR: 1 },
];
const WALK_SIDE = [
  { ldx: 2 }, { ldx: 0, liftN: 1, bob: 1 }, { ldx: -2 }, { ldx: 0, liftF: 1, bob: 1 },
];

const DIRS = ["down", "left", "right", "up"];
const ANIMS = [
  ...DIRS.map(d => ({ name: `idle-${d}`, frames: 2, fps: 2 })),
  ...DIRS.map(d => ({ name: `walk-${d}`, frames: 4, fps: 8 })),
  { name: "sit-back", frames: 2, fps: 1.5 },
];

function buildFrames(w) {
  const rows = [];
  for (const a of ANIMS) {
    const [kind, dir] = a.name.split("-");
    const row = [];
    for (let f = 0; f < a.frames; f++) {
      if (kind === "sit") row.push(frameSit(w, f));
      else if (dir === "down" || dir === "up") {
        row.push(frameFront(w, dir, kind === "idle" ? { bob: f } : WALK_FRONT[f]));
      } else {
        row.push(frameSide(w, dir, kind === "idle" ? { bob: f } : WALK_SIDE[f]));
      }
    }
    rows.push(row);
  }
  return rows;
}

// ---------------- PNG ----------------
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const chunk = (t, d) => {
    const l = Buffer.alloc(4); l.writeUInt32BE(d.length);
    const td = Buffer.concat([Buffer.from(t), d]);
    const c = Buffer.alloc(4); c.writeUInt32BE(zlib.crc32(td) >>> 0);
    return Buffer.concat([l, td, c]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

function sheetBuffer(rows, cols, scale = 1, bg = null) {
  const sw = cols * W * scale, sh = rows.length * H * scale;
  const buf = Buffer.alloc(sw * sh * 4);
  if (bg) for (let i = 0; i < sw * sh; i++) { buf[i * 4] = bg[0]; buf[i * 4 + 1] = bg[1]; buf[i * 4 + 2] = bg[2]; buf[i * 4 + 3] = 255; }
  rows.forEach((row, r) => row.forEach((c, f) => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = c.p[y][x]; if (!v) continue; const col = hex(v);
      for (let a = 0; a < scale; a++) for (let b = 0; b < scale; b++) {
        const px = (f * W + x) * scale + a, py = (r * H + y) * scale + b, i = (py * sw + px) * 4;
        buf[i] = col[0]; buf[i + 1] = col[1]; buf[i + 2] = col[2]; buf[i + 3] = 255;
      }
    }
  }));
  return { w: sw, h: sh, buf };
}

// ---------------- Saida ----------------
const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, "../../public/assets/characters");
fs.mkdirSync(outDir, { recursive: true });
const COLS = 4;
const manifest = { frameWidth: W, frameHeight: H, columns: COLS, animations: Object.fromEntries(ANIMS.map((a, row) => [a.name, { row, frames: a.frames, fps: a.fps }])) };
const manifestDir = path.resolve(here, "../../src/data");
fs.mkdirSync(manifestDir, { recursive: true });
fs.writeFileSync(path.join(manifestDir, "sprite-manifest.json"), JSON.stringify(manifest, null, 2));

const previews = [];
for (const w of [PEDRO, CATARINA]) {
  const rows = buildFrames(w);
  const s = sheetBuffer(rows, COLS);
  fs.writeFileSync(path.join(outDir, `${w.id}.png`), png(s.w, s.h, s.buf));
  previews.push(sheetBuffer(rows, COLS, 3, hex("#1f2260")));
}
// contact sheet: os dois lado a lado
const [a, b] = previews;
const gap = 24, pw = a.w + b.w + gap, ph = a.h;
const pb = Buffer.alloc(pw * ph * 4);
for (let i = 0; i < pw * ph; i++) { pb[i * 4] = 11; pb[i * 4 + 1] = 16; pb[i * 4 + 2] = 51; pb[i * 4 + 3] = 255; }
for (const [s, ox] of [[a, 0], [b, a.w + gap]]) for (let y = 0; y < s.h; y++) s.buf.copy(pb, (y * pw + ox) * 4, y * s.w * 4, (y + 1) * s.w * 4);
fs.writeFileSync(path.join(here, "sheet-preview.png"), png(pw, ph, pb));
console.log("spritesheets gerados em", outDir);
