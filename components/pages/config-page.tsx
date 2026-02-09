"use client";

import { useGame } from "@/contexts/game-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { getCharacterPoints, calculateBalanceBans } from "@/lib/characters";
import { cn } from "@/lib/utils";

export function ConfigPage() {
  const {
    gameState,
    updateConfig,
    setCurrentStep,
  } = useGame();

  // Calculer les points totaux
  const player1Points = useMemo(() => {
    let total = 0;
    for (const item of gameState.player1.box) {
      if (item.owned) {
        total += getCharacterPoints(item.characterId, item.sequence, gameState.config.gameMode);
      }
    }
    return total;
  }, [gameState.player1.box, gameState.config.gameMode]);

  const player2Points = useMemo(() => {
    let total = 0;
    for (const item of gameState.player2.box) {
      if (item.owned) {
        total += getCharacterPoints(item.characterId, item.sequence, gameState.config.gameMode);
      }
    }
    return total;
  }, [gameState.player2.box, gameState.config.gameMode]);

  // Calculer les bans d'équilibrage
  const balanceInfo = useMemo(() => {
    return calculateBalanceBans(player1Points, player2Points);
  }, [player1Points, player2Points]);

  const pointsDiff = Math.abs(player1Points - player2Points);

  const handleStartDraft = () => {
    // Mettre à jour les bans d'équilibrage avant de démarrer
    updateConfig({
      balanceBans: balanceInfo.bans,
      balanceBansPlayer: balanceInfo.player,
    });
    setCurrentStep("draft");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configuration du PvP</h1>
              <p className="text-sm text-muted-foreground">
                Définissez les règles de la draft
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("box")}
              >
                Retour aux Box
              </Button>
              <Button
                onClick={handleStartDraft}
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                Démarrer la Draft
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Résumé des joueurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Joueur 1 */}
            <Card className={cn("border-2 border-player1/50 bg-player1/5")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-player1-light">{gameState.player1.name}</CardTitle>
                <CardDescription>Joueur 1</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Points de box</span>
                  <span className="text-3xl font-bold text-player1-light">{player1Points}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {gameState.player1.box.filter((b) => b.owned).length} personnages
                </div>
              </CardContent>
            </Card>

            {/* Joueur 2 */}
            <Card className={cn("border-2 border-player2/50 bg-player2/5")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-player2-light">{gameState.player2.name}</CardTitle>
                <CardDescription>Joueur 2</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Points de box</span>
                  <span className="text-3xl font-bold text-player2-light">{player2Points}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {gameState.player2.box.filter((b) => b.owned).length} personnages
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bans d'équilibrage */}
          <Card className="border-accent/50 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-accent">Bans d'équilibrage</CardTitle>
              <CardDescription>
                Calculés automatiquement selon la différence de points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Différence de points</span>
                <span className="text-xl font-bold">{pointsDiff} pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bans supplémentaires</span>
                <span className="text-xl font-bold text-accent">{balanceInfo.bans}</span>
              </div>
              {balanceInfo.bans > 0 && (
                <p className="text-sm text-muted-foreground">
                  {balanceInfo.player === 1 ? gameState.player1.name : gameState.player2.name} aura {balanceInfo.bans} ban(s) supplémentaire(s)
                </p>
              )}
              <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <p className="font-medium mb-1">Règles d'équilibrage :</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>10-19 pts de différence = 1 ban</li>
                  <li>20-34 pts de différence = 2 bans</li>
                  <li>35-49 pts de différence = 3 bans</li>
                  <li>50+ pts de différence = 4 bans</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode de jeu */}
            <Card>
              <CardHeader>
                <CardTitle>Mode de jeu</CardTitle>
                <CardDescription>Sélectionnez le mode endgame</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant={gameState.config.gameMode === "whiwa" ? "default" : "outline"}
                    onClick={() => updateConfig({ gameMode: "whiwa" })}
                    className="flex-1"
                  >
                    WhiWa
                  </Button>
                  <Button
                    variant={gameState.config.gameMode === "toa" ? "default" : "outline"}
                    onClick={() => updateConfig({ gameMode: "toa" })}
                    className="flex-1"
                  >
                    Tower of Adversity
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timer de draft */}
            <Card>
              <CardHeader>
                <CardTitle>Timer de Draft</CardTitle>
                <CardDescription>Temps total pour la session de draft</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label htmlFor="draft-minutes">Minutes</Label>
                    <Input
                      id="draft-minutes"
                      type="number"
                      min={1}
                      max={30}
                      value={gameState.config.draftTimerMinutes}
                      onChange={(e) => updateConfig({ draftTimerMinutes: parseInt(e.target.value, 10) || 5 })}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="draft-seconds">Secondes</Label>
                    <Input
                      id="draft-seconds"
                      type="number"
                      min={0}
                      max={59}
                      value={gameState.config.draftTimerSeconds}
                      onChange={(e) => updateConfig({ draftTimerSeconds: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bans Phase 1 */}
            <Card>
              <CardHeader>
                <CardTitle>Bans Phase 1</CardTitle>
                <CardDescription>Nombre de bans avant les picks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfig({ bansPhase1: Math.max(0, gameState.config.bansPhase1 - 1) })}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{gameState.config.bansPhase1}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfig({ bansPhase1: Math.min(5, gameState.config.bansPhase1 + 1) })}
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bans Phase 2 */}
            <Card>
              <CardHeader>
                <CardTitle>Bans Phase 2</CardTitle>
                <CardDescription>Nombre de bans après 3 picks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfig({ bansPhase2: Math.max(0, gameState.config.bansPhase2 - 1) })}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{gameState.config.bansPhase2}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfig({ bansPhase2: Math.min(5, gameState.config.bansPhase2 + 1) })}
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Timer de préparation */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Timer de Préparation</CardTitle>
                <CardDescription>Temps pour organiser les équipes après la draft (en minutes)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 max-w-xs">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfig({ prepTimerMinutes: Math.max(1, gameState.config.prepTimerMinutes - 1) })}
                  >
                    -
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{gameState.config.prepTimerMinutes}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfig({ prepTimerMinutes: Math.min(15, gameState.config.prepTimerMinutes + 1) })}
                  >
                    +
                  </Button>
                  <span className="text-muted-foreground">minutes</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé des règles */}
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle>Résumé des règles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground">Mode</p>
                  <p className="font-bold">{gameState.config.gameMode === "whiwa" ? "WhiWa" : "ToA"}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground">Bans P1</p>
                  <p className="font-bold">{gameState.config.bansPhase1} par joueur</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground">Bans P2</p>
                  <p className="font-bold">{gameState.config.bansPhase2} par joueur</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground">Bans équil.</p>
                  <p className="font-bold text-accent">{balanceInfo.bans}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
