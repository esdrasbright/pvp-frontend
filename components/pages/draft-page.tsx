"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useGame } from "@/contexts/game-context";
import { characters, type Element } from "@/lib/characters";
import { CharacterCard } from "@/components/character-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const elements: Element[] = ["Glacio", "Fusion", "Electro", "Aero", "Spectro", "Havoc"];

export function DraftPage() {
  const {
    gameState,
    updateDraft,
    setCurrentStep,
  } = useGame();

  const { draft, config, player1, player2 } = gameState;
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(config.draftTimerMinutes * 60 + config.draftTimerSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [elementFilter, setElementFilter] = useState<Element | "all">("all");
  const [rarityFilter, setRarityFilter] = useState<5 | 4 | "all">("all");

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get player box info
  const getPlayerBoxInfo = useCallback((characterId: string, playerId: 1 | 2) => {
    const playerBox = playerId === 1 ? player1.box : player2.box;
    const item = playerBox.find((b) => b.characterId === characterId);
    if (!item || !item.owned) return null;
    return item.sequence;
  }, [player1.box, player2.box]);

  // Check if character is available
  const isCharacterAvailable = useCallback((characterId: string) => {
    // Check if banned
    const isBanned = draft.bans.some((b) => b.characterId === characterId);
    if (isBanned) return false;
    
    // Check if already picked
    const isPicked = draft.picks.some((p) => p.characterId === characterId);
    if (isPicked) return false;
    
    // Check if at least one player owns it
    const player1Owns = player1.box.some((b) => b.characterId === characterId && b.owned);
    const player2Owns = player2.box.some((b) => b.characterId === characterId && b.owned);
    
    return player1Owns || player2Owns;
  }, [draft.bans, draft.picks, player1.box, player2.box]);

  // Check if current player can pick/ban this character
  const canCurrentPlayerSelect = useCallback((characterId: string) => {
    if (!isCharacterAvailable(characterId)) return false;
    
    const currentPlayer = draft.currentPlayer;
    const playerBox = currentPlayer === 1 ? player1.box : player2.box;
    
    // For picks, player must own the character
    if (draft.phase === "pick1" || draft.phase === "pick2") {
      return playerBox.some((b) => b.characterId === characterId && b.owned);
    }
    
    // For bans, character must be available
    return true;
  }, [draft.currentPlayer, draft.phase, isCharacterAvailable, player1.box, player2.box]);

  // Get phase info
  const phaseInfo = useMemo(() => {
    switch (draft.phase) {
      case "ban1":
        return {
          title: "Phase de Ban",
          subtitle: "Première phase de bans",
          action: "Bannissez un personnage",
          isBan: true,
        };
      case "pick1":
        return {
          title: "Phase de Pick",
          subtitle: "Première phase de picks (3 personnages)",
          action: "Choisissez un personnage",
          isBan: false,
        };
      case "ban2":
        return {
          title: "Phase de Ban",
          subtitle: "Deuxième phase de bans",
          action: "Bannissez un personnage",
          isBan: true,
        };
      case "pick2":
        return {
          title: "Phase de Pick",
          subtitle: "Deuxième phase de picks (3 personnages)",
          action: "Choisissez un personnage",
          isBan: false,
        };
      case "complete":
        return {
          title: "Draft terminée",
          subtitle: "Passez à la préparation",
          action: "",
          isBan: false,
        };
    }
  }, [draft.phase]);

  // Calculate remaining actions for current phase
  const getRemainingActions = useCallback(() => {
    const currentPlayer = draft.currentPlayer;
    
    switch (draft.phase) {
      case "ban1": {
        const totalBansNeeded = config.bansPhase1;
        const balanceBansForThisPlayer = config.balanceBansPlayer === currentPlayer ? config.balanceBans : 0;
        const totalForPlayer = totalBansNeeded + balanceBansForThisPlayer;
        const done = draft.currentPhase1BanCount[currentPlayer === 1 ? "player1" : "player2"];
        const balanceUsed = currentPlayer === config.balanceBansPlayer ? draft.balanceBansUsed : 0;
        return totalForPlayer - done - balanceUsed;
      }
      case "pick1": {
        const done = draft.currentPick1Count[currentPlayer === 1 ? "player1" : "player2"];
        return 3 - done;
      }
      case "ban2": {
        const done = draft.currentPhase2BanCount[currentPlayer === 1 ? "player1" : "player2"];
        return config.bansPhase2 - done;
      }
      case "pick2": {
        const done = draft.currentPick2Count[currentPlayer === 1 ? "player1" : "player2"];
        return 3 - done;
      }
      default:
        return 0;
    }
  }, [draft, config]);

  // Handle character selection
  const handleSelectCharacter = useCallback((characterId: string) => {
    if (!canCurrentPlayerSelect(characterId)) return;
    if (draft.phase === "complete") return;
    
    const currentPlayer = draft.currentPlayer;
    const remaining = getRemainingActions();
    
    if (remaining <= 0) return;

    if (phaseInfo.isBan) {
      // Add ban
      const isBalanceBan = 
        draft.phase === "ban1" && 
        currentPlayer === config.balanceBansPlayer && 
        draft.balanceBansUsed < config.balanceBans;
      
      const newBans = [
        ...draft.bans,
        {
          characterId,
          phase: draft.phase === "ban1" ? "phase1" : "phase2",
          bannedBy: currentPlayer,
        },
      ];
      
      let newPhase1Count = { ...draft.currentPhase1BanCount };
      let newPhase2Count = { ...draft.currentPhase2BanCount };
      let newBalanceUsed = draft.balanceBansUsed;
      
      if (draft.phase === "ban1") {
        if (isBalanceBan) {
          newBalanceUsed++;
        } else {
          newPhase1Count[currentPlayer === 1 ? "player1" : "player2"]++;
        }
      } else {
        newPhase2Count[currentPlayer === 1 ? "player1" : "player2"]++;
      }
      
      // Check if we need to switch players or phases
      let nextPlayer: 1 | 2 = currentPlayer;
      let nextPhase = draft.phase;
      
      // Calculate remaining after this ban
      const totalBansP1Phase1 = config.bansPhase1 + (config.balanceBansPlayer === 1 ? config.balanceBans : 0);
      const totalBansP2Phase1 = config.bansPhase1 + (config.balanceBansPlayer === 2 ? config.balanceBans : 0);
      
      if (draft.phase === "ban1") {
        const p1Done = newPhase1Count.player1 + (config.balanceBansPlayer === 1 ? newBalanceUsed : 0);
        const p2Done = newPhase1Count.player2 + (config.balanceBansPlayer === 2 ? newBalanceUsed : 0);
        
        if (p1Done >= totalBansP1Phase1 && p2Done >= totalBansP2Phase1) {
          nextPhase = "pick1";
          nextPlayer = 1;
        } else if (currentPlayer === 1 && p1Done < totalBansP1Phase1) {
          nextPlayer = 1;
        } else if (currentPlayer === 2 && p2Done < totalBansP2Phase1) {
          nextPlayer = 2;
        } else {
          nextPlayer = currentPlayer === 1 ? 2 : 1;
        }
      } else if (draft.phase === "ban2") {
        const p1Done = newPhase2Count.player1;
        const p2Done = newPhase2Count.player2;
        
        if (p1Done >= config.bansPhase2 && p2Done >= config.bansPhase2) {
          nextPhase = "pick2";
          nextPlayer = 1;
        } else {
          nextPlayer = currentPlayer === 1 ? 2 : 1;
        }
      }
      
      updateDraft({
        bans: newBans as typeof draft.bans,
        currentPhase1BanCount: newPhase1Count,
        currentPhase2BanCount: newPhase2Count,
        balanceBansUsed: newBalanceUsed,
        currentPlayer: nextPlayer,
        phase: nextPhase,
      });
    } else {
      // Add pick
      const newPicks = [
        ...draft.picks,
        {
          characterId,
          pickedBy: currentPlayer,
          order: draft.picks.length,
        },
      ];
      
      const newPlayerPicks = currentPlayer === 1
        ? { player1Picks: [...draft.player1Picks, characterId], player2Picks: draft.player2Picks }
        : { player1Picks: draft.player1Picks, player2Picks: [...draft.player2Picks, characterId] };
      
      let newPick1Count = { ...draft.currentPick1Count };
      let newPick2Count = { ...draft.currentPick2Count };
      
      if (draft.phase === "pick1") {
        newPick1Count[currentPlayer === 1 ? "player1" : "player2"]++;
      } else {
        newPick2Count[currentPlayer === 1 ? "player1" : "player2"]++;
      }
      
      // Check transitions
      let nextPlayer: 1 | 2 = currentPlayer;
      let nextPhase = draft.phase;
      
      if (draft.phase === "pick1") {
        if (newPick1Count.player1 >= 3 && newPick1Count.player2 >= 3) {
          nextPhase = config.bansPhase2 > 0 ? "ban2" : "pick2";
          nextPlayer = 1;
        } else {
          nextPlayer = currentPlayer === 1 ? 2 : 1;
        }
      } else if (draft.phase === "pick2") {
        if (newPick2Count.player1 >= 3 && newPick2Count.player2 >= 3) {
          nextPhase = "complete";
        } else {
          nextPlayer = currentPlayer === 1 ? 2 : 1;
        }
      }
      
      updateDraft({
        picks: newPicks as typeof draft.picks,
        ...newPlayerPicks,
        currentPick1Count: newPick1Count,
        currentPick2Count: newPick2Count,
        currentPlayer: nextPlayer,
        phase: nextPhase,
      });
    }
  }, [canCurrentPlayerSelect, draft, config, phaseInfo, getRemainingActions, updateDraft]);

  // Filter characters
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesElement = elementFilter === "all" || char.element === elementFilter;
      const matchesRarity = rarityFilter === "all" || char.rarity === rarityFilter;
      return matchesSearch && matchesElement && matchesRarity;
    });
  }, [searchQuery, elementFilter, rarityFilter]);

  // Get player bans
  const player1Bans = draft.bans.filter((b) => b.bannedBy === 1);
  const player2Bans = draft.bans.filter((b) => b.bannedBy === 2);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Phase info and timer */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Player 1 info */}
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg",
              draft.currentPlayer === 1 && "ring-2 ring-player1 bg-player1/10"
            )}>
              <div className="w-10 h-10 rounded-full bg-player1 flex items-center justify-center font-bold text-white">
                1
              </div>
              <div>
                <p className="font-bold text-player1-light">{player1.name}</p>
                <p className="text-xs text-muted-foreground">
                  {draft.player1Picks.length}/6 picks
                </p>
              </div>
            </div>

            {/* Center - Phase and Timer */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4">
                <h2 className="text-xl font-bold">{phaseInfo.title}</h2>
                <div className={cn(
                  "text-3xl font-mono font-bold px-4 py-1 rounded",
                  timeLeft < 60 ? "text-destructive bg-destructive/10" : "text-primary bg-primary/10"
                )}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{phaseInfo.subtitle}</p>
              {draft.phase !== "complete" && (
                <p className={cn(
                  "text-sm font-medium mt-1",
                  draft.currentPlayer === 1 ? "text-player1-light" : "text-player2-light"
                )}>
                  {draft.currentPlayer === 1 ? player1.name : player2.name}: {phaseInfo.action}
                </p>
              )}
            </div>

            {/* Player 2 info */}
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg",
              draft.currentPlayer === 2 && "ring-2 ring-player2 bg-player2/10"
            )}>
              <div>
                <p className="font-bold text-player2-light text-right">{player2.name}</p>
                <p className="text-xs text-muted-foreground text-right">
                  {draft.player2Picks.length}/6 picks
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-player2 flex items-center justify-center font-bold text-white">
                2
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Bans display */}
        <div className="border-b border-border/50 bg-card/30 p-3">
          <div className="container mx-auto flex justify-between items-start">
            {/* Player 1 bans */}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-2">Bans {player1.name}</p>
              <div className="flex gap-2 flex-wrap">
                {player1Bans.map((ban) => {
                  const char = characters.find((c) => c.id === ban.characterId);
                  if (!char) return null;
                  return (
                    <CharacterCard
                      key={ban.characterId}
                      character={char}
                      mode="draft"
                      isBanned
                      size="sm"
                    />
                  );
                })}
                {player1Bans.length === 0 && (
                  <div className="w-16 h-20 border-2 border-dashed border-player1/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    Ban
                  </div>
                )}
              </div>
            </div>

            {/* VS */}
            <div className="px-8 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">VS</span>
            </div>

            {/* Player 2 bans */}
            <div className="flex-1 text-right">
              <p className="text-xs text-muted-foreground mb-2">Bans {player2.name}</p>
              <div className="flex gap-2 flex-wrap justify-end">
                {player2Bans.map((ban) => {
                  const char = characters.find((c) => c.id === ban.characterId);
                  if (!char) return null;
                  return (
                    <CharacterCard
                      key={ban.characterId}
                      character={char}
                      mode="draft"
                      isBanned
                      size="sm"
                    />
                  );
                })}
                {player2Bans.length === 0 && (
                  <div className="w-16 h-20 border-2 border-dashed border-player2/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    Ban
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Picks display */}
        <div className="border-b border-border/50 bg-card/20 p-3">
          <div className="container mx-auto flex justify-between items-start">
            {/* Player 1 picks */}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-2">Picks {player1.name}</p>
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => {
                  const charId = draft.player1Picks[i];
                  const char = charId ? characters.find((c) => c.id === charId) : null;
                  
                  return (
                    <div key={i} className={cn(
                      "relative",
                      i === 2 && "mr-4" // Separator between team 1 and team 2
                    )}>
                      {char ? (
                        <CharacterCard
                          character={char}
                          mode="draft"
                          isPicked
                          pickedBy={1}
                          size="sm"
                        />
                      ) : (
                        <div className="w-16 h-20 border-2 border-dashed border-player1/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                          {i + 1}
                        </div>
                      )}
                      {i === 2 && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Player 2 picks */}
            <div className="flex-1 text-right">
              <p className="text-xs text-muted-foreground mb-2">Picks {player2.name}</p>
              <div className="flex gap-2 justify-end">
                {Array.from({ length: 6 }).map((_, i) => {
                  const charId = draft.player2Picks[i];
                  const char = charId ? characters.find((c) => c.id === charId) : null;
                  
                  return (
                    <div key={i} className={cn(
                      "relative",
                      i === 2 && "mr-4"
                    )}>
                      {char ? (
                        <CharacterCard
                          character={char}
                          mode="draft"
                          isPicked
                          pickedBy={2}
                          size="sm"
                        />
                      ) : (
                        <div className="w-16 h-20 border-2 border-dashed border-player2/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                          {i + 1}
                        </div>
                      )}
                      {i === 2 && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-border/50 bg-background/50 p-2">
          <div className="container mx-auto flex items-center gap-4">
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 h-8 text-sm"
            />
            
            <div className="flex gap-1">
              <Button
                variant={elementFilter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setElementFilter("all")}
                className="h-7 text-xs"
              >
                Tous
              </Button>
              {elements.map((el) => (
                <Button
                  key={el}
                  variant={elementFilter === el ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setElementFilter(el)}
                  className="h-7 text-xs"
                >
                  {el}
                </Button>
              ))}
            </div>

            <div className="flex gap-1 ml-auto">
              <Button
                variant={rarityFilter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setRarityFilter("all")}
                className="h-7 text-xs"
              >
                Toutes
              </Button>
              <Button
                variant={rarityFilter === 5 ? "default" : "ghost"}
                size="sm"
                onClick={() => setRarityFilter(5)}
                className="h-7 text-xs"
              >
                5*
              </Button>
              <Button
                variant={rarityFilter === 4 ? "default" : "ghost"}
                size="sm"
                onClick={() => setRarityFilter(4)}
                className="h-7 text-xs"
              >
                4*
              </Button>
            </div>
          </div>
        </div>

        {/* Character grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
              {filteredCharacters.map((char) => {
                const isBanned = draft.bans.some((b) => b.characterId === char.id);
                const pick = draft.picks.find((p) => p.characterId === char.id);
                const isPicked = !!pick;
                const pickedBy = pick?.pickedBy;
                const isSelectable = canCurrentPlayerSelect(char.id) && draft.phase !== "complete";
                
                const p1Seq = getPlayerBoxInfo(char.id, 1);
                const p2Seq = getPlayerBoxInfo(char.id, 2);

                return (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    mode="draft"
                    player1Sequence={p1Seq}
                    player2Sequence={p2Seq}
                    isBanned={isBanned}
                    isPicked={isPicked}
                    pickedBy={pickedBy}
                    isSelectable={isSelectable}
                    onSelect={() => handleSelectCharacter(char.id)}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        {draft.phase === "complete" && (
          <div className="border-t border-border/50 bg-card/50 p-4">
            <div className="container mx-auto flex justify-center">
              <Button
                size="lg"
                onClick={() => setCurrentStep("preparation")}
                className="bg-primary hover:bg-primary/90"
              >
                Passer à la préparation des équipes
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
