import { Minus, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RabbitToken } from "@/components/rabbit-token";
import { RABBIT_COLORS } from "@/lib/dixit/colors";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/lib/dixit/types";
import { useGame } from "@/lib/dixit/store";
import { useState } from "react";
import { RulesDialog } from "@/components/rules-dialog";
import { ScoreGuide } from "@/components/score-guide";

export function SetupScreen() {
  const players = useGame((s) => s.players);
  const setPlayerName = useGame((s) => s.setPlayerName);
  const setPlayerColor = useGame((s) => s.setPlayerColor);
  const addPlayer = useGame((s) => s.addPlayer);
  const removePlayer = useGame((s) => s.removePlayer);
  const startGame = useGame((s) => s.startGame);
  const [error, setError] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8 sm:py-12">
      <header className="stagger-in mb-8">
        <p className="text-sm font-medium tracking-wide text-primary">
          테이블용 계산기
        </p>
        <h1 className="font-display mt-1 text-4xl leading-tight text-foreground">
          딕싯 점수판
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          라운드가 끝나면 스토리텔러, 맞힌 사람, 미끼 표만 고르면
          토끼가 공식 규칙대로 칸을 움직입니다. 30칸에 먼저 도착하면 승리입니다.
        </p>
      </header>

      <section className="paper-panel rounded-xl p-4 sm:p-5">
        <h2 className="font-display text-xl">플레이어</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          기본 6명은 실제 딕싯 말 색입니다. 이름만 적고 시작해도 됩니다.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="relative z-10 size-14 shrink-0 touch-manipulation [&_svg]:size-6"
            onClick={() => removePlayer(players[players.length - 1]?.id ?? "")}
            disabled={players.length <= MIN_PLAYERS}
            aria-label="플레이어 빼기"
          >
            <Minus />
          </Button>
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
            <p className="font-display text-4xl leading-none tabular-nums text-foreground">
              {players.length}
              <span className="ml-1 text-2xl text-muted-foreground">명</span>
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {MIN_PLAYERS}–{MAX_PLAYERS}명
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="relative z-10 size-14 shrink-0 touch-manipulation [&_svg]:size-6"
            onClick={addPlayer}
            disabled={players.length >= MAX_PLAYERS}
            aria-label="플레이어 더하기"
          >
            <Plus />
          </Button>
        </div>

        <ul className="mt-5 flex flex-col gap-3">
          {players.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3">
              <button
                type="button"
                className="shrink-0 touch-manipulation rounded-full focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                onClick={() => {
                  const used = new Set(
                    players.filter((x) => x.id !== p.id).map((x) => x.colorId),
                  );
                  const idx = RABBIT_COLORS.findIndex((c) => c.id === p.colorId);
                  for (let k = 1; k <= RABBIT_COLORS.length; k++) {
                    const next =
                      RABBIT_COLORS[(idx + k) % RABBIT_COLORS.length];
                    if (next && !used.has(next.id)) {
                      setPlayerColor(p.id, next.id);
                      return;
                    }
                  }
                }}
                aria-label={`${p.name || `플레이어 ${i + 1}`} 색 바꾸기`}
              >
                <RabbitToken colorId={p.colorId} size="lg" variant="pawn" />
              </button>
              <Input
                value={p.name}
                onChange={(e) => setPlayerName(p.id, e.target.value)}
                placeholder={`플레이어 ${i + 1}`}
                autoComplete="off"
                maxLength={16}
                aria-label={`${i + 1}번 이름`}
              />
            </li>
          ))}
        </ul>

        <p className="mt-3 text-xs text-ink-soft">
          토끼를 누르면 색이 바뀝니다.
        </p>
      </section>

      <ScoreGuide className="mt-4" />

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          size="xl"
          className="flex-1 touch-manipulation"
          onClick={() => setError(startGame())}
        >
          게임 시작
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="touch-manipulation"
          onClick={() => setRulesOpen(true)}
        >
          <BookOpen />
          규칙
        </Button>
      </div>

      <RulesDialog open={rulesOpen} onOpenChange={setRulesOpen} />
    </main>
  );
}
