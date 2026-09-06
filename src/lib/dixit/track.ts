import { GOAL_SCORE } from "./types";

export const VB_W = 1000;
export const VB_H = 1000;
export const SPACES = GOAL_SCORE + 1;

export type Stone = {
  i: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot: number;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function nrand(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function along(
  count: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    return { x: lerp(x0, x1, t), y: lerp(y0, y1, t) };
  });
}

function buildStones(): Stone[] {
  // Clockwise from top-left 0, matching the boxed board:
  // left 0–8, bottom 9–14, right 15–22, top 23–30.
  const left = along(9, 108, 112, 116, 886);
  const bottom = along(7, 116, 886, 886, 888).slice(1);
  const right = along(9, 886, 888, 884, 116).slice(1);
  const top = along(10, 884, 116, 108, 112).slice(1, -1);
  const raw = [...left, ...bottom, ...right, ...top];

  return raw.map((p, i) => {
    const jx = (nrand(i, 1) - 0.5) * 16;
    const jy = (nrand(i, 2) - 0.5) * 14;
    return {
      i,
      x: p.x + jx,
      y: p.y + jy,
      rx: 30 + nrand(i, 3) * 8,
      ry: 24 + nrand(i, 4) * 7,
      rot: (nrand(i, 5) - 0.5) * 50,
    };
  });
}

export const STONES: Stone[] = buildStones();

export function clampSpace(score: number): number {
  return Math.min(GOAL_SCORE, Math.max(0, score));
}

export function trackPoint(score: number) {
  const s = STONES[clampSpace(score)] ?? STONES[0]!;
  return { x: s.x, y: s.y, rot: s.rot };
}

export function trackPercent(score: number) {
  const p = trackPoint(score);
  return {
    left: `${(p.x / VB_W) * 100}%`,
    top: `${(p.y / VB_H) * 100}%`,
  };
}
