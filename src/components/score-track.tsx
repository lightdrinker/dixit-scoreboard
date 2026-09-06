import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Player } from "@/lib/dixit/types";
import { rabbitColor } from "@/lib/dixit/colors";
import { RabbitToken } from "@/components/rabbit-token";
import {
  SPACES,
  STONES,
  VB_H,
  VB_W,
  clampSpace,
  trackPercent,
} from "@/lib/dixit/track";
import { playBoing } from "@/lib/dixit/sfx";
import { cn } from "@/lib/utils";

const CELLS = Array.from({ length: SPACES }, (_, i) => i);

const STONE_FILL = ["#3f4c3c", "#465447", "#3a463b", "#4a5648", "#414d40"];

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useHoppingSpace(score: number) {
  const target = clampSpace(score);
  const [space, setSpace] = useState(target);
  const [hopping, setHopping] = useState(false);
  const [moving, setMoving] = useState(false);
  const spaceRef = useRef(target);
  const runId = useRef(0);

  useEffect(() => {
    const id = ++runId.current;
    if (prefersReducedMotion()) {
      if (spaceRef.current !== target) playBoing();
      spaceRef.current = target;
      setSpace(target);
      setHopping(false);
      setMoving(false);
      return;
    }
    const delta = Math.abs(target - spaceRef.current);
    if (delta === 0) return;
    if (delta > 12) {
      playBoing();
      spaceRef.current = target;
      setSpace(target);
      setHopping(false);
      setMoving(false);
      return;
    }

    let cancelled = false;
    const stepMs = delta > 6 ? 120 : 190;
    setMoving(true);

    void (async () => {
      while (!cancelled && id === runId.current && spaceRef.current !== target) {
        const dir = target > spaceRef.current ? 1 : -1;
        spaceRef.current += dir;
        setHopping(true);
        setSpace(spaceRef.current);
        playBoing();
        await new Promise((r) => setTimeout(r, stepMs));
        if (cancelled || id !== runId.current) return;
        setHopping(false);
        await new Promise((r) => setTimeout(r, 28));
      }
      if (!cancelled && id === runId.current) setMoving(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [target]);

  return { space, hopping, moving };
}

function TrackPawn({
  player,
  stackIndex,
  stackCount,
  onMovingChange,
}: {
  player: Player;
  stackIndex: number;
  stackCount: number;
  onMovingChange?: (id: string, moving: boolean) => void;
}) {
  const { space, hopping, moving } = useHoppingSpace(player.score);
  const hopRef = useRef<HTMLDivElement>(null);
  const pos = trackPercent(space);
  const offset = (stackIndex - (stackCount - 1) / 2) * 11;

  useEffect(() => {
    onMovingChange?.(player.id, moving);
    return () => onMovingChange?.(player.id, false);
  }, [moving, onMovingChange, player.id]);

  useEffect(() => {
    const el = hopRef.current;
    if (!el || !hopping) return;
    el.classList.remove("track-hop");
    void el.offsetWidth;
    el.classList.add("track-hop");
  }, [hopping, space]);

  return (
    <div
      className="track-pawn"
      style={{
        left: pos.left,
        top: pos.top,
        transform: `translate(-50%, -62%) translate(${offset}px, ${stackIndex * -7}px)`,
        zIndex: 10 + stackIndex,
      }}
    >
      <div ref={hopRef}>
        <RabbitToken
          colorId={player.colorId}
          size="md"
          variant="pawn"
          label={`${player.name} ${player.score}점`}
        />
      </div>
    </div>
  );
}

function Flower({
  x,
  y,
  color,
  s = 1,
  rot = 0,
}: {
  x: number;
  y: number;
  color: string;
  s?: number;
  rot?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx="0"
          cy="-5.4"
          rx="2.6"
          ry="5.2"
          fill={color}
          transform={`rotate(${a})`}
        />
      ))}
      <circle r="2.4" fill="#f0d36a" />
    </g>
  );
}

function Mushroom({
  x,
  y,
  s = 1,
  rot = 0,
}: {
  x: number;
  y: number;
  s?: number;
  rot?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x="-3.2" y="-5" width="6.4" height="11" rx="2.2" fill="#efe6d2" />
      <ellipse cx="0" cy="-8" rx="11" ry="7.2" fill="#c44538" />
      <path d="M-11 -8 A11 7.2 0 0 1 11 -8 L7 -2 Q0 2 -7 -2 Z" fill="#c44538" />
      <circle cx="-4" cy="-9" r="1.7" fill="#f7f0e4" />
      <circle cx="3.2" cy="-7.2" r="1.3" fill="#f7f0e4" />
      <circle cx="1" cy="-11.2" r="1.1" fill="#f7f0e4" />
    </g>
  );
}

const FLOWERS: { x: number; y: number; color: string; s: number; rot: number }[] = [
  { x: 168, y: 210, color: "#e8c14a", s: 1, rot: -12 },
  { x: 78, y: 250, color: "#7ea3d8", s: 0.85, rot: 20 },
  { x: 200, y: 430, color: "#d86aa0", s: 1.05, rot: 8 },
  { x: 70, y: 520, color: "#e8c14a", s: 0.8, rot: -30 },
  { x: 230, y: 760, color: "#c97ad4", s: 0.95, rot: 16 },
  { x: 300, y: 920, color: "#e8c14a", s: 0.9, rot: -8 },
  { x: 470, y: 930, color: "#7ea3d8", s: 0.75, rot: 24 },
  { x: 620, y: 910, color: "#e8c14a", s: 1, rot: 10 },
  { x: 790, y: 760, color: "#d86aa0", s: 0.9, rot: -18 },
  { x: 930, y: 620, color: "#c97ad4", s: 0.85, rot: 6 },
  { x: 250, y: 70, color: "#c97ad4", s: 0.8, rot: 14 },
  { x: 430, y: 58, color: "#7ea3d8", s: 0.7, rot: -22 },
  { x: 700, y: 64, color: "#e8c14a", s: 0.85, rot: 18 },
  { x: 820, y: 210, color: "#d86aa0", s: 0.75, rot: -10 },
  { x: 310, y: 250, color: "#e8c14a", s: 0.7, rot: 28 },
];

const MUSHROOMS: { x: number; y: number; s: number; rot: number }[] = [
  { x: 186, y: 628, s: 1.15, rot: -8 },
  { x: 214, y: 646, s: 0.78, rot: 12 },
  { x: 164, y: 654, s: 0.62, rot: -16 },
  { x: 788, y: 168, s: 1, rot: 10 },
  { x: 818, y: 186, s: 0.7, rot: -14 },
  { x: 842, y: 820, s: 1.05, rot: 6 },
  { x: 868, y: 838, s: 0.72, rot: -10 },
  { x: 250, y: 148, s: 0.85, rot: 8 },
  { x: 272, y: 162, s: 0.55, rot: -18 },
];

type ScoreTrackProps = {
  players: Player[];
  onMovingChange?: (moving: boolean) => void;
};

export function ScoreTrack({ players, onMovingChange }: ScoreTrackProps) {
  const movingIds = useRef(new Set<string>());
  const onMovingRef = useRef(onMovingChange);
  onMovingRef.current = onMovingChange;
  const reportMoving = useCallback((id: string, moving: boolean) => {
    if (moving) movingIds.current.add(id);
    else movingIds.current.delete(id);
    onMovingRef.current?.(movingIds.current.size > 0);
  }, []);
  const stacks = useMemo(() => {
    const map = new Map<number, Player[]>();
    for (const p of players) {
      const space = clampSpace(p.score);
      const list = map.get(space) ?? [];
      list.push(p);
      map.set(space, list);
    }
    return map;
  }, [players]);

  const visualStacks = useMemo(() => {
    const map = new Map<string, { stackIndex: number; stackCount: number }>();
    for (const [, group] of stacks) {
      group.forEach((p, i) => {
        map.set(p.id, { stackIndex: i, stackCount: group.length });
      });
    }
    return map;
  }, [stacks]);

  return (
    <div className="score-board-shell">
      <div className="relative aspect-square w-full">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="h-full w-full"
          role="img"
          aria-label="0점에서 30점까지 잔디 위 돌 점수 보드"
        >
          <defs>
            <linearGradient id="box-rim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8b35a" />
              <stop offset="100%" stopColor="#c88c32" />
            </linearGradient>
            <linearGradient id="grass-base" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7db553" />
              <stop offset="45%" stopColor="#6fa74a" />
              <stop offset="100%" stopColor="#5e973e" />
            </linearGradient>
            <linearGradient id="well-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d7b45a" />
              <stop offset="100%" stopColor="#b8903a" />
            </linearGradient>
            <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9fd0e8" />
              <stop offset="50%" stopColor="#6eafd4" />
              <stop offset="100%" stopColor="#5a9cc4" />
            </linearGradient>
            <filter id="board-shadow" x="-8%" y="-6%" width="116%" height="120%">
              <feDropShadow
                dx="0"
                dy="14"
                stdDeviation="12"
                floodColor="rgb(8 4 2)"
                floodOpacity="0.5"
              />
            </filter>
          </defs>

          <rect
            x="18"
            y="18"
            width="964"
            height="964"
            rx="14"
            fill="url(#box-rim)"
            filter="url(#board-shadow)"
          />
          <rect
            x="36"
            y="36"
            width="928"
            height="928"
            rx="6"
            fill="url(#grass-base)"
          />

          <ellipse cx="220" cy="280" rx="140" ry="90" fill="#8fbf62" opacity="0.35" />
          <ellipse cx="740" cy="760" rx="160" ry="110" fill="#5a8f3c" opacity="0.28" />
          <ellipse cx="500" cy="180" rx="180" ry="70" fill="#88b85a" opacity="0.22" />

          <path
            d="M760 40 C820 90 900 150 870 230 C930 300 860 360 900 430 C940 500 860 540 880 620 C900 680 840 720 820 780"
            fill="none"
            stroke="url(#river)"
            strokeWidth="78"
            strokeLinecap="round"
            opacity="0.92"
          />
          <path
            d="M768 56 C824 104 886 160 862 232 C918 298 852 358 892 428"
            fill="none"
            stroke="#c5e4f4"
            strokeWidth="28"
            strokeLinecap="round"
            opacity="0.45"
          />

          {FLOWERS.map((f, i) => (
            <Flower key={`f-${i}`} {...f} />
          ))}
          {MUSHROOMS.map((m, i) => (
            <Mushroom key={`m-${i}`} {...m} />
          ))}

          <rect x="338" y="338" width="324" height="324" rx="10" fill="url(#well-wall)" />
          <rect x="354" y="354" width="292" height="292" rx="6" fill="#4e7a38" />
          <rect
            x="354"
            y="354"
            width="292"
            height="292"
            rx="6"
            fill="rgb(20 30 8 / 0.28)"
          />
          <rect
            x="362"
            y="362"
            width="276"
            height="276"
            rx="4"
            fill="none"
            stroke="rgb(40 28 8 / 0.28)"
            strokeWidth="3"
          />

          {CELLS.map((n) => {
            const s = STONES[n]!;
            return (
              <g key={n} transform={`translate(${s.x} ${s.y}) rotate(${s.rot})`}>
                <ellipse
                  cx="1.5"
                  cy="3"
                  rx={s.rx}
                  ry={s.ry}
                  fill="rgb(20 28 12 / 0.28)"
                />
                <ellipse
                  cx="0"
                  cy="0"
                  rx={s.rx}
                  ry={s.ry}
                  fill={STONE_FILL[n % STONE_FILL.length]}
                />
                <ellipse
                  cx={-s.rx * 0.18}
                  cy={-s.ry * 0.22}
                  rx={s.rx * 0.42}
                  ry={s.ry * 0.32}
                  fill="rgb(255 255 255 / 0.07)"
                />
              </g>
            );
          })}

          {CELLS.map((n) => {
            const s = STONES[n]!;
            const major = n % 5 === 0;
            return (
              <text
                key={`n-${n}`}
                x={s.x}
                y={s.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#f4f0e6"
                fontSize={major ? 22 : 16}
                fontFamily="var(--font-display)"
                fontWeight={major ? 600 : 500}
              >
                {n}
              </text>
            );
          })}
        </svg>

        {players.map((player) => {
          const stack = visualStacks.get(player.id) ?? {
            stackIndex: 0,
            stackCount: 1,
          };
          return (
            <TrackPawn
              key={player.id}
              player={player}
              stackIndex={stack.stackIndex}
              stackCount={stack.stackCount}
              onMovingChange={reportMoving}
            />
          );
        })}
      </div>

      <ol className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2 lg:hidden">
        {players.map((p) => {
          const color = rabbitColor(p.colorId);
          return (
            <li key={p.id} className="flex items-center gap-1.5 text-sm text-carve">
              <span
                className={cn("size-2 rounded-full")}
                style={{ backgroundColor: color.hex }}
              />
              <span>{p.name}</span>
              <span className="tabular-nums text-carve/70">{p.score}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
