import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { RABBIT_COLORS } from "./colors";
import {
  autoFillUniqueVotes,
  scoreRound,
  validateRound,
  type ScoreInput,
} from "./scoring";
import {
  GOAL_SCORE,
  MAX_PLAYERS,
  MIN_PLAYERS,
  type GameSnapshot,
  type Phase,
  type Player,
  type RoundRecord,
} from "./types";

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `p-${Math.random().toString(36).slice(2, 10)}`;
}

function blankPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uid(),
    name: "",
    colorId: RABBIT_COLORS[i % RABBIT_COLORS.length]!.id,
    score: 0,
  }));
}

function settleWinners(players: Player[]): {
  winnerIds: string[];
  phase: Phase;
} {
  const reached = players.filter((p) => p.score >= GOAL_SCORE);
  if (!reached.length) return { winnerIds: [], phase: "play" };
  const top = Math.max(...reached.map((p) => p.score));
  return {
    winnerIds: reached.filter((p) => p.score === top).map((p) => p.id),
    phase: "finished",
  };
}

type GameState = GameSnapshot & {
  setPhase: (phase: Phase) => void;
  setPlayerName: (id: string, name: string) => void;
  setPlayerColor: (id: string, colorId: string) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  setPlayerCount: (count: number) => void;
  startGame: () => string | null;
  applyRound: (input: Omit<ScoreInput, "playerIds">) => string | null;
  undoRound: () => void;
  nudgeScore: (id: string, delta: number) => void;
  resetGame: () => void;
  newSetup: () => void;
};

const initial = (): Pick<GameSnapshot, "phase" | "players" | "rounds" | "winnerIds"> => ({
  phase: "setup",
  players: blankPlayers(6),
  rounds: [],
  winnerIds: [],
});

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initial(),
      setPhase: (phase) => set({ phase }),
      setPlayerName: (id, name) =>
        set({
          players: get().players.map((p) => (p.id === id ? { ...p, name } : p)),
        }),
      setPlayerColor: (id, colorId) =>
        set({
          players: get().players.map((p) => (p.id === id ? { ...p, colorId } : p)),
        }),
      addPlayer: () => {
        const players = get().players;
        if (players.length >= MAX_PLAYERS) return;
        const used = new Set(players.map((p) => p.colorId));
        const color =
          RABBIT_COLORS.find((c) => !used.has(c.id)) ??
          RABBIT_COLORS[players.length % RABBIT_COLORS.length]!;
        set({
          players: [
            ...players,
            { id: uid(), name: "", colorId: color.id, score: 0 },
          ],
        });
      },
      removePlayer: (id) => {
        const players = get().players;
        if (players.length <= MIN_PLAYERS) return;
        set({ players: players.filter((p) => p.id !== id) });
      },
      setPlayerCount: (count) => {
        const n = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Math.round(count)));
        const players = get().players;
        if (n === players.length) return;
        if (n < players.length) {
          set({ players: players.slice(0, n) });
          return;
        }
        const used = new Set(players.map((p) => p.colorId));
        const extra: Player[] = [];
        for (let i = players.length; i < n; i++) {
          const color =
            RABBIT_COLORS.find((c) => !used.has(c.id)) ??
            RABBIT_COLORS[i % RABBIT_COLORS.length]!;
          used.add(color.id);
          extra.push({ id: uid(), name: "", colorId: color.id, score: 0 });
        }
        set({ players: [...players, ...extra] });
      },
      startGame: () => {
        const players = get().players.map((p, i) => ({
          ...p,
          name: p.name.trim() || `플레이어 ${i + 1}`,
          score: 0,
        }));
        if (players.length < MIN_PLAYERS) {
          return `최소 ${MIN_PLAYERS}명이 필요합니다.`;
        }
        const names = new Set(players.map((p) => p.name));
        if (names.size !== players.length) {
          return "이름이 겹치지 않게 해 주세요.";
        }
        set({ phase: "play", players, rounds: [], winnerIds: [] });
        return null;
      },
      applyRound: (partial) => {
        const { players } = get();
        const input: ScoreInput = {
          playerIds: players.map((p) => p.id),
          ...partial,
          votesOnCard: autoFillUniqueVotes({
            playerIds: players.map((p) => p.id),
            ...partial,
          }),
        };
        const error = validateRound(input);
        if (error) return error;
        const deltas = scoreRound(input);
        const nextPlayers = players.map((p) => ({
          ...p,
          score: p.score + (deltas[p.id] ?? 0),
        }));
        const settled = settleWinners(nextPlayers);
        const round: RoundRecord = {
          id: uid(),
          storytellerId: input.storytellerId,
          foundBy: [...input.foundBy],
          votesOnCard: { ...input.votesOnCard },
          deltas,
        };
        set({
          players: nextPlayers,
          rounds: [...get().rounds, round],
          winnerIds: settled.winnerIds,
          phase: settled.phase,
        });
        return null;
      },
      undoRound: () => {
        const { rounds, players } = get();
        const last = rounds[rounds.length - 1];
        if (!last) return;
        const nextPlayers = players.map((p) => ({
          ...p,
          score: Math.max(0, p.score - (last.deltas[p.id] ?? 0)),
        }));
        const settled = settleWinners(nextPlayers);
        set({
          rounds: rounds.slice(0, -1),
          players: nextPlayers,
          winnerIds: settled.winnerIds,
          phase: settled.phase,
        });
      },
      nudgeScore: (id, delta) => {
        const players = get().players.map((p) =>
          p.id === id ? { ...p, score: Math.max(0, p.score + delta) } : p,
        );
        const settled = settleWinners(players);
        set({
          players,
          winnerIds: settled.winnerIds,
          phase: settled.phase,
        });
      },
      resetGame: () => {
        set({
          players: get().players.map((p) => ({ ...p, score: 0 })),
          rounds: [],
          winnerIds: [],
          phase: "play",
        });
      },
      newSetup: () => set(initial()),
    }),
    {
      name: "dixit-scoreboard-v4",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        phase: state.phase,
        players: state.players,
        rounds: state.rounds,
        winnerIds: state.winnerIds,
      }),
    },
  ),
);
