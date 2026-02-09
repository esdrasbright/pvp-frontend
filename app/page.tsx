"use client";

import { GameProvider, useGame } from "@/contexts/game-context";
import { useSocket } from "@/contexts/socket-context";
import { BoxPage } from "@/components/pages/box-page";
import { ConfigPage } from "@/components/pages/config-page";
import { DraftPage } from "@/components/pages/draft-page";
import { PreparationPage } from "@/components/pages/preparation-page";
import { DiscordLogin } from "@/components/discord-login";

function GameContent() {
  const { currentStep } = useGame();

  switch (currentStep) {
    case "box":
      return <BoxPage />;
    case "config":
      return <ConfigPage />;
    case "draft":
      return <DraftPage />;
    case "preparation":
      return <PreparationPage />;
    default:
      return <BoxPage />;
  }
}

function AppHeader() {
  const { lastError, clearError } = useSocket();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Wuthering Waves PvP</h1>
        <div className="flex items-center gap-4">
          {lastError && (
            <div className="flex items-center gap-2 px-3 py-1 bg-destructive/20 text-destructive rounded text-sm">
              <span>{lastError}</span>
              <button onClick={clearError} className="font-bold">&times;</button>
            </div>
          )}
          <DiscordLogin />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <AppHeader />
      <main className="pt-14">
        <GameContent />
      </main>
    </GameProvider>
  );
}
