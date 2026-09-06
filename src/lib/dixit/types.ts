export const GOAL_SCORE = 30;
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;

export type Player = {
  id: string;
  name: string;
  colorId: string;
  score: number;
};

export type RoundRecord = {
  id: string;
  storytellerId: string;
  foundBy: string[];
  votesOnCard: Record<string, number>;
  deltas: Record<string, number>;
};

export type Phase = "setup" | "play" | "finished";

export type GameSnapshot = {
  phase: Phase;
  players: Player[];
  rounds: RoundRecord[];
  winnerIds: string[];
};
