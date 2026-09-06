export type ScoreInput = {
  playerIds: string[];
  storytellerId: string;
  foundBy: string[];
  votesOnCard: Record<string, number>;
};
