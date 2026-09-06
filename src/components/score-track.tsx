import { useEffect, useMemo, useRef, useState } from "react";
import { GOAL_SCORE, type Player } from "@/lib/dixit/types";
import { rabbitColor } from "@/lib/dixit/colors";
import { RabbitToken } from "@/components/rabbit-token";
import {
  CX,
  CY,
  SPACES,
  VB_H,
  VB_W,
  clampSpace,
  tilePath,
  trackPercent,
  trackPoint,
} from "@/lib/dixit/track";
import { cn } from "@/lib/utils";

const LABELS = [0, 5, 10, 15, 20, 25, 30];
const CELLS = Array.from({ length: SPACES }, (_, i) => i);
const OUTER_RX = 468;
const OUTER_RY = 342;
const INNER_RX = 328;
const INNER_RY = 238;

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
  const spaceRef = useRef(target);
  const runId = useRef(0);

  useEffect(() => {
    const id = ++runId.current;
    if (prefersReducedMotion()) {
      spaceRef.current = target;
      setSpace(target);
      setHopping(false);
      return;
    }
    const delta = Math.abs(target - spaceRef.current);
    if (delta === 0) return;
    if (delta > 12) {
      spaceRef.current = target;
      setSpace(target);
      setHopping(false);
      return;
    }

    let cancelled = false;
    const stepMs = delta > 6 ? 120 : 190;

    void (async () => {
      while (!cancelled && id === runId.current && spaceRef.current !== target) {
        const dir = target > spaceRef.current ? 1 : -1;
        spaceRef.current += dir;
        setHopping(true);
        setSpace(spaceRef.current);
        await new Promise((r) => setTimeout(r, stepMs));
        if (cancelled || id !== runId.current) return;
        setHopping(false);
        await new Promise((r) => setTimeout(r, 28));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [target]);

  return { space, hopping };
}

function TrackPawn({
  player,
  stackIndex,
  stackCount,
}: {
  player: Player;
  stackIndex: number;
  stackCount: number;
}) {
  const { space, hopping } = useHoppingSpace(player.score);
  const hopRef = useRef<HTMLDivElement>(null);
  const pos = trackPercent(space);
  const offset = (stackIndex - (stackCount - 1) / 2) * 11;

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
        transform: `translate(-50%, -88%) translate(${offset}px, ${stackIndex * -7}px)`,
        zIndex: 10 + stackIndex,
      }}
    >
      <div ref={hopRef}>
        <RabbitToken
          colorId={player.colorId}
          size="lg"
          variant="pawn"
          label={`${player.name} ${player.score}점`}
        />
      </div>
    </div>
  );
}

type ScoreTrackProps = {
  players: Player[];
};

export function ScoreTrack({ players }: ScoreTrackProps) {
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
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="relative aspect-4/3 w-full">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="h-full w-full"
          role="img"
          aria-label="0점에서 30점까지 조각된 나무 점수 트랙"
        >
          <defs>
            <pattern
              id="wood-fill"
              patternUnits="userSpaceOnUse"
              width={VB_W}
              height={VB_H}
            >
              <image
                href="/textures/wood.jpg"
                width={VB_W}
                height={VB_H}
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
            <pattern
              id="felt-fill"
              patternUnits="userSpaceOnUse"
              width={VB_W}
              height={VB_H}
            >
              <image
                href="/textures/felt.jpg"
                width={VB_W}
                height={VB_H}
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
            <filter id="board-shadow" x="-14%" y="-10%" width="128%" height="132%">
              <feDropShadow
                dx="0"
                dy="18"
                stdDeviation="16"
                floodColor="rgb(8 4 2)"
                floodOpacity="0.55"
              />
            </filter>
          </defs>

          <ellipse
            cx={CX}
            cy={CY}
            rx={OUTER_RX}
            ry={OUTER_RY}
            fill="url(#wood-fill)"
            filter="url(#board-shadow)"
          />
          <ellipse
            cx={CX}
            cy={CY}
            rx={OUTER_RX}
            ry={OUTER_RY}
            fill="url(#wood-fill)"
          />
          <ellipse
            cx={CX}
            cy={CY}
            rx={OUTER_RX - 10}
            ry={OUTER_RY - 8}
            fill="none"
            stroke="rgb(250 230 200 / 0.14)"
            strokeWidth="5"
          />

          <ellipse
            cx={CX}
            cy={CY + 3}
            rx={INNER_RX}
            ry={INNER_RY}
            fill="rgb(8 4 2 / 0.45)"
          />
          <ellipse
            cx={CX}
            cy={CY}
            rx={INNER_RX}
            ry={INNER_RY}
            fill="url(#felt-fill)"
          />
          <ellipse
            cx={CX}
            cy={CY}
            rx={INNER_RX}
            ry={INNER_RY}
            fill="none"
            stroke="rgb(10 6 4 / 0.55)"
            strokeWidth="6"
          />

          {CELLS.map((n) => {
            const p = trackPoint(n);
            const major = LABELS.includes(n);
            const finish = n === GOAL_SCORE;
            const start = n === 0;
            return (
              <g key={n}>
                <path
                  d={tilePath(n, 0.84, 1.145, 0.39)}
                  fill="url(#wood-fill)"
                  stroke="rgb(12 6 3 / 0.55)"
                  strokeWidth="1.6"
                />
                <path
                  d={tilePath(n, 0.84, 1.145, 0.39)}
                  fill={
                    finish
                      ? "rgb(62 107 98 / 0.45)"
                      : start
                        ? "rgb(20 10 6 / 0.28)"
                        : "rgb(20 10 6 / 0.22)"
                  }
                />
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--color-carve)"
                  fontSize={major ? 18 : 13}
                  fontFamily="var(--font-display)"
                  fontWeight={major ? 600 : 500}
                  opacity={major ? 0.95 : 0.78}
                >
                  {n}
                </text>
              </g>
            );
          })}

          <ellipse
            cx={CX}
            cy={CY}
            rx={OUTER_RX}
            ry={OUTER_RY}
            fill="none"
            stroke="rgb(12 6 3 / 0.65)"
            strokeWidth="3"
          />
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
            />
          );
        })}
      </div>

      <ol className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2">
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
