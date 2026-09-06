import { useEffect } from "react";
import { useGame } from "@/lib/dixit/store";
import { SetupScreen } from "@/components/setup-screen";
import { GameScreen } from "@/components/game-screen";

export function DixitApp() {
  const phase = useGame((s) => s.phase);

  useEffect(() => {
    void useGame.persist.rehydrate();
  }, []);

  if (phase === "setup") return <SetupScreen />;
  return <GameScreen />;
}
