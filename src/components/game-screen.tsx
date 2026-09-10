import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScoreTrack } from "@/components/score-track";
import { Standings } from "@/components/standings";
import { ScoreGuide } from "@/components/score-guide";
import { RoundWizard } from "@/components/round-wizard";
import { RulesDialog } from "@/components/rules-dialog";
import { RabbitToken } from "@/components/rabbit-token";
import { useGame } from "@/lib/dixit/store";
import { GOAL_SCORE } from "@/lib/dixit/types";
import { playVictory } from "@/lib/dixit/sfx";

export function GameScreen() {
  const players = useGame((s) => s.players);
  const rounds = useGame((s) => s.rounds);
  const phase = useGame((s) => s.phase);
  const winnerIds = useGame((s) => s.winnerIds);
  const applyRound = useGame((s) => s.applyRound);
  const undoRound = useGame((s) => s.undoRound);
  const nudgeScore = useGame((s) => s.nudgeScore);
  const resetGame = useGame((s) => s.resetGame);
  const newSetup = useGame((s) => s.newSetup);
  const setPhase = useGame((s) => s.setPhase);

  const [wizard, setWizard] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [hopsBusy, setHopsBusy] = useState(false);
  const [winOpen, setWinOpen] = useState(false);
  const celebrated = useRef<string>("");

  const last = rounds[rounds.length - 1];
  const suggestedStorytellerId = useMemo(() => {
    if (!players.length) return "";
    if (!last) return players[0]!.id;
    const idx = players.findIndex((p) => p.id === last.storytellerId);
    return players[(idx + 1) % players.length]!.id;
  }, [players, last]);

  const winners = players.filter((p) => winnerIds.includes(p.id));
  const leader = [...players].sort((a, b) => b.score - a.score)[0];
  const winnerKey = winnerIds.slice().sort().join(",");

  useEffect(() => {
    if (phase !== "finished" || !winners.length) {
      setWinOpen(false);
      if (phase !== "finished") celebrated.current = "";
      return;
    }
    if (hopsBusy) return;
    const t = window.setTimeout(() => setWinOpen(true), 220);
    return () => window.clearTimeout(t);
  }, [phase, winners.length, hopsBusy, winnerKey]);

  useEffect(() => {
    if (!winOpen || !winnerKey || celebrated.current === winnerKey) return;
    celebrated.current = winnerKey;
    playVictory();
  }, [winOpen, winnerKey]);

  if (wizard) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6">
        <RoundWizard
          players={players}
          suggestedStorytellerId={suggestedStorytellerId}
          onCancel={() => setWizard(false)}
          onConfirm={(input) => {
            const err = applyRound(input);
            if (!err) setWizard(false);
            return err;
          }}
        />
      </main>
    );
  }

  return (
    <div className="table-room min-h-dvh lg:h-dvh lg:overflow-hidden">
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-5 pb-28 lg:h-dvh lg:max-w-6xl lg:min-h-0">
      <header className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <div>
          <p className="text-sm text-carve/70">
            라운드 {rounds.length + 1}
            {leader ? ` · 선두 ${leader.name}` : ""}
          </p>
          <h1 className="font-display text-2xl leading-tight text-carve">딕싷 점수판</h1>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"n            variant="ghost"
            size="icon"
            className="text-carve hover:bg-carve/10 hover:text-carve"
            onClick={() => setRulesOpen(true)}
            aria-label="규칙"
          >
            <BookOpen />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-carve hover:bg-carve/10 hover:text-carve"
            onClick={undoRound}
            disabled={!rounds.length}
            aria-label="마지막 라운드 취소"
          >
            <Undo2 />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-carve hover:bg-carve/10 hover:text-carve"
            onClick={() => setResetOpen(true)}
            aria-label="새 게임"
          >
            <RotateCcw />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-6">
        <ScoreTrack players={players} onMovingChange={setHopsBusy} />
        <div className="mt-5 flex flex-col gap-3 lg:mt-0 lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto">
          <Standings players={players} lastRound={last} onNudge={nudgeScore} />
          <ScoreGuide compact />
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-carve/15 bg-table/92 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-2xl lg:max-w-6xl">
          <Button
            type="button"
            size="xl"
            className="w-full"
            onClick={() => setWizard(true)}
          >
            이번 라운드 기록
          </Button>
        </div>
      </div>

      <RulesDialog open={rulesOpen} onOpenChange={setRulesOpen} />

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>새 게임을 시작할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              지금 점수와 라운드 기록은 사라집니다. 같은 멤버로 다시 하거나,
              처음부터 이름을 다시 받을 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetGame();
                setResetOpen(false);
              }}
            >
              같은 멤버로
            </Button>
            <AlertDialogAction
              onClick={() => {
                newSetup();
                setResetOpen(false);
              }}
            >
              멤버부터
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={winOpen}
        onOpenChange={(open) => {
          setWinOpen(open);
          if (!open && phase === "finished") setPhase("play");
        }}
      >
        <DialogContent className="overflow-hidden sm:max-w-md">
          <div className="win-burst" aria-hidden>
            {Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                className="win-petal"
                style={{
                  left: `${8 + ((i * 7) % 84)}%`,
                  animationDelay: `${(i % 7) * 0.08}s`,
                  backgroundColor: [
                    "#2F7A5A",
                    "#E4C64A",
                    "#C42C24",
                    "#1F52A8",
                    "#C85D6A",
                    "#e8b35a",
                  ][i % 6],
                }}
              />
            ))}
          </div>
          <DialogHeader className="relative items-center text-center">
            <p className="text-sm font-medium tracking-wide text-primary">
              반환점 도착
            </p>
            <DialogTitle className="font-display text-3xl">
              {winners.length > 1 ? "공동 승리!" : "승리!"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {winners.length > 1
                ? `${winners.map((w) => w.name).join(", ")}의 토끼가 ${GOAL_SCORE}점에 함께 도착했습니다.`
                : `${winners[0]?.name ?? "플레이어"}의 토끼가 ${GOAL_SCORE}점에 먼저 도착했습니다.`}
            </DialogDescription>
          </DialogHeader>
          <ul className="relative flex flex-col items-center gap-3 py-1">
            {winners.map((p) => (
              <li key={p.id} className="flex w-full items-center gap-3 rounded-lg bg-secondary/70 px-3 py-2">
                <RabbitToken colorId={p.colorId} size="lg" variant="pawn" />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-2xl leading-tight">{p.name}</p>
                  <p className="text-sm text-muted-foreground">승자</p>
                </div>
                <span className="font-display text-3xl tabular-nums text-primary">
                  {p.score}
                </span>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setWinOpen(false);
                setPhase("play");
              }}
            >
              점수 더 보기
            </Button>
            <Button type="button" onClick={newSetup}>
              새 게임
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
    </div>
  );
}
