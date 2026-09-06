export type RabbitColor = {
  id: string;
  hex: string;
  name: string;
  on: string;
};

export const RABBIT_COLORS: RabbitColor[] = [
  { id: "clay", hex: "#b55a4a", name: "점토", on: "#faf6ef" },
  { id: "ink", hex: "#3d5c78", name: "잉크", on: "#faf6ef" },
  { id: "moss", hex: "#4d6b54", name: "이끼", on: "#faf6ef" },
  { id: "charcoal", hex: "#3a3530", name: "숯", on: "#faf6ef" },
  { id: "rose", hex: "#a56b72", name: "장미", on: "#faf6ef" },
  { id: "slate", hex: "#5d717c", name: "슬레이트", on: "#faf6ef" },
  { id: "cedar", hex: "#6e4b3a", name: "삼나무", on: "#faf6ef" },
  { id: "sea", hex: "#3d6e6a", name: "바다", on: "#faf6ef" },
  { id: "wine", hex: "#7a3e42", name: "와인", on: "#faf6ef" },
  { id: "olive", hex: "#5c5c3d", name: "올리브", on: "#faf6ef" },
  { id: "fog", hex: "#8a837a", name: "안개", on: "#231c16" },
  { id: "sand", hex: "#b08a5a", name: "모래", on: "#231c16" },
];

const byId = new Map(RABBIT_COLORS.map((c) => [c.id, c]));

export function rabbitColor(id: string): RabbitColor {
  return byId.get(id) ?? RABBIT_COLORS[0]!;
}
