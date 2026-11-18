"use strict";
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = 1560,
  H = 1000;
const board = { x: 522, y: 272, cell: 91, n: 5 };
const palette = {
  ink: "#233d40",
  muted: "#6d7b72",
  paper: "#fff9e9",
  coral: "#dc6555",
  green: "#568b6c",
  gold: "#e6af4b",
};
const foods = [
  {
    id: "rice",
    name: "Arroz",
    nick: "Kome",
    color: "#fffcdf",
    shadow: "#d8dab8",
    shape: [
      [0, 0],
      [1, 0],
      [0, 1],
    ],
    kind: "rice",
    friend: "salmon",
    enemy: "tofu",
  },
  {
    id: "salmon",
    name: "Salmão",
    nick: "Sake",
    color: "#f3947e",
    shadow: "#d76555",
    shape: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    kind: "fish",
    friend: "rice",
    enemy: "egg",
  },
  {
    id: "egg",
    name: "Tamago",
    nick: "Tama",
    color: "#f6cb62",
    shadow: "#dca83c",
    shape: [
      [0, 0],
      [1, 0],
    ],
    kind: "egg",
    friend: "broccoli",
    enemy: "salmon",
  },
  {
    id: "broccoli",
    name: "Brócolis",
    nick: "Buro",
    color: "#8fb689",
    shadow: "#598b69",
    shape: [
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    kind: "broccoli",
    friend: "egg",
    enemy: "ume",
  },
  {
    id: "tofu",
    name: "Tofu",
    nick: "Fuku",
    color: "#f0ddc3",
    shadow: "#cbb597",
    shape: [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    kind: "tofu",
    friend: "ume",
    enemy: "rice",
  },
  {
    id: "ume",
    name: "Umeboshi",
    nick: "Ume",
    color: "#ce6c79",
    shadow: "#a44e63",
    shape: [[0, 0]],
    kind: "ume",
    friend: "tofu",
    enemy: "broccoli",
  },
];
const byFood = Object.fromEntries(foods.map((f) => [f.id, f]));
const recipes = [
  {
    name: "Primeira viagem",
    customer: "Haru",
    role: "A estudante",
    line: "Arroz e salmão são melhores amigos. Coloque os dois lado a lado!",
    needs: { rice: 1, salmon: 1 },
    cells: 6,
    bonds: 1,
    conflicts: 0,
    time: 160,
    stamp: "Comece com carinho",
    mood: "student",
  },
  {
    name: "Uma pausa no jardim",
    customer: "Midori",
    role: "A jardineira",
    line: "Tama adora a companhia de Buro. Um bentô com a cor do jardim.",
    needs: { egg: 1, broccoli: 1 },
    cells: 10,
    bonds: 2,
    conflicts: 0,
    time: 170,
    stamp: "Mais verde, por favor",
    mood: "gardener",
  },
  {
    name: "Pequenos contrastes",
    customer: "Sora",
    role: "O ilustrador",
    line: "Tofu e umeboshi se dão tão bem! Só não misture todas as turmas.",
    needs: { tofu: 1, ume: 1, rice: 1 },
    cells: 12,
    bonds: 2,
    conflicts: 0,
    time: 180,
    stamp: "Um toque azedinho",
    mood: "artist",
  },
  {
    name: "Almoço de domingo",
    customer: "Akiko",
    role: "A avó viajante",
    line: "Quero as duas duplas felizes. Separe quem não se entende.",
    needs: { rice: 1, salmon: 1, egg: 1, broccoli: 1 },
    cells: 15,
    bonds: 3,
    conflicts: 0,
    time: 190,
    stamp: "Feito com cuidado",
    mood: "grandma",
  },
  {
    name: "A mesa dos amigos",
    customer: "Ren",
    role: "O chef vizinho",
    line: "Hoje cada ingrediente merece um lugar. Faça os seis se sentirem em casa.",
    needs: { rice: 1, salmon: 1, egg: 1, broccoli: 1, tofu: 1, ume: 1 },
    cells: 18,
    bonds: 3,
    conflicts: 0,
    time: 210,
    stamp: "Seis personalidades",
    mood: "chef",
  },
  {
    name: "O último bentô",
    customer: "Yuki",
    role: "A última passageira",
    line: "O trem vai partir. Levo um pouco de cada um… e um bentô cheio de amizade.",
    needs: { rice: 1, salmon: 1, egg: 1, broccoli: 1, tofu: 1, ume: 1 },
    cells: 22,
    bonds: 4,
    conflicts: 0,
    time: 240,
    stamp: "O último trem • 23:48",
    mood: "traveler",
  },
];
let state = {
  screen: "title",
  level: 0,
  pieces: [],
  stock: {},
  active: null,
  rotation: 0,
  score: 0,
  lives: 3,
  combo: 0,
  timer: 160,
  paused: false,
  sound: true,
  history: [],
  results: [],
  nextId: 1,
  hint: "Escolha um ingrediente para conhecer sua personalidade.",
};
let pointer = { x: -100, y: -100, down: false },
  buttons = [],
  elapsed = 0,
  particles = [],
  toast = null,
  audio = null;
let best = 0;
try {
  best = Number(localStorage.getItem("ultimo-bento-best") || 0);
} catch {}
function rect(x, y, w, h, r = 16, fill = palette.paper, stroke = null) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
function text(
  s,
  x,
  y,
  size = 20,
  color = palette.ink,
  align = "left",
  weight = 500,
) {
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
}
function wrap(s, x, y, width, size = 19, color = palette.ink, line = 27) {
  let row = "";
  for (const word of s.split(" ")) {
    const trial = row + word + " ";
    ctx.font = `500 ${size}px "Trebuchet MS",sans-serif`;
    if (ctx.measureText(trial).width > width && row) {
      text(row, x, y, size, color);
      y += line;
      row = word + " ";
    } else row = trial;
  }
  text(row, x, y, size, color);
  return y + line;
}
function button(label, x, y, w, h, action, style = "dark", enabled = true) {
  const hover =
    pointer.x >= x &&
    pointer.x <= x + w &&
    pointer.y >= y &&
    pointer.y <= y + h;
  const fill = !enabled
    ? "#d8d7c9"
    : style === "light"
      ? "#fff7e5"
      : style === "coral"
        ? hover
          ? "#ed8270"
          : palette.coral
        : hover
          ? "#3b6263"
          : palette.ink;
  rect(x, y + 4, w, h, 12, "#d6c5a4");
  rect(x, y, w, h, 12, fill, style === "light" ? "#ddd2b8" : null);
  text(
    label,
    x + w / 2,
    y + h / 2,
    18,
    style === "light" ? palette.ink : enabled ? "#fff9e9" : "#8d9488",
    "center",
    700,
  );
  buttons.push({ x, y, w, h, action, enabled });
}
function tone(freq = 440, length = 0.1, type = "sine", volume = 0.035) {
  if (!state.sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(volume, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + length);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + length);
  } catch {}
}
function cells(shape, rotation = 0) {
  let a = shape.map((p) => p.slice());
  for (let r = 0; r < rotation % 4; r++) a = a.map(([x, y]) => [-y, x]);
  const minX = Math.min(...a.map((p) => p[0])),
    minY = Math.min(...a.map((p) => p[1]));
  return a.map(([x, y]) => [x - minX, y - minY]);
}
function occupied(p) {
  return cells(byFood[p.type].shape, p.rot).map(([x, y]) => [p.x + x, p.y + y]);
}
function valid(type, x, y, rot, exclude = null) {
  const taken = new Set(
    state.pieces
      .filter((p) => p.id !== exclude)
      .flatMap(occupied)
      .map((p) => p.join(",")),
  );
  return cells(byFood[type].shape, rot).every(
    ([a, b]) =>
      x + a >= 0 &&
      x + a < 5 &&
      y + b >= 0 &&
      y + b < 5 &&
      !taken.has(`${x + a},${y + b}`),
  );
}
function evaluate(pieces = state.pieces) {
  const grid = Array.from({ length: 5 }, () => Array(5).fill(null)),
    counts = {},
    moods = {},
    pairs = new Map();
  let area = 0;
  pieces.forEach((p) => {
    counts[p.type] = (counts[p.type] || 0) + 1;
    moods[p.id] = 0;
    occupied(p).forEach(([x, y]) => {
      if (grid[y] && x >= 0 && x < 5) {
        grid[y][x] = p;
        area++;
      }
    });
  });
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 5; x++) {
      const a = grid[y][x];
      if (!a) continue;
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
      ]) {
        const b = grid[y + dy]?.[x + dx];
        if (b && a.id !== b.id) {
          const key = [a.id, b.id].sort((a, b) => a - b).join("-");
          if (!pairs.has(key)) {
            const relation =
              byFood[a.type].friend === b.type
                ? 1
                : byFood[a.type].enemy === b.type
                  ? -1
                  : 0;
            pairs.set(key, { a, b, relation });
            moods[a.id] += relation;
            moods[b.id] += relation;
          }
        }
      }
    }
  const bonds = [...pairs.values()].filter((p) => p.relation === 1).length,
    conflicts = [...pairs.values()].filter((p) => p.relation === -1).length;
  const recipe = recipes[state.level];
  const needs = Object.entries(recipe.needs).every(
    ([id, n]) => (counts[id] || 0) >= n,
  );
  return {
    grid,
    counts,
    moods,
    pairs,
    bonds,
    conflicts,
    area,
    ready:
      needs &&
      area >= recipe.cells &&
      bonds >= recipe.bonds &&
      conflicts <= recipe.conflicts,
  };
}
function burst(x, y, color, n = 12) {
  for (let i = 0; i < n; i++)
    particles.push({
      x,
      y,
      vx: Math.cos((i / n) * Math.PI * 2) * 70,
      vy: Math.sin((i / n) * Math.PI * 2) * 70 - 35,
      life: 1,
      color,
    });
}
function notify(msg, good = true) {
  toast = { text: msg, life: 3, good };
  tone(good ? 660 : 170, 0.14);
}
function remember() {
  state.history.push(
    JSON.stringify({ pieces: state.pieces, stock: state.stock }),
  );
  if (state.history.length > 35) state.history.shift();
}
function undo() {
  const prev = state.history.pop();
  if (prev) {
    Object.assign(state, JSON.parse(prev));
    state.active = null;
    tone(330);
  }
}
function startLevel() {
  state.pieces = [];
  state.stock = Object.fromEntries(foods.map((f) => [f.id, 3]));
  state.active = null;
  state.rotation = 0;
  state.history = [];
  state.timer = recipes[state.level].time;
  state.screen = "play";
  state.paused = false;
  state.hint =
    "As afinidades contam quando dois ingredientes encostam pelas bordas.";
}
function startGame() {
  state.level = 0;
  state.score = 0;
  state.lives = 3;
  state.combo = 0;
  state.results = [];
  state.nextId = 1;
  startLevel();
}
function deliver() {
  const e = evaluate();
  if (!e.ready) {
    notify("Confira o pedido e acalme as carinhas tristes.", false);
    return;
  }
  const earned =
    500 +
    e.area * 20 +
    e.bonds * 110 +
    Math.floor(state.timer) * 2 +
    state.combo * 100;
  state.score += earned;
  state.combo++;
  state.results.push({
    name: recipes[state.level].name,
    earned,
    bonds: e.bonds,
    area: e.area,
  });
  state.active = null;
  state.screen = "served";
  tone(523, 0.15);
  setTimeout(() => tone(784, 0.2), 140);
  burst(770, 470, "#edb14b", 35);
  if (state.score > best) {
    best = state.score;
    try {
      localStorage.setItem("ultimo-bento-best", best);
    } catch {}
  }
}
function timeout() {
  state.lives--;
  state.combo = 0;
  state.active = null;
  state.screen = state.lives <= 0 ? "gameover" : "missed";
  tone(150, 0.35);
}
function face(x, y, size, mood = 0, seed = 0) {
  const bounce = Math.sin(elapsed * 2.7 + seed) * size * 0.025;
  y += bounce;
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#493d3d";
  ctx.fillStyle = "#493d3d";
  ctx.lineWidth = Math.max(1.5, size * 0.055);
  ctx.lineCap = "round";
  const blink = Math.sin(elapsed * 0.68 + seed) > 0.995;
  for (const side of [-1, 1]) {
    let ex = side * size * 0.17;
    if (mood > 0) {
      ctx.beginPath();
      ctx.arc(ex, -size * 0.03, size * 0.065, Math.PI, Math.PI * 2);
      ctx.stroke();
    } else if (blink) {
      ctx.beginPath();
      ctx.moveTo(ex - 3, -2);
      ctx.lineTo(ex + 3, -2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.ellipse(
        ex,
        -size * 0.04,
        size * 0.033,
        size * 0.055,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.fillStyle = "rgba(226,107,119,.48)";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(
      side * size * 0.28,
      size * 0.08,
      size * 0.075,
      size * 0.04,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.strokeStyle = "#684646";
  ctx.beginPath();
  if (mood < 0) {
    ctx.arc(0, size * 0.24, size * 0.09, Math.PI * 1.16, Math.PI * 1.84);
  } else if (mood > 0) {
    ctx.arc(0, size * 0.065, size * 0.105, 0, Math.PI);
  } else {
    ctx.arc(0, size * 0.08, size * 0.065, 0, Math.PI);
  }
  ctx.stroke();
  if (mood < 0) {
    ctx.strokeStyle = "#668d93";
    ctx.beginPath();
    ctx.moveTo(size * 0.38, -size * 0.24);
    ctx.quadraticCurveTo(size * 0.5, -size * 0.02, size * 0.38, -size * 0.02);
    ctx.stroke();
  }
  ctx.restore();
}
function ingredient(type, x, y, size, mood = 0, seed = 0, showFace = true) {
  const f = byFood[type];
  ctx.save();
  ctx.translate(x, y);
  const s = size;
  ctx.rotate(Math.sin(elapsed * 2 + seed) * 0.025);
  ctx.shadowColor = "rgba(73,52,24,.12)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 3;
  if (f.kind === "rice") {
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, s * 0.27);
    ctx.quadraticCurveTo(-s * 0.55, s * 0.12, -s * 0.28, -s * 0.23);
    ctx.quadraticCurveTo(0, -s * 0.62, s * 0.25, -s * 0.25);
    ctx.quadraticCurveTo(s * 0.55, s * 0.15, s * 0.42, s * 0.3);
    ctx.quadraticCurveTo(0, s * 0.47, -s * 0.42, s * 0.27);
    ctx.fillStyle = f.color;
    ctx.fill();
    ctx.shadowBlur = 0;
    rect(-s * 0.2, s * 0.12, s * 0.4, s * 0.25, 4, "#395a48");
  } else if (f.kind === "fish") {
    rect(-s * 0.45, -s * 0.34, s * 0.9, s * 0.7, s * 0.18, f.color);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#ffe7c0";
    ctx.lineWidth = s * 0.055;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.37 + i * s * 0.22, -s * 0.25);
      ctx.bezierCurveTo(
        -s * 0.05 + i * s * 0.22,
        -s * 0.14,
        -s * 0.1 + i * s * 0.22,
        s * 0.18,
        s * 0.18 + i * s * 0.22,
        s * 0.27,
      );
      ctx.stroke();
    }
  } else if (f.kind === "egg") {
    ctx.fillStyle = "#fffbe8";
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.45, s * 0.35, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.27, s * 0.23, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (f.kind === "broccoli") {
    rect(-s * 0.1, 0, s * 0.2, s * 0.4, 5, "#afc797");
    for (const [a, b, r] of [
      [-0.23, -0.05, 0.23],
      [0.23, -0.05, 0.23],
      [0, -0.22, 0.26],
      [0, 0, 0.29],
    ]) {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(s * a, s * b, s * r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#649973";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-s * 0.18, -s * 0.12, s * 0.1, 3, 5);
    ctx.stroke();
  } else if (f.kind === "tofu") {
    rect(-s * 0.39, -s * 0.34, s * 0.78, s * 0.7, s * 0.12, f.color);
    ctx.shadowBlur = 0;
    rect(-s * 0.33, -s * 0.27, s * 0.66, s * 0.11, 5, "#fff6db");
    ctx.fillStyle = "#c7ad8c";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.sin(i * 9) * s * 0.28,
        Math.cos(i * 7) * s * 0.22,
        s * 0.018,
        0,
        7,
      );
      ctx.fill();
    }
  } else {
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.025, s * 0.36, s * 0.34, 0, 0, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#a65369";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-s * 0.02, s * 0.02, s * 0.24, 3.4, 5.3);
    ctx.stroke();
    ctx.fillStyle = "#7b9b66";
    ctx.beginPath();
    ctx.ellipse(s * 0.12, -s * 0.32, s * 0.16, s * 0.07, -0.6, 0, 7);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  if (showFace) face(0, 0, s * 0.7, mood, seed);
  ctx.restore();
}
function background() {
  ctx.fillStyle = "#f3e8cf";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#263e44";
  ctx.fillRect(0, 0, W, 173);
  for (let i = 0; i < 15; i++) {
    const x = i * 125;
    rect(x + 18, 28, 70, 115, 5, "#324e54");
    ctx.fillStyle = "#f2c075";
    ctx.globalAlpha = 0.23;
    ctx.fillRect(x + 25, 50, 5, 60);
    ctx.globalAlpha = 1;
  }
  // A wooden counter, with fixed grain so offline captures stay reproducible.
  ctx.fillStyle = "#e9cc99";
  ctx.fillRect(0, 805, W, 195);
  for (let i = 0; i < 30; i++) {
    ctx.strokeStyle = i % 3 === 0 ? "#d0aa7330" : "#fff6da40";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 812 + i * 7);
    ctx.bezierCurveTo(450, 802 + i * 7, 1100, 830 + i * 7, W, 810 + i * 7);
    ctx.stroke();
  }
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = "#e06855";
    ctx.fillRect(40 + i * 192, 0, 156, 15);
  }
}
function header() {
  text("夜の弁当", 74, 56, 22, "#f4c77b", "left", 700);
  text("O ÚLTIMO BENTÔ", 74, 103, 45, "#fff4da", "left", 800);
  text("Uma boa combinação muda o fim do dia.", 77, 143, 18, "#bdc9bd");
  rect(930, 43, 175, 88, 14, "#355258");
  text("CAIXA DO TURNO", 950, 65, 12, "#b9ccc2", "left", 700);
  text(
    `${state.score.toLocaleString("pt-BR")} ¥`,
    950,
    100,
    30,
    "#f8d69b",
    "left",
    800,
  );
  rect(1122, 43, 165, 88, 14, "#355258");
  text("PEDIDO", 1143, 65, 12, "#b9ccc2", "left", 700);
  text(`${state.level + 1} / 6`, 1143, 100, 30, "#fff4dc", "left", 800);
  text(
    "♥".repeat(state.lives) + "♡".repeat(3 - state.lives),
    1320,
    75,
    31,
    "#f09b8b",
  );
  button(
    state.sound ? "SOM ON" : "SOM OFF",
    1320,
    108,
    153,
    37,
    () => {
      state.sound = !state.sound;
      tone(500);
    },
    "light",
  );
}
function customer(x, y, kind) {
  ctx.save();
  ctx.translate(x, y);
  const bob = Math.sin(elapsed * 1.8) * 3;
  ctx.translate(0, bob);
  rect(
    -68,
    30,
    136,
    75,
    40,
    kind === "chef" ? "#d9e0d1" : kind === "gardener" ? "#83a78b" : "#dc8a77",
  );
  ctx.fillStyle = "#354848";
  ctx.beginPath();
  ctx.ellipse(0, -10, 68, 74, 0, 0, 7);
  ctx.fill();
  ctx.fillStyle = "#f5d7b4";
  ctx.beginPath();
  ctx.ellipse(0, 0, 53, 60, 0, 0, 7);
  ctx.fill();
  ctx.fillStyle = kind === "grandma" ? "#d6d2bf" : "#374442";
  ctx.beginPath();
  ctx.ellipse(0, -39, 56, 27, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-41, -22, 15, 42, 0.3, 0, 7);
  ctx.fill();
  face(0, 9, 95, state.screen === "served" ? 1 : 0, 3);
  if (kind === "chef") {
    rect(-56, -66, 112, 27, 8, "#fff8e4");
    for (let i = -1; i <= 1; i++) {
      ctx.fillStyle = "#fff8e4";
      ctx.beginPath();
      ctx.arc(i * 31, -69, 25, 0, 7);
      ctx.fill();
    }
  }
  if (kind === "gardener") {
    ctx.fillStyle = "#c4a16a";
    ctx.beginPath();
    ctx.ellipse(0, -48, 88, 12, 0, 0, 7);
    ctx.fill();
    rect(-50, -86, 100, 35, 20, "#d9b884");
  }
  if (kind === "grandma") {
    ctx.strokeStyle = "#877d65";
    ctx.lineWidth = 3;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * 18, 3, 16, 0, 7);
      ctx.stroke();
    }
  }
  ctx.restore();
}
function drawPiece(p, mood, alpha = 1) {
  const a = occupied(p);
  ctx.save();
  ctx.globalAlpha = alpha;
  for (const [x, y] of a) {
    const xx = board.x + x * board.cell,
      yy = board.y + y * board.cell;
    rect(
      xx + 4,
      yy + 5,
      board.cell - 8,
      board.cell - 10,
      16,
      byFood[p.type].shadow,
    );
    rect(
      xx + 4,
      yy + 2,
      board.cell - 8,
      board.cell - 11,
      16,
      byFood[p.type].color,
    );
  }
  const center = a[Math.floor(a.length / 2)];
  ingredient(
    p.type,
    board.x + (center[0] + 0.5) * board.cell,
    board.y + (center[1] + 0.5) * board.cell,
    73,
    mood,
    p.id,
  );
  if (mood !== 0) {
    text(
      mood > 0 ? "♥" : "!",
      board.x + (a[0][0] + 0.12) * board.cell,
      board.y + (a[0][1] + 0.19) * board.cell,
      21,
      mood > 0 ? "#d9616c" : "#80566c",
      "center",
      800,
    );
  }
  ctx.restore();
}
function gameplay() {
  const r = recipes[state.level],
    e = evaluate();
  header();
  rect(55, 202, 370, 566, 22, "#fff8e7", "#ded0b6");
  text("お客様  /  NOSSO CLIENTE", 82, 235, 13, palette.muted, "left", 700);
  customer(240, 365, r.mood);
  text(r.customer, 240, 496, 29, palette.ink, "center", 800);
  text(r.role, 240, 526, 16, palette.muted, "center");
  wrap(r.line, 86, 566, 303, 19, palette.ink, 27);
  const fraction = state.timer / r.time;
  rect(84, 686, 310, 12, 6, "#e9dfc6");
  rect(
    84,
    686,
    Math.max(0, 310 * fraction),
    12,
    6,
    fraction < 0.25 ? palette.coral : "#8cae8d",
  );
  text(`${Math.ceil(state.timer)}s para o trem`, 86, 721, 17, palette.muted);
  text(`COMBO ×${state.combo + 1}`, 391, 721, 16, palette.coral, "right", 800);
  text(r.name, 750, 213, 27, palette.ink, "center", 800);
  text(r.stamp, 750, 244, 15, palette.muted, "center");
  rect(
    board.x - 24,
    board.y - 18,
    board.cell * 5 + 48,
    board.cell * 5 + 40,
    24,
    "#b55e4b",
  );
  rect(
    board.x - 13,
    board.y - 7,
    board.cell * 5 + 26,
    board.cell * 5 + 16,
    16,
    "#e1b681",
  );
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 5; x++) {
      rect(
        board.x + x * board.cell + 3,
        board.y + y * board.cell + 3,
        board.cell - 6,
        board.cell - 6,
        13,
        (x + y) % 2 ? "#f9e7c0" : "#f4ddb3",
      );
      ctx.fillStyle = "#ddc39b";
      ctx.beginPath();
      ctx.arc(
        board.x + (x + 0.5) * board.cell,
        board.y + (y + 0.5) * board.cell,
        2,
        0,
        7,
      );
      ctx.fill();
    }
  state.pieces.forEach((p) =>
    drawPiece(p, e.moods[p.id] || 0, state.active?.id === p.id ? 0.5 : 1),
  );
  if (
    state.active &&
    pointer.x > board.x - 30 &&
    pointer.x < board.x + 510 &&
    pointer.y > board.y - 30 &&
    pointer.y < board.y + 510
  ) {
    const x = Math.floor((pointer.x - board.x) / board.cell),
      y = Math.floor((pointer.y - board.y) / board.cell);
    const ok = valid(state.active.type, x, y, state.rotation, state.active.id);
    for (const [dx, dy] of cells(
      byFood[state.active.type].shape,
      state.rotation,
    )) {
      rect(
        board.x + (x + dx) * board.cell + 5,
        board.y + (y + dy) * board.cell + 5,
        board.cell - 10,
        board.cell - 10,
        12,
        ok ? "#8cac8c99" : "#de706c88",
      );
    }
  }
  rect(1083, 202, 420, 566, 22, "#fff9eb", "#ded0b6");
  text("PEDIDO DA CASA", 1110, 238, 15, palette.muted, "left", 700);
  text(
    "Uma marmita, muitas amizades.",
    1110,
    273,
    21,
    palette.ink,
    "left",
    700,
  );
  let y = 322;
  for (const [id, n] of Object.entries(r.needs)) {
    const done = (e.counts[id] || 0) >= n;
    ingredient(id, 1137, y, 47, done ? 1 : 0, 2);
    text(`${byFood[id].name}`, 1174, y, 19);
    text(
      `${Math.min(e.counts[id] || 0, n)}/${n} ${done ? "✓" : ""}`,
      1471,
      y,
      19,
      done ? palette.green : palette.muted,
      "right",
      700,
    );
    y += 43;
  }
  y = Math.max(y + 12, 462);
  const rules = [
    [`Espaço ocupado`, `${e.area}/${r.cells}`, e.area >= r.cells],
    ["Duplas felizes", `${e.bonds}/${r.bonds}`, e.bonds >= r.bonds],
    ["Vizinhos em conflito", `${e.conflicts} / 0`, e.conflicts === 0],
  ];
  for (const [label, value, done] of rules) {
    text(label, 1110, y, 17, palette.muted);
    text(
      value,
      1470,
      y,
      22,
      done ? palette.green : palette.coral,
      "right",
      800,
    );
    y += 39;
  }
  button(
    e.ready ? "SERVIR COM CARINHO  →" : "COMPLETE O PEDIDO",
    1110,
    686,
    365,
    51,
    deliver,
    "coral",
    e.ready,
  );
  button(
    "↶ Desfazer · Z",
    502,
    762,
    183,
    42,
    undo,
    "light",
    state.history.length > 0,
  );
  button(
    "Girar · R",
    699,
    762,
    144,
    42,
    () => {
      state.rotation = (state.rotation + 1) % 4;
      tone(370);
    },
    "light",
    !!state.active,
  );
  button(
    "Retirar",
    856,
    762,
    141,
    42,
    () => {
      if (state.active?.id) {
        remember();
        const p = state.pieces.find((p) => p.id === state.active.id);
        state.pieces = state.pieces.filter((p) => p.id !== p.id);
        state.stock[p.type]++;
        state.active = null;
      }
    },
    "light",
    !!state.active?.id,
  );
  drawPantry();
  if (state.active) {
    const f = byFood[state.active.type];
    text(
      `${f.nick} ama ${byFood[f.friend].name}  ♥  evita ${byFood[f.enemy].name}`,
      780,
      976,
      18,
      palette.ink,
      "center",
      700,
    );
  } else
    text(
      "ARRASTE ou CLIQUE para escolher  •  R gira  •  Z desfaz  •  Esc pausa",
      780,
      976,
      17,
      palette.ink,
      "center",
    );
}
function drawPantry() {
  text("SEUS PEQUENOS INGREDIENTES", 64, 834, 14, "#715d43", "left", 800);
  text(
    "Encoste os amigos pelas bordas. As carinhas contam como estão se sentindo.",
    1494,
    834,
    16,
    "#715d43",
    "right",
  );
  foods.forEach((f, i) => {
    const x = 62 + i * 248,
      selected = state.active?.type === f.id;
    rect(
      x,
      858,
      235,
      94,
      17,
      selected ? "#fff9e8" : "#f7e7c7",
      selected ? palette.coral : "#d5b883",
    );
    ingredient(f.id, x + 48, 904, 69, selected ? 1 : 0, i);
    text(f.name, x + 94, 884, 18, palette.ink, "left", 800);
    text(`♥ ${byFood[f.friend].name}`, x + 94, 912, 14, palette.green);
    text(
      `×${state.stock[f.id]}`,
      x + 209,
      936,
      15,
      palette.muted,
      "right",
      700,
    );
  });
}
function titleScreen() {
  header();
  text("UM ÚLTIMO PEDIDO.", 780, 229, 18, palette.coral, "center", 800);
  text(
    "Um bentô cheio de personalidade.",
    780,
    287,
    50,
    palette.ink,
    "center",
    800,
  );
  text(
    "Encaixe os ingredientes. Aproxime os amigos. Deixe as carinhas felizes.",
    780,
    339,
    22,
    palette.muted,
    "center",
  );
  rect(391, 397, 778, 280, 30, "#b75e4e");
  rect(408, 411, 744, 247, 22, "#f6dcb0");
  foods.forEach((f, i) => {
    const x = 470 + (i % 3) * 248,
      y = 476 + Math.floor(i / 3) * 126;
    rect(x - 33, y - 37, 236, 105, 17, "#fff0d1");
    ingredient(
      f.id,
      x + 25,
      y + 15,
      88,
      Math.sin(elapsed + i) > -0.4 ? 1 : 0,
      i,
    );
    text(f.nick, x + 90, y + 2, 23, palette.ink, "left", 800);
    text(`♥ ${byFood[f.friend].name}`, x + 90, y + 35, 14, palette.green);
  });
  button("ABRIR A COZINHA  →", 553, 729, 454, 70, startGame, "coral");
  text(
    "6 pedidos • uma cozinha acolhedora • combinações que importam",
    780,
    835,
    19,
    palette.muted,
    "center",
  );
  text(
    `Melhor turno: ${best.toLocaleString("pt-BR")} ¥`,
    780,
    885,
    19,
    palette.ink,
    "center",
    700,
  );
}
function resultOverlay() {
  ctx.fillStyle = "#203c3ce3";
  ctx.fillRect(0, 173, W, H - 173);
  const success = state.screen === "served",
    final = success && state.level === 5;
  rect(430, 249, 700, 558, 27, palette.paper);
  text(
    success
      ? final
        ? "O último trem levou seu carinho."
        : "Um bentô. Um sorriso."
      : "A cozinha pede uma nova chance.",
    780,
    305,
    29,
    palette.ink,
    "center",
    800,
  );
  if (success) {
    foods.forEach((f, i) =>
      ingredient(f.id, 575 + i * 82, 411 + Math.sin(i) * 8, 78, 1, i),
    );
    text(
      final ? "TURNO CONCLUÍDO" : "PEDIDO ENTREGUE",
      780,
      494,
      17,
      palette.green,
      "center",
      800,
    );
    const last = state.results.at(-1);
    text(
      `+ ${last.earned.toLocaleString("pt-BR")} ¥`,
      780,
      549,
      45,
      palette.coral,
      "center",
      800,
    );
    text(
      `${last.bonds} duplas felizes  •  ${last.area} espaços preenchidos`,
      780,
      597,
      20,
      palette.muted,
      "center",
    );
    button(
      final ? "JOGAR OUTRO TURNO" : "PRÓXIMO CLIENTE  →",
      550,
      667,
      460,
      61,
      () => {
        if (final) startGame();
        else {
          state.level++;
          startLevel();
        }
      },
      "coral",
    );
  } else {
    ingredient("rice", 780, 420, 150, -1, 0);
    text(
      state.lives > 0
        ? "O trem partiu antes do pedido ficar pronto."
        : "Os três pedidos foram perdidos.",
      780,
      535,
      21,
      palette.muted,
      "center",
    );
    text(
      `Caixa do turno: ${state.score.toLocaleString("pt-BR")} ¥`,
      780,
      586,
      28,
      palette.ink,
      "center",
      800,
    );
    button(
      state.lives > 0 ? "TENTAR O PEDIDO NOVAMENTE" : "REABRIR A COZINHA",
      550,
      667,
      460,
      61,
      () => (state.lives > 0 ? startLevel() : startGame()),
      "coral",
    );
  }
  button(
    "Voltar ao início",
    630,
    746,
    300,
    39,
    () => {
      state.screen = "title";
    },
    "light",
  );
}
function render() {
  const status = evaluate();
  canvas.setAttribute(
    "aria-label",
    `O Último Bentô. ${state.screen}. Pedido ${state.level + 1} de 6. ${status.area} espaços, ${status.bonds} duplas felizes, ${status.conflicts} conflitos. ${status.ready ? "Pronto para servir." : ""}`,
  );
  buttons = [];
  background();
  if (state.screen === "title") titleScreen();
  else {
    gameplay();
    if (["served", "missed", "gameover"].includes(state.screen))
      resultOverlay();
  }
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, 7);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (toast) {
    rect(440, 184, 680, 48, 14, toast.good ? "#dce9d5" : "#f4d0bb");
    text(toast.text, 780, 208, 18, palette.ink, "center", 700);
  }
  if (state.paused) {
    ctx.fillStyle = "#233d40dc";
    ctx.fillRect(0, 173, W, 827);
    rect(500, 370, 560, 260, 25, palette.paper);
    text("Uma pausa para o chá.", 780, 433, 34, palette.ink, "center", 800);
    button(
      "CONTINUAR",
      620,
      500,
      320,
      58,
      () => (state.paused = false),
      "coral",
    );
  }
}
function pos(event) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - r.left) * W) / r.width,
    y: ((event.clientY - r.top) * H) / r.height,
  };
}
canvas.addEventListener("pointerdown", (event) => {
  const downPosition = pos(event);
  pointer = {
    ...downPosition,
    down: true,
    startX: downPosition.x,
    startY: downPosition.y,
  };
  canvas.focus();
  audio?.resume();
  for (const b of [...buttons].reverse()) {
    if (
      b.enabled &&
      pointer.x >= b.x &&
      pointer.x <= b.x + b.w &&
      pointer.y >= b.y &&
      pointer.y <= b.y + b.h
    ) {
      b.action();
      return;
    }
  }
  if (state.screen !== "play" || state.paused) return;
  for (let i = 0; i < foods.length; i++) {
    if (
      pointer.x >= 62 + i * 248 &&
      pointer.x < 297 + i * 248 &&
      pointer.y >= 858 &&
      pointer.y <= 952
    ) {
      const f = foods[i];
      if (state.stock[f.id] > 0) {
        state.active = { type: f.id };
        state.rotation = 0;
        tone(440 + i * 50);
      }
      return;
    }
  }
  const x = Math.floor((pointer.x - board.x) / board.cell),
    y = Math.floor((pointer.y - board.y) / board.cell);
  if (x >= 0 && x < 5 && y >= 0 && y < 5) {
    const p = evaluate().grid[y][x];
    if (state.active && !p) {
      place(x, y);
    } else if (p) {
      state.active = { type: p.type, id: p.id };
      state.rotation = p.rot;
      tone(380);
    }
  }
});
function place(x, y) {
  const a = state.active;
  if (!a || !valid(a.type, x, y, state.rotation, a.id)) {
    notify("Esse ingrediente precisa de um pouco mais de espaço.", false);
    return;
  }
  remember();
  if (a.id) {
    const p = state.pieces.find((p) => p.id === a.id);
    Object.assign(p, { x, y, rot: state.rotation });
  } else {
    state.pieces.push({
      id: state.nextId++,
      type: a.type,
      x,
      y,
      rot: state.rotation,
    });
    state.stock[a.type]--;
  }
  state.active = null;
  const e = evaluate();
  burst(
    board.x + (x + 0.5) * board.cell,
    board.y + (y + 0.5) * board.cell,
    e.conflicts ? "#d5777f" : "#82ad83",
    9,
  );
  tone(e.conflicts ? 220 : 620, 0.12);
}
canvas.addEventListener("pointermove", (event) => {
  Object.assign(pointer, pos(event));
});
canvas.addEventListener("pointerup", (event) => {
  const p = pos(event);
  const moved = Math.hypot(p.x - pointer.startX, p.y - pointer.startY) > 8;
  if (state.screen === "play" && state.active && pointer.down && moved) {
    const x = Math.floor((p.x - board.x) / board.cell),
      y = Math.floor((p.y - board.y) / board.cell);
    if (x >= 0 && x < 5 && y >= 0 && y < 5) place(x, y);
  }
  pointer.down = false;
});
canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  if (state.active) state.rotation = (state.rotation + 1) % 4;
});
window.addEventListener("keydown", (event) => {
  if (["r", "R", "z", "Z", "Escape", " "].includes(event.key))
    event.preventDefault();
  if (event.key === "Escape" && state.screen === "play") {
    state.paused = !state.paused;
    state.active = null;
  }
  if (state.screen !== "play" || state.paused) return;
  if (event.key.toLowerCase() === "r" && state.active) {
    state.rotation = (state.rotation + 1) % 4;
    tone(420);
  }
  if (event.key.toLowerCase() === "z") undo();
  if (event.key === "Enter") deliver();
});
let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  elapsed += dt;
  if (state.screen === "play" && !state.paused) {
    state.timer -= dt;
    if (state.timer <= 0) {
      state.timer = 0;
      timeout();
    }
  }
  particles.forEach((p) => {
    p.life -= dt * 1.3;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 50 * dt;
  });
  particles = particles.filter((p) => p.life > 0);
  if (toast) {
    toast.life -= dt;
    if (toast.life < 0) toast = null;
  }
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
