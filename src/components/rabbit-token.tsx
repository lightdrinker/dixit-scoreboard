import { cn } from "@/lib/utils";
import { rabbitColor } from "@/lib/dixit/colors";

type RabbitTokenProps = {
  colorId: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  variant?: "chip" | "pawn";
};

const chipSizes = {
  sm: "size-7",
  md: "size-9",
  lg: "size-11",
} as const;

const pawnSizes = {
  sm: "h-8 w-6",
  md: "h-11 w-8",
  lg: "h-14 w-10",
} as const;

function PawnSvg({ hex, on }: { hex: string; on: string }) {
  return (
    <svg viewBox="0 0 64 90" className="h-full w-full overflow-visible" aria-hidden>
      <ellipse cx="32" cy="84" rx="18" ry="5" fill="rgb(8 4 2 / 0.4)" />
      <ellipse cx="32" cy="78" rx="15" ry="5" fill={hex} />
      <ellipse cx="32" cy="78" rx="15" ry="5" fill="rgb(8 4 2 / 0.25)" />
      <ellipse cx="21" cy="20" rx="7.5" ry="18" fill={hex} />
      <ellipse cx="43" cy="20" rx="7.5" ry="18" fill={hex} />
      <ellipse cx="21" cy="21" rx="3.2" ry="10" fill={on} opacity="0.32" />
      <ellipse cx="43" cy="21" rx="3.2" ry="10" fill={on} opacity="0.32" />
      <ellipse cx="32" cy="56" rx="19" ry="21" fill={hex} />
      <circle cx="32" cy="34" r="15" fill={hex} />
      <ellipse cx="26" cy="30" rx="6" ry="5" fill={on} opacity="0.22" />
      <ellipse cx="32" cy="52" rx="8" ry="12" fill={on} opacity="0.14" />
      <circle cx="27" cy="34" r="2.1" fill="rgb(20 12 8 / 0.55)" />
      <circle cx="38" cy="34" r="2.1" fill="rgb(20 12 8 / 0.55)" />
    </svg>
  );
}

export function RabbitToken({
  colorId,
  size = "md",
  label,
  className,
  variant = "chip",
}: RabbitTokenProps) {
  const color = rabbitColor(colorId);

  if (variant === "pawn") {
    return (
      <span
        className={cn("relative inline-block", pawnSizes[size], className)}
        title={label ?? color.name}
      >
        <PawnSvg hex={color.hex} on={color.on} />
        {label ? <span className="sr-only">{label}</span> : null}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full shadow-border",
        chipSizes[size],
        className,
      )}
      style={{ backgroundColor: color.hex, color: color.on }}
      title={label ?? color.name}
    >
      <svg viewBox="0 0 64 84" className="size-3/5" aria-hidden>
        <ellipse cx="22" cy="18" rx="7" ry="16" fill="currentColor" />
        <ellipse cx="42" cy="18" rx="7" ry="16" fill="currentColor" />
        <ellipse cx="32" cy="54" rx="18" ry="20" fill="currentColor" />
        <circle cx="32" cy="32" r="14" fill="currentColor" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
