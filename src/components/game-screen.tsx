import { useMemo, useState } from "react";
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
import { RoundWizard } from "@/components/round-wizard";
import { RulesDialog } from "@/components/rules-dialog";
import { RabbitToken } from "@/components/rabbit-token";
import { useGame } from "@/lib/dixit/store";
import { GOAL_SCORE } from "@/lib/dixit/types";

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

  const last = rounds[rounds.length - 1];
  const suggestedStorytellerId = useMemo(() => {
    if (!players.length) return "";
    if (!last) return players[0]!.id;
    const idx = players.findIndex((p) => p.id === last.storytellerId);
    return players[(idx + 1) % players.length]!.id;
  }, [players, last]);

  const winners = players.filter((p) => winnerIds.includes(p.id));
  const leader = [...players].sort((a, b) => b.score - a.score)[0];

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
    <div className="table-room min-h-dvh">
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-5 pb-28">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm text-carve/70">
            라운드 {rounds.length + 1}
            {leader ? ` · 선두 ${leader.name}` : ""}
          </p>
          <h1 className="font-display text-2xl leading-tight text-carve">딕싯 점수판</h1>
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
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

      <ScoreTrack players={players} />

      <div className="mt-5">
        <Standings players={players} lastRound={last} onNudge={nudgeScore} />
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-carve/15 bg-table/92 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-2xl">
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
        open={phase === "finished" && winners.length > 0}
        onOpenChange={(open) => {
          if (!open) setPhase("play");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>도착</DialogTitle>
            <DialogDescription>
              {GOAL_SCORE}점에 먼저 오른 사람입니다. 같은 라운드에 여러 명이면
              더 높은 점수가 이깁니다.
            </DialogDescription>
          </DialogHeader>
          <ul className="flex flex-col gap-3">
            {winners.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <RabbitToken colorId={p.colorId} size="lg" />
                <span className="font-display text-2xl">{p.name}</span>
                <span className="ml-auto text-2xl tabular-nums">{p.score}</span>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPhase("play")}>
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
