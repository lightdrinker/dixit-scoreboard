export type RabbitColor = {
  id: string;
  hex: string;
  name: string;
  on: string;
  stroke: string;
  light?: boolean;
};

/** First six match the painted wooden rabbits in the base Dixit box. */
export const RABBIT_COLORS: RabbitColor[] = [
  { id: "green", hex: "#2F7A5A", name: "초록", on: "#f6f0e4", stroke: "#1c4a36" },
  { id: "yellow", hex: "#E4C64A", name: "노랑", on: "#3a2e10", stroke: "#8a6e18", light: true },
  { id: "white", hex: "#F3EFE6", name: "하양", on: "#4a4338", stroke: "#9a8f80", light: true },
  { id: "red", hex: "#C42C24", name: "빨강", on: "#f6f0e4", stroke: "#7a1814" },
  { id: "blue", hex: "#1F52A8", name: "파랑", on: "#f6f0e4", stroke: "#14356e" },
  { id: "pink", hex: "#C85D6A", name: "분홍", on: "#f6f0e4", stroke: "#7a3340" },
  { id: "orange", hex: "#D56A2B", name: "주황", on: "#f6f0e4", stroke: "#8a3c14" },
  { id: "purple", hex: "#6B4A9A", name: "보라", on: "#f6f0e4", stroke: "#3d2860" },
  { id: "black", hex: "#2A2624", name: "검정", on: "#f6f0e4", stroke: "#111010" },
  { id: "grey", hex: "#8A8884", name: "회색", on: "#f6f0e4", stroke: "#4a4946" },
  { id: "brown", hex: "#6B4634", name: "갈색", on: "#f6f0e4", stroke: "#3d261c" },
  { id: "teal", hex: "#2A7A86", name: "청록", on: "#f6f0e4", stroke: "#164850" },
];

const byId = new Map(RABBIT_COLORS.map((c) => [c.id, c]));

export function rabbitColor(id: string): RabbitColor {
  return byId.get(id) ?? RABBIT_COLORS[0]!;
}
