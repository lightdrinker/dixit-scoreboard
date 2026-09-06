import type { ScoreInput } from "./scoring-types";

export type { ScoreInput } from "./scoring-types";

export function othersOf(playerIds: string[], storytellerId: string): string[] {
  return playerIds.filter((id) => id !== storytellerId);
}

export function outcomeKind(
  voterCount: number,
  foundCount: number,
): "all" | "none" | "some" {
  if (foundCount <= 0) return "none";
  if (foundCount >= voterCount) return "all";
  return "some";
}

/** Votes still to place on decoy cards. */
export function remainingDecoyVotes(input: ScoreInput): number {
  const voters = othersOf(input.playerIds, input.storytellerId).length;
  const placed = Object.entries(input.votesOnCard).reduce((sum, [id, n]) => {
    if (id === input.storytellerId) return sum;
    return sum + Math.max(0, n);
  }, 0);
  return voters - input.foundBy.length - placed;
}

/**
 * A player cannot vote for their own card, and only players who missed
 * the storyteller still have a decoy vote to give.
 */
export function maxDecoyVotesFor(playerId: string, input: ScoreInput): number {
  if (playerId === input.storytellerId) return 0;
  const missers = othersOf(input.playerIds, input.storytellerId).filter(
    (id) => !input.foundBy.includes(id),
  );
  return missers.filter((id) => id !== playerId).length;
}

export function scoreRound(input: ScoreInput): Record<string, number> {
  const deltas: Record<string, number> = {};
  for (const id of input.playerIds) deltas[id] = 0;

  const others = othersOf(input.playerIds, input.storytellerId);
  const kind = outcomeKind(others.length, input.foundBy.length);

  if (kind === "all" || kind === "none") {
    for (const id of others) deltas[id] = (deltas[id] ?? 0) + 2;
  } else {
    deltas[input.storytellerId] = 3;
    for (const id of input.foundBy) {
      if (id === input.storytellerId) continue;
      deltas[id] = (deltas[id] ?? 0) + 3;
    }
  }

  for (const id of others) {
    const votes = Math.max(0, input.votesOnCard[id] ?? 0);
    deltas[id] = (deltas[id] ?? 0) + votes;
  }

  return deltas;
}

export function validateRound(input: ScoreInput): string | null {
  if (!input.playerIds.includes(input.storytellerId)) {
    return "스토리텔러를 선택하세요.";
  }
  const others = othersOf(input.playerIds, input.storytellerId);
  if (others.length < 2) return "플레이어가 부족합니다.";

  for (const id of input.foundBy) {
    if (id === input.storytellerId) {
      return "스토리텔러는 자기 카드에 투표하지 않습니다.";
    }
    if (!others.includes(id)) return "맞힌 사람이 올바르지 않습니다.";
  }

  for (const id of others) {
    const votes = input.votesOnCard[id] ?? 0;
    if (votes < 0) return "표는 0보다 작을 수 없습니다.";
    if (votes > maxDecoyVotesFor(id, { ...input, votesOnCard: {} })) {
      return "한 카드가 받을 수 있는 표를 넘었습니다.";
    }
  }

  if (remainingDecoyVotes(input) !== 0) {
    return "남은 표를 모두 나눠 주세요.";
  }

  return null;
}

/** When leftover votes have only one legal home, fill them in. */
export function autoFillUniqueVotes(input: ScoreInput): Record<string, number> {
  const next = { ...input.votesOnCard };
  const others = othersOf(input.playerIds, input.storytellerId);
  const remaining = remainingDecoyVotes({ ...input, votesOnCard: next });
  if (remaining <= 0) return next;

  const eligible = others.filter(
    (id) => maxDecoyVotesFor(id, { ...input, votesOnCard: next }) > (next[id] ?? 0),
  );
  if (eligible.length === 1) {
    const id = eligible[0]!;
    const room =
      maxDecoyVotesFor(id, { ...input, votesOnCard: next }) - (next[id] ?? 0);
    next[id] = (next[id] ?? 0) + Math.min(room, remaining);
  }
  return next;
}
