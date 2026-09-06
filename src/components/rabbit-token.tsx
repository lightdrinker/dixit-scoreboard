import { useId } from "react";
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
  sm: "h-9 w-8",
  md: "h-11 w-10",
  lg: "h-14 w-12",
} as const;

function RabbitFigure({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      {/* Both ears grow from the head, not the back. */}
      <path d="M41.2 2.1C35.4 6.2 36.2 24.8 47.6 43.2C51.4 26.5 49.2 5.8 41.2 2.1Z" />
      <path d="M55.4 1.4C49.6 5.6 50.4 24.5 57.2 43C62.8 26.2 62.4 4.8 55.4 1.4Z" />
      <ellipse cx="51.2" cy="44.2" rx="13.6" ry="12.4" />
      <ellipse cx="38.2" cy="66.2" rx="19" ry="14.4" />
      <circle cx="16.8" cy="64" r="6.5" />
    </g>
  );
}

function RabbitSilhouette({
  fill,
  stroke,
}: {
  fill: string;
  stroke: string;
}) {
  const uid = useId().replace(/:/g, "");
  const fid = `rb-ol-${uid}`;

  return (
    <svg
      viewBox="0 0 80 88"
      className="h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <filter
          id={fid}
          x="-18%"
          y="-12%"
          width="136%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius="1.35"
            result="dilated"
          />
          <feFlood floodColor={stroke} result="tint" />
          <feComposite in="tint" in2="dilated" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="40" cy="84.8" rx="16" ry="2.5" fill="rgb(20 12 8 / 0.28)" />
      <g filter={`url(#${fid})`}>
        <RabbitFigure fill={fill} />
      </g>
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
        <RabbitSilhouette fill={color.hex} stroke={color.stroke} />
        {label ? <span className="sr-only">{label}</span> : null}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        chipSizes[size],
        className,
      )}
      style={{
        backgroundColor: color.hex,
        color: color.on,
        boxShadow: color.light
          ? `inset 0 0 0 1.5px ${color.stroke}, 0 1px 2px rgb(20 12 8 / 0.22)`
          : `0 1px 2px rgb(20 12 8 / 0.28)`,
      }}
      title={label ?? color.name}
    >
      <svg viewBox="8 0 66 86" className="size-[80%]" aria-hidden>
        <RabbitFigure fill="currentColor" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
