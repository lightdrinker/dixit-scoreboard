import { GOAL_SCORE } from "./types";

export const VB_W = 1000;
export const VB_H = 750;
export const CX = 500;
export const CY = 378;
export const RX = 400;
export const RY = 292;
export const SPACES = GOAL_SCORE + 1;

export function clampSpace(score: number): number {
  return Math.min(GOAL_SCORE, Math.max(0, score));
}

export function rawAngle(index: number): number {
  return (index / SPACES) * Math.PI * 2 + Math.PI / 2;
}

export function angleOf(score: number): number {
  return rawAngle(clampSpace(score));
}

export function trackPoint(score: number, scale = 1) {
  const a = rawAngle(score);
  return {
    x: CX + RX * scale * Math.cos(a),
    y: CY + RY * scale * Math.sin(a),
    rot: (Math.atan2(RY * Math.cos(a), -RX * Math.sin(a)) * 180) / Math.PI,
  };
}

export function trackPercent(score: number) {
  const p = trackPoint(score);
  return {
    left: `${(p.x / VB_W) * 100}%`,
    top: `${(p.y / VB_H) * 100}%`,
  };
}

export function tilePath(index: number, inner = 0.86, outer = 1.13, span = 0.42) {
  const a0 = rawAngle(index - span);
  const a1 = rawAngle(index + span);
  const p = (a: number, s: number) => ({
    x: CX + RX * s * Math.cos(a),
    y: CY + RY * s * Math.sin(a),
  });
  const i0 = p(a0, inner);
  const o0 = p(a0, outer);
  const o1 = p(a1, outer);
  const i1 = p(a1, inner);
  return `M ${i0.x} ${i0.y} L ${o0.x} ${o0.y} L ${o1.x} ${o1.y} L ${i1.x} ${i1.y} Z`;
}
