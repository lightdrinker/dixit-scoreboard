import { cn } from "@/lib/utils";

type ScoreGuideProps = {
  className?: string;
  compact?: boolean;
  detailed?: boolean;
  framed?: boolean;
};

const COLS = ["텔러", "맞힌 사람", "그 외"] as const;

const ROWS = [
  {
    when: "일부만 맞춤",
    pts: ["+3", "+3", "0"] as const,
  },
  {
    when: "전원 맞춤",
    pts: ["0", "+2", "—"] as const,
  },
  {
    when: "아무도 못 맞춤",
    pts: ["0", "—", "+2"] as const,
  },
] as const;

function Pts({ value }: { value: string }) {
  const mute = value === "0" || value === "—";
  return (
    <span
      className={cn(
        "font-display tabular-nums",
        mute ? "text-muted-foreground" : "text-primary",
      )}
    >
      {value}
    </span>
  );
}

function ScoreTable({ compact = false }: { compact?: boolean }) {
  return (
    <table className="w-full border-separate border-spacing-0 text-sm">
      <caption className="sr-only">상황별 스토리텔러·맞힌 사람·그 외 점수</caption>
      <thead>
        <tr className="text-xs text-muted-foreground">
          <th scope="col" className="py-1.5 pr-2 text-left font-medium">
            상황
          </th>
          {COLS.map((col) => (
            <th
              key={col}
              scope="col"
              className="w-16 py-1.5 text-right font-medium leading-tight"
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={row.when}>
            <th
              scope="row"
              className={cn(
                "border-t border-border pr-2 text-left font-medium",
                compact ? "py-1.5" : "py-2.5",
              )}
            >
              {row.when}
            </th>
            {row.pts.map((pt, i) => (
              <td
                key={COLS[i]}
                className={cn(
                  "border-t border-border text-right",
                  compact ? "py-1.5 text-lg" : "py-2.5 text-2xl",
                )}
              >
                <Pts value={pt} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ScoreGuide({
  className,
  compact = false,
  detailed = false,
  framed = true,
}: ScoreGuideProps) {
  return (
    <section
      className={cn(
        framed && "paper-panel rounded-xl",
        framed && (compact ? "p-3" : "p-4 sm:p-5"),
        className,
      )}
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className={cn("font-display", compact ? "text-lg" : "text-xl")}>
          점수 배정
        </h2>
        <p className="text-xs text-muted-foreground">30점 도착 승리</p>
      </div>

      {!compact ? (
        <p className="mb-3 text-sm text-muted-foreground">
          스토리텔러 카드를 누가 골랐는지로 먼저 정합니다. 열은 역할, 행은
          상황입니다.
        </p>
      ) : null}

      <ScoreTable compact={compact} />

      <p
        className={cn(
          "border-t border-border text-muted-foreground",
          compact ? "mt-2 pt-2 text-xs" : "mt-3 pt-3 text-sm",
        )}
      >
        미끼{" "}
        <span className="font-display text-primary tabular-nums">+1</span>
        <span className="text-muted-foreground">
          {" "}
          / 내 카드가 받은 표. 텔러는 없고, 전원 맞춤이면 미끼 표도 없습니다.
        </span>
      </p>

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