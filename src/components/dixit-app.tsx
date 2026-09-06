import { useEffect } from "react";
import { useGame } from "@/lib/dixit/store";
import { SetupScreen } from "@/components/setup-screen";
import { GameScreen } from "@/components/game-screen";
import { unlockSfx } from "@/lib/dixit/sfx";

export function DixitApp() {
  const phase = useGame((s) => s.phase);

  useEffect(() => {
    void useGame.persist.rehydrate();
  }, []);

  useEffect(() => {
    const unlock = () => unlockSfx();
    window.addEventListener("pointerdown", unlock, { passive: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  if (phase === "setup") return <SetupScreen />;
  return <GameScreen />;
}