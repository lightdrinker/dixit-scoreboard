import { cn } from "@/lib/utils";

type ScoreGuideProps = {
  compact?: boolean;
  className?: string;
};

const ROWS = [
  {
    when: "일부만 맞춤",
    hops: [
      ["스토리텔러", "3칸"],
      ["맞힌 사람", "3칸"],
    ],
  },
  {
    when: "전부 맞히거나 아무도 못 맞춤",
    hops: [
      ["스토리텔러", "0칸"],
      ["나머지", "2칸"],
    ],
  },
  {
    when: "내 카드에 표",
    hops: [["표 1장마다", "+1칸"]],
  },
] as const;

export function ScoreGuide({ compact = false, className }: ScoreGuideProps) {
  return (
    <section
      className={cn(
        "paper-panel rounded-xl",
        compact ? "p-3" : "p-4 sm:p-5",
        className,
      )}
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl">몇 칸 움직일까</h2>
        <p className="text-xs text-muted-foreground">1점 = 1칸 · 30칸 도착 승리</p>
      </div>
      <ul className="flex flex-col gap-2">
        {ROWS.map((row) => (
          <li
            key={row.when}
            className="rounded-md bg-secondary/60 px-3 py-2"
          >
            <p className="text-xs font-medium tracking-wide text-muted-foreground">
              {row.when}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {row.hops.map(([who, hop]) => (
                <p key={who} className="flex items-baseline gap-2">
                  <span className="text-foreground">{who}</span>
                  <span className="font-display text-base tabular-nums text-primary">
                    {hop}
                  </span>
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
