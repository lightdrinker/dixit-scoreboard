import { useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RabbitToken } from "@/components/rabbit-token";
import { cn } from "@/lib/utils";
import {
  autoFillUniqueVotes,
  maxDecoyVotesFor,
  othersOf,
  outcomeKind,
  remainingDecoyVotes,
  scoreRound,
  validateRound,
  type ScoreInput,
} from "@/lib/dixit/scoring";
import type { Player } from "@/lib/dixit/types";

type RoundWizardProps = {
  players: Player[];
  suggestedStorytellerId: string;
  onCancel: () => void;
  onConfirm: (input: Omit<ScoreInput, "playerIds">) => string | null;
};

export function RoundWizard({
  players,
  suggestedStorytellerId,
  onCancel,
  onConfirm,
}: RoundWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [storytellerId, setStorytellerId] = useState(suggestedStorytellerId);
  const [foundBy, setFoundBy] = useState<string[]>([]);
  const [votesOnCard, setVotesOnCard] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const playerIds = players.map((p) => p.id);
  const others = othersOf(playerIds, storytellerId);
  const voterCount = others.length;
  const kind = outcomeKind(voterCount, foundBy.length);

  const input: ScoreInput = useMemo(
    () => ({
      playerIds,
      storytellerId,
      foundBy,
      votesOnCard: autoFillUniqueVotes({
        playerIds,
        storytellerId,
        foundBy,
        votesOnCard,
      }),
    }),
    [playerIds, storytellerId, foundBy, votesOnCard],
  );

  const remaining = remainingDecoyVotes(input);
  const deltas = scoreRound(input);
  const previewReady = validateRound(input) === null;

  const byId = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  );

  function setOutcome(next: "all" | "none" | "some") {
    if (next === "all") {
      setFoundBy(others);
      setVotesOnCard({});
    } else if (next === "none") {
      setFoundBy([]);
    } else if (foundBy.length === 0 || foundBy.length === others.length) {
      setFoundBy([]);
    }
  }

  function toggleFound(id: string) {
    setFoundBy((cur) => {
      const has = cur.includes(id);
      const next = has ? cur.filter((x) => x !== id) : [...cur, id];
      return next;
    });
    setVotesOnCard({});
  }

  function bumpVote(id: string, dir: 1 | -1) {
    setVotesOnCard((cur) => {
      const filled = autoFillUniqueVotes({
        playerIds,
        storytellerId,
        foundBy,
        votesOnCard: cur,
      });
      const current = filled[id] ?? 0;
      const max = maxDecoyVotesFor(id, {
        playerIds,
        storytellerId,
        foundBy,
        votesOnCard: filled,
      });
      const nextVal = Math.min(max, Math.max(0, current + dir));
      if (dir === 1 && remainingDecoyVotes({
        playerIds,
        storytellerId,
        foundBy,
        votesOnCard: filled,
      }) <= 0) {
        return filled;
      }
      return { ...filled, [id]: nextVal };
    });
  }

  function goNext() {
    setError(null);
    if (step === 1) {
      setStep(2);
      return;
    }
    if (step === 2) {
      if (kind === "all") {
        setVotesOnCard({});
        setStep(3);
        return;
      }
      const filled = autoFillUniqueVotes({
        playerIds,
        storytellerId,
        foundBy,
        votesOnCard,
      });
      setVotesOnCard(filled);
      setStep(3);
    }
  }

  function submit() {
    const msg = onConfirm({
      storytellerId,
      foundBy,
      votesOnCard: input.votesOnCard,
    });
    setError(msg);
  }

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="돌아가기">
          <ArrowLeft />
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">이번 라운드 · {step}/3</p>
          <h2 className="font-display text-2xl leading-tight">
            {step === 1 && "스토리텔러"}
            {step === 2 && "누가 맞혔나요"}
            {step === 3 && "점수 확인"}
          </h2>
        </div>
      </div>

      {step === 1 ? (
        <div className="grid grid-cols-1 gap-2">
          {players.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setStorytellerId(p.id);
                setFoundBy([]);
                setVotesOnCard({});
              }}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-lg px-3 text-left shadow-border transition-[background-color,box-shadow] duration-150",
                storytellerId === p.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-secondary",
              )}
            >
              <RabbitToken colorId={p.colorId} size="md" />
              <span className="text-base font-medium">{p.name}</span>
              {storytellerId === p.id ? (
                <Check className="ml-auto size-4" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={kind === "all" ? "default" : "outline"}
              onClick={() => setOutcome("all")}
            >
              전원
            </Button>
            <Button
              type="button"
              variant={kind === "none" ? "default" : "outline"}
              onClick={() => setOutcome("none")}
            >
              없음
            </Button>
            <Button
              type="button"
              variant={kind === "some" ? "default" : "outline"}
              onClick={() => setOutcome("some")}
            >
              일부
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {kind === "all" && "스토리텔러 0점, 나머지 각자 +2. 미끼 표는 없습니다."}
            {kind === "none" && "스토리텔러 0점, 나머지 각자 +2. 표는 전부 미끼로 갑니다."}
            {kind === "some" && "스토리텔러와 맞힌 사람 +3. 나머지 표는 미끼 보너스."}
          </p>
          <ul className="flex flex-col gap-2">
            {others.map((id) => {
              const p = byId.get(id);
              if (!p) return null;
              const on = foundBy.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleFound(id)}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-lg px-3 text-left shadow-border transition-[background-color] duration-150",
                    on ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary",
                  )}
                >
                  <RabbitToken colorId={p.colorId} />
                  <span className="font-medium">{p.name}</span>
                  <span className="ml-auto text-sm opacity-80">
                    {on ? "맞춤" : "못 맞춤"}
                  </span>
                </button>
              );
            })}
          </ul>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-5">
          {kind !== "all" ? (
            <div>
              <div className="mb-3 flex items-end justify-between">
                <p className="font-medium">미끼 카드가 받은 표</p>
                <p
                  className={cn(
                    "text-sm tabular-nums",
                    remaining === 0 ? "text-muted-foreground" : "text-destructive",
                  )}
                >
                  남은 표 {remaining}
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {others.map((id) => {
                  const p = byId.get(id);
                  if (!p) return null;
                  const votes = input.votesOnCard[id] ?? 0;
                  const max = maxDecoyVotesFor(id, input);
                  return (
                    <li
                      key={id}
                      className="flex min-h-14 items-center gap-3 rounded-lg bg-card px-3 shadow-border"
                    >
                      <RabbitToken colorId={p.colorId} />
                      <span className="flex-1 font-medium">{p.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-11"
                          disabled={votes <= 0}
                          onClick={() => bumpVote(id, -1)}
                          aria-label={`${p.name} 표 줄이기`}
                        >
                          −
                        </Button>
                        <span className="w-8 text-center text-lg tabular-nums">
                          {votes}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-11"
                          disabled={votes >= max || remaining <= 0}
                          onClick={() => bumpVote(id, 1)}
                          aria-label={`${p.name} 표 늘리기`}
                        >
                          +
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              전원이 맞혀서 미끼 표는 없습니다.
            </p>
          )}

          <div className="paper-panel rounded-lg p-4">
            <p className="mb-3 text-sm text-muted-foreground">이번 라운드 점수</p>
            <ul className="flex flex-col gap-2">
              {players.map((p) => {
                const d = deltas[p.id] ?? 0;
                return (
                  <li key={p.id} className="flex items-center gap-3">
                    <RabbitToken colorId={p.colorId} size="sm" />
                    <span className="flex-1">{p.name}</span>
                    {p.id === storytellerId ? (
                      <span className="text-xs text-muted-foreground">텔러</span>
                    ) : null}
                    <span
                      className={cn(
                        "w-12 text-right font-medium tabular-nums",
                        d > 0 ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {d > 0 ? `+${d}` : d}
                    </span>
                    <span className="w-10 text-right text-sm tabular-nums text-muted-foreground">
                      {p.score + d}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        {step > 1 ? (
          <Button type="button" variant="outline" size="lg" onClick={() => setStep((s) => (s === 3 ? 2 : 1))}>
            이전
          </Button>
        ) : null}
        {step < 3 ? (
          <Button type="button" size="lg" className="flex-1" onClick={goNext}>
            다음
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={!previewReady}
            onClick={submit}
          >
            라운드 확정
          </Button>
        )}
      </div>
    </section>
  );
}
