import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RabbitToken } from "@/components/rabbit-token";
import type { Player, RoundRecord } from "@/lib/dixit/types";
import { cn } from "@/lib/utils";

type StandingsProps = {
  players: Player[];
  lastRound?: RoundRecord;
  onNudge: (id: string, delta: number) => void;
};

export function Standings({ players, lastRound, onNudge }: StandingsProps) {
  return (
    <section className="paper-panel rounded-xl p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl">플레이어</h2>
        <p className="text-sm text-muted-foreground">보정은 ±1 · 자리는 그대로</p>
      </div>
      <ol className="flex flex-col gap-2">
        {players.map((p, i) => {
          const delta = lastRound?.deltas[p.id] ?? 0;
          return (
            <li
              key={p.id}
              className="flex min-h-12 items-center gap-2 rounded-md bg-secondary/60 px-2 py-1"
            >
              <span className="w-5 text-center text-sm tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <RabbitToken colorId={p.colorId} size="sm" variant="pawn" />
              <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
              {delta ? (
                <span
                  className={cn(
                    "text-sm tabular-nums",
                    delta > 0 ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              ) : null}
              <span className="w-8 text-right text-lg tabular-nums">{p.score}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10"
                onClick={() => onNudge(p.id, -1)}
                aria-label={`${p.name} 1점 빼기`}
              >
                <Minus />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10"
                onClick={() => onNudge(p.id, 1)}
                aria-label={`${p.name} 1점 더하기`}
              >
                <Plus />
              </Button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
