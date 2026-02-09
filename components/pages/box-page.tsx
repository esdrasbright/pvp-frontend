"use client";

import { useGame } from "@/contexts/game-context";
import { characters, type Element, getCharacterPoints } from "@/lib/characters";
import { CharacterCard } from "@/components/character-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { exportBoxToExcel, importBoxFromExcel, downloadTemplate } from "@/lib/excel-utils";
import type { PlayerBox } from "@/lib/game-state";

const elements: Element[] = ["Glacio", "Fusion", "Electro", "Aero", "Spectro", "Havoc"];

const elementIcons: Record<Element, { color: string; bgColor: string }> = {
  Glacio: { color: "text-cyan-400", bgColor: "bg-cyan-500/20 hover:bg-cyan-500/30" },
  Fusion: { color: "text-orange-400", bgColor: "bg-orange-500/20 hover:bg-orange-500/30" },
  Electro: { color: "text-violet-400", bgColor: "bg-violet-500/20 hover:bg-violet-500/30" },
  Aero: { color: "text-emerald-400", bgColor: "bg-emerald-500/20 hover:bg-emerald-500/30" },
  Spectro: { color: "text-yellow-400", bgColor: "bg-yellow-500/20 hover:bg-yellow-500/30" },
  Havoc: { color: "text-pink-400", bgColor: "bg-pink-500/20 hover:bg-pink-500/30" },
};

export function BoxPage() {
  const {
    gameState,
    updatePlayer1,
    updatePlayer2,
    setCurrentStep,
  } = useGame();

  // Active player for editing
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [elementFilter, setElementFilter] = useState<Element | "all">("all");
  const [rarityFilter, setRarityFilter] = useState<5 | 4 | "all">("all");
  const [showOwned, setShowOwned] = useState<"all" | "owned" | "not-owned">("all");
  
  // File inputs
  const fileInputP1 = useRef<HTMLInputElement>(null);
  const fileInputP2 = useRef<HTMLInputElement>(null);

  // Initialize boxes if empty
  const player1Box = useMemo(() => {
    if (gameState.player1.box.length === 0) {
      return characters.map((char) => ({
        characterId: char.id,
        owned: false,
        sequence: 0,
      }));
    }
    return gameState.player1.box;
  }, [gameState.player1.box]);

  const player2Box = useMemo(() => {
    if (gameState.player2.box.length === 0) {
      return characters.map((char) => ({
        characterId: char.id,
        owned: false,
        sequence: 0,
      }));
    }
    return gameState.player2.box;
  }, [gameState.player2.box]);

  // Calculate points
  const player1Points = useMemo(() => {
    let total = 0;
    for (const item of player1Box) {
      if (item.owned) {
        total += getCharacterPoints(item.characterId, item.sequence, gameState.config.gameMode);
      }
    }
    return total;
  }, [player1Box, gameState.config.gameMode]);

  const player2Points = useMemo(() => {
    let total = 0;
    for (const item of player2Box) {
      if (item.owned) {
        total += getCharacterPoints(item.characterId, item.sequence, gameState.config.gameMode);
      }
    }
    return total;
  }, [player2Box, gameState.config.gameMode]);

  // Count owned
  const player1OwnedCount = player1Box.filter((b) => b.owned).length;
  const player2OwnedCount = player2Box.filter((b) => b.owned).length;

  // Filter characters
  const filteredCharacters = useMemo(() => {
    const currentBox = activePlayer === 1 ? player1Box : player2Box;
    
    return characters.filter((char) => {
      const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesElement = elementFilter === "all" || char.element === elementFilter;
      const matchesRarity = rarityFilter === "all" || char.rarity === rarityFilter;
      
      const boxItem = currentBox.find((b) => b.characterId === char.id);
      const isOwned = boxItem?.owned || false;
      const matchesOwned = showOwned === "all" || 
        (showOwned === "owned" && isOwned) ||
        (showOwned === "not-owned" && !isOwned);
      
      return matchesSearch && matchesElement && matchesRarity && matchesOwned;
    });
  }, [searchQuery, elementFilter, rarityFilter, showOwned, activePlayer, player1Box, player2Box]);

  // Get box item for character
  const getBoxItem = (characterId: string, playerId: 1 | 2) => {
    const box = playerId === 1 ? player1Box : player2Box;
    return box.find((b) => b.characterId === characterId) || {
      characterId,
      owned: false,
      sequence: 0,
    };
  };

  // Handle owned change
  const handleOwnedChange = (characterId: string, owned: boolean) => {
    const box = activePlayer === 1 ? player1Box : player2Box;
    const newBox = box.map((item) =>
      item.characterId === characterId
        ? { ...item, owned, sequence: owned ? item.sequence : 0 }
        : item
    );
    if (activePlayer === 1) {
      updatePlayer1({ box: newBox });
    } else {
      updatePlayer2({ box: newBox });
    }
  };

  // Handle sequence change
  const handleSequenceChange = (characterId: string, sequence: number) => {
    const box = activePlayer === 1 ? player1Box : player2Box;
    const newBox = box.map((item) =>
      item.characterId === characterId ? { ...item, sequence } : item
    );
    if (activePlayer === 1) {
      updatePlayer1({ box: newBox });
    } else {
      updatePlayer2({ box: newBox });
    }
  };

  // Select all / deselect all
  const handleSelectAll = () => {
    const box = activePlayer === 1 ? player1Box : player2Box;
    const newBox = box.map((item) => ({ ...item, owned: true }));
    if (activePlayer === 1) {
      updatePlayer1({ box: newBox });
    } else {
      updatePlayer2({ box: newBox });
    }
  };

  const handleDeselectAll = () => {
    const box = activePlayer === 1 ? player1Box : player2Box;
    const newBox = box.map((item) => ({ ...item, owned: false, sequence: 0 }));
    if (activePlayer === 1) {
      updatePlayer1({ box: newBox });
    } else {
      updatePlayer2({ box: newBox });
    }
  };

  // Import/Export
  const handleExport = (playerId: 1 | 2) => {
    const name = playerId === 1 ? gameState.player1.name : gameState.player2.name;
    const box = playerId === 1 ? player1Box : player2Box;
    exportBoxToExcel(name, box);
  };

  const handleImport = async (file: File, playerId: 1 | 2) => {
    try {
      const importedBox = await importBoxFromExcel(file);
      const currentBox = playerId === 1 ? player1Box : player2Box;
      const mergedBox = currentBox.map((item) => {
        const imported = importedBox.find((i) => i.characterId === item.characterId);
        return imported || item;
      });
      if (playerId === 1) {
        updatePlayer1({ box: mergedBox });
      } else {
        updatePlayer2({ box: mergedBox });
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Erreur lors de l'import du fichier");
    }
  };

  const canProceed = player1Box.some((b) => b.owned) && player2Box.some((b) => b.owned);

  // Get owned characters for display
  const getOwnedCharacters = (playerId: 1 | 2) => {
    const box = playerId === 1 ? player1Box : player2Box;
    return box
      .filter((b) => b.owned)
      .map((b) => {
        const char = characters.find((c) => c.id === b.characterId);
        return char ? { ...char, sequence: b.sequence } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b?.rarity || 0) - (a?.rarity || 0));
  };

  const player1OwnedChars = getOwnedCharacters(1);
  const player2OwnedChars = getOwnedCharacters(2);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Player 1 indicator */}
            <div 
              onClick={() => setActivePlayer(1)}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all",
                activePlayer === 1 
                  ? "ring-2 ring-player1 bg-player1/20" 
                  : "hover:bg-player1/10"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-player1 flex items-center justify-center font-bold text-white text-lg">
                1
              </div>
              <div>
                <Input
                  value={gameState.player1.name}
                  onChange={(e) => updatePlayer1({ name: e.target.value })}
                  placeholder="Joueur 1"
                  className={cn(
                    "bg-transparent border-none text-lg font-bold p-0 h-auto focus-visible:ring-0",
                    activePlayer === 1 ? "text-player1-light" : "text-foreground"
                  )}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">{player1OwnedCount} personnages</span>
                  <span className="text-primary font-bold">{player1Points} pts</span>
                </div>
              </div>
            </div>

            {/* Center - Title */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">Gestion des Box</h1>
              <p className="text-sm text-muted-foreground">
                Sélectionnez les personnages de chaque joueur
              </p>
            </div>

            {/* Player 2 indicator */}
            <div 
              onClick={() => setActivePlayer(2)}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all",
                activePlayer === 2 
                  ? "ring-2 ring-player2 bg-player2/20" 
                  : "hover:bg-player2/10"
              )}
            >
              <div>
                <Input
                  value={gameState.player2.name}
                  onChange={(e) => updatePlayer2({ name: e.target.value })}
                  placeholder="Joueur 2"
                  className={cn(
                    "bg-transparent border-none text-lg font-bold p-0 h-auto focus-visible:ring-0 text-right",
                    activePlayer === 2 ? "text-player2-light" : "text-foreground"
                  )}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex items-center gap-3 text-sm justify-end">
                  <span className="text-primary font-bold">{player2Points} pts</span>
                  <span className="text-muted-foreground">{player2OwnedCount} personnages</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-player2 flex items-center justify-center font-bold text-white text-lg">
                2
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Owned characters display */}
      <div className="border-b border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-start gap-8">
            {/* Player 1 owned */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Box de {gameState.player1.name}</p>
                <div className="flex gap-1">
                  <input
                    type="file"
                    ref={fileInputP1}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImport(file, 1);
                      e.target.value = "";
                    }}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputP1.current?.click()}
                    className="text-xs h-6 px-2"
                  >
                    Import
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport(1)}
                    className="text-xs h-6 px-2"
                  >
                    Export
                  </Button>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap min-h-[80px] p-2 rounded-lg bg-player1/5 border border-player1/20">
                {player1OwnedChars.length === 0 ? (
                  <div className="flex items-center justify-center w-full text-muted-foreground text-sm">
                    Aucun personnage - Cliquez pour selectionner
                  </div>
                ) : (
                  player1OwnedChars.slice(0, 20).map((char) => char && (
                    <CharacterCard
                      key={char.id}
                      character={char}
                      owned
                      sequence={char.sequence}
                      mode="display"
                      size="sm"
                    />
                  ))
                )}
                {player1OwnedChars.length > 20 && (
                  <div className="w-16 h-20 rounded-lg bg-player1/10 flex items-center justify-center text-xs text-muted-foreground">
                    +{player1OwnedChars.length - 20}
                  </div>
                )}
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center justify-center py-4">
              <span className="text-3xl font-bold text-muted-foreground/50">VS</span>
            </div>

            {/* Player 2 owned */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1">
                  <input
                    type="file"
                    ref={fileInputP2}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImport(file, 2);
                      e.target.value = "";
                    }}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport(2)}
                    className="text-xs h-6 px-2"
                  >
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputP2.current?.click()}
                    className="text-xs h-6 px-2"
                  >
                    Import
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Box de {gameState.player2.name}</p>
              </div>
              <div className="flex gap-1.5 flex-wrap justify-end min-h-[80px] p-2 rounded-lg bg-player2/5 border border-player2/20">
                {player2OwnedChars.length === 0 ? (
                  <div className="flex items-center justify-center w-full text-muted-foreground text-sm">
                    Aucun personnage - Cliquez pour selectionner
                  </div>
                ) : (
                  player2OwnedChars.slice(0, 20).map((char) => char && (
                    <CharacterCard
                      key={char.id}
                      character={char}
                      owned
                      sequence={char.sequence}
                      mode="display"
                      size="sm"
                    />
                  ))
                )}
                {player2OwnedChars.length > 20 && (
                  <div className="w-16 h-20 rounded-lg bg-player2/10 flex items-center justify-center text-xs text-muted-foreground">
                    +{player2OwnedChars.length - 20}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active player indicator */}
      <div className={cn(
        "py-2 text-center text-sm font-medium transition-colors",
        activePlayer === 1 ? "bg-player1/20 text-player1-light" : "bg-player2/20 text-player2-light"
      )}>
        Edition de la box de <span className="font-bold">{activePlayer === 1 ? gameState.player1.name : gameState.player2.name}</span>
        <span className="mx-2">-</span>
        <span className="text-muted-foreground">Cliquez sur un personnage pour le selectionner</span>
      </div>

      {/* Filters */}
      <div className="border-b border-border/50 bg-background/50 p-2 sticky top-[76px] z-10">
        <div className="container mx-auto flex items-center gap-4 flex-wrap">
          {/* Search */}
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 h-8 text-sm bg-card"
          />
          
          {/* Element filters */}
          <div className="flex gap-1">
            <Button
              variant={elementFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setElementFilter("all")}
              className="h-8 text-xs"
            >
              Tous
            </Button>
            {elements.map((element) => (
              <Button
                key={element}
                variant={elementFilter === element ? "default" : "ghost"}
                size="sm"
                onClick={() => setElementFilter(element)}
                className={cn(
                  "h-8 text-xs",
                  elementFilter !== element && elementIcons[element].bgColor
                )}
              >
                <span className={elementFilter === element ? "" : elementIcons[element].color}>
                  {element}
                </span>
              </Button>
            ))}
          </div>

          {/* Rarity filters */}
          <div className="flex gap-1 border-l border-border pl-4">
            <Button
              variant={rarityFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setRarityFilter("all")}
              className="h-8 text-xs"
            >
              Toutes
            </Button>
            <Button
              variant={rarityFilter === 5 ? "default" : "ghost"}
              size="sm"
              onClick={() => setRarityFilter(5)}
              className={cn("h-8 text-xs", rarityFilter !== 5 && "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400")}
            >
              5 Stars
            </Button>
            <Button
              variant={rarityFilter === 4 ? "default" : "ghost"}
              size="sm"
              onClick={() => setRarityFilter(4)}
              className={cn("h-8 text-xs", rarityFilter !== 4 && "bg-violet-500/20 hover:bg-violet-500/30 text-violet-400")}
            >
              4 Stars
            </Button>
          </div>

          {/* Owned filter */}
          <div className="flex gap-1 border-l border-border pl-4">
            <Button
              variant={showOwned === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowOwned("all")}
              className="h-8 text-xs"
            >
              Tous
            </Button>
            <Button
              variant={showOwned === "owned" ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowOwned("owned")}
              className="h-8 text-xs"
            >
              Possedes
            </Button>
            <Button
              variant={showOwned === "not-owned" ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowOwned("not-owned")}
              className="h-8 text-xs"
            >
              Non possedes
            </Button>
          </div>

          {/* Quick actions */}
          <div className="flex gap-1 border-l border-border pl-4 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 text-xs bg-transparent"
            >
              Tout selectionner
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              className="h-8 text-xs bg-transparent"
            >
              Tout deselectionner
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTemplate}
              className="h-8 text-xs"
            >
              Template CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Character grid */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2">
            {filteredCharacters.map((char) => {
              const boxItem = getBoxItem(char.id, activePlayer);
              const otherPlayerBoxItem = getBoxItem(char.id, activePlayer === 1 ? 2 : 1);
              
              return (
                <div key={char.id} className="relative">
                  <CharacterCard
                    character={char}
                    owned={boxItem.owned}
                    sequence={boxItem.sequence}
                    onOwnedChange={(owned) => handleOwnedChange(char.id, owned)}
                    onSequenceChange={(seq) => handleSequenceChange(char.id, seq)}
                    mode="edit"
                    size="sm"
                  />
                  {/* Indicator if other player owns this character */}
                  {otherPlayerBoxItem.owned && (
                    <div className={cn(
                      "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background text-[8px] font-bold flex items-center justify-center text-white",
                      activePlayer === 1 ? "bg-player2" : "bg-player1"
                    )}>
                      {activePlayer === 1 ? "2" : "1"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {filteredCharacters.length === 0 && (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              Aucun personnage trouve avec ces filtres
            </div>
          )}
        </div>
      </main>

      {/* Footer - Next button */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-player1" />
                <span>{gameState.player1.name}: {player1OwnedCount} personnages</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-player2" />
                <span>{gameState.player2.name}: {player2OwnedCount} personnages</span>
              </div>
            </div>
            <Button
              onClick={() => setCurrentStep("config")}
              disabled={!canProceed}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Continuer vers la configuration
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
