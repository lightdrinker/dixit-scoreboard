import { cn } from "@/lib/utils";

type ScoreGuideProps = {
  className?: string;
  compact?: boolean;
  detailed?: boolean;
  framed?: boolean;
};

const CASES = [
  {
    title: "일부만 맞춤",
    hint: "한 명이라도, 전원이 아니면",
    points: [
      { who: "스토리텔러", pts: "+3" },
      { who: "맞힌 사람", pts: "+3" },
      { who: "못 맞힌 사람", pts: "0" },
    ],
  },
  {
    title: "전원 맞춤 · 아무도 못 맞춤",
    hint: "힌트가 너무 쉽거나 너무 어려움",
    points: [
      { who: "스토리텔러", pts: "0" },
      { who: "나머지", pts: "+2" },
    ],
  },
] as const;

export function ScoreGuide({
  className,
  compact = false,
  detailed = false,
  framed = true,
}: ScoreGuideProps) {
  if (compact) {
    return (
      <section className={cn("paper-panel rounded-xl p-3", className)}>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg">점수 배정</h2>
          <p className="text-xs text-muted-foreground">30점 도착 승리</p>
        </div>
        <ul className="flex flex-col gap-1.5 text-sm">
          <li className="flex flex-wrap items-baseline justify-between gap-x-3 rounded-md bg-secondary/60 px-3 py-2">
            <span className="text-muted-foreground">일부만 맞춤</span>
            <span className="tabular-nums">
              텔러 <span className="font-display text-primary">+3</span>
              <span className="mx-1.5 text-border">·</span>
              맞힌 사람 <span className="font-display text-primary">+3</span>
            </span>
          </li>
          <li className="flex flex-wrap items-baseline justify-between gap-x-3 rounded-md bg-secondary/60 px-3 py-2">
            <span className="text-muted-foreground">전원 · 없음</span>
            <span className="tabular-nums">
              텔러 <span className="font-display text-muted-foreground">0</span>
              <span className="mx-1.5 text-border">·</span>
              나머지 <span className="font-display text-primary">+2</span>
            </span>
          </li>
          <li className="flex flex-wrap items-baseline justify-between gap-x-3 rounded-md bg-secondary/60 px-3 py-2">
            <span className="text-muted-foreground">미끼</span>
            <span className="tabular-nums">
              표 1장당 <span className="font-display text-primary">+1</span>
            </span>
          </li>
        </ul>
      </section>
    );
  }

  return (
    <section
      className={cn(framed && "paper-panel rounded-xl p-4 sm:p-5", className)}
    >
      <h2 className="font-display text-xl">점수 배정</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        스토리텔러 카드를 누가 골랐는지로 먼저 정하고, 미끼 표는 그다음에
        더합니다. 30점에 먼저 도착하면 이깁니다.
      </p>

      <ol className="mt-4 flex flex-col gap-2">
        {CASES.map((c) => (
          <li key={c.title} className="rounded-lg bg-secondary/70 px-3 py-3">
            <p className="font-medium">{c.title}</p>
            <p className="text-xs text-muted-foreground">{c.hint}</p>
            <div
              className={cn(
                "mt-3 grid gap-2",
                c.points.length === 3 ? "grid-cols-3" : "grid-cols-2",
              )}
            >
              {c.points.map((p) => (
                <div key={p.who} className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{p.who}</p>
                  <p
                    className={cn(
                      "font-display text-2xl leading-none tabular-nums",
                      p.pts === "0" ? "text-muted-foreground" : "text-primary",
                    )}
                  >
                    {p.pts}
                  </p>
                </div>
              ))}
            </div>
          </li>
        ))}

        <li className="rounded-lg bg-secondary/70 px-3 py-3">
          <p className="font-medium">미끼 보너스</p>
          <p className="text-xs text-muted-foreground">
            스토리텔러가 아닌 사람만. 전원 맞춤이면 미끼 표가 없습니다.
          </p>
          <p className="mt-3 font-display text-2xl leading-none text-primary tabular-nums">
            +1{" "}
            <span className="text-sm font-sans font-medium text-muted-foreground">
              내 카드가 받은 표 1장당
            </span>
          </p>
        </li>
      </ol>

      {detailed ? (
        <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
          <li>
            <p className="font-medium">진행</p>
            <p className="text-muted-foreground">
              스토리텔러가 카드와 힌트를 냅니다. 나머지는 힌트에 맞는 카드를
              한 장씩 섞어 놓고, 스토리텔러를 뺀 모두가 투표합니다. 자기
              카드에는 투표할 수 없습니다.
            </p>
          </li>
          <li>
            <p className="font-medium">3인 플레이</p>
            <p className="text-muted-foreground">
              스토리텔러를 제외한 사람은 카드를 2장씩 냅니다. 점수 계산은
              같고, 받은 표는 두 장을 합치면 됩니다.
            </p>
          </li>
        </ol>
      ) : null}
    </section>
  );
}