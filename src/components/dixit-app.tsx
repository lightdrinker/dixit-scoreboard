import { useEffect, useState } from "react";
import { useGame } from "@/lib/dixit/store";
import { SetupScreen } from "@/components/setup-screen";
import { GameScreen } from "@/components/game-screen";
import { unlockSfx } from "@/lib/dixit/sfx";

export function DixitApp() {
  const phase = useGame((s) => s.phase);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) setReady(true);
    };
    try {
      const result = useGame.persist.rehydrate() as unknown;
      if (result && typeof (result as Promise<unknown>).then === "function") {
        (result as Promise<unknown>).then(done, done);
      } else {
        done();
      }
    } catch {
      done();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unlock = () => unlockSfx();
    window.addEventListener("pointerdown", unlock, { passive: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  if (!ready || phase === "setup") return <SetupScreen />;
  return <GameScreen />;
}