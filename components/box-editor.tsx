"use client";

import React from "react"

import { useState, useMemo, useRef } from "react";
import { characters, type Element, type Character } from "@/lib/characters";
import { CharacterCard } from "./character-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlayerBox } from "@/lib/game-state";
import { exportBoxToExcel, importBoxFromExcel, downloadTemplate } from "@/lib/excel-utils";
import { cn } from "@/lib/utils";

interface BoxEditorProps {
  playerName: string;
  playerId: 1 | 2;
  box: PlayerBox[];
  onNameChange: (name: string) => void;
  onBoxChange: (box: PlayerBox[]) => void;
  totalPoints: number;
}

const elements: Element[] = ["Glacio", "Fusion", "Electro", "Aero", "Spectro", "Havoc"];
const rarities = [5, 4] as const;

export function BoxEditor({
  playerName,
  playerId,
  box,
  onNameChange,
  onBoxChange,
  totalPoints,
}: BoxEditorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [elementFilter, setElementFilter] = useState<Element | "all">("all");
  const [rarityFilter, setRarityFilter] = useState<5 | 4 | "all">("all");
  const [showOwned, setShowOwned] = useState<"all" | "owned" | "not-owned">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser la box si vide
  const currentBox = useMemo(() => {
    if (box.length === 0) {
      return characters.map((char) => ({
        characterId: char.id,
        owned: false,
        sequence: 0,
      }));
    }
    return box;
  }, [box]);

  // Filtrer les personnages
  const filteredCharacters = useMemo(() => {
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
  }, [searchQuery, elementFilter, rarityFilter, showOwned, currentBox]);

  const handleOwnedChange = (characterId: string, owned: boolean) => {
    const newBox = currentBox.map((item) =>
      item.characterId === characterId
        ? { ...item, owned, sequence: owned ? item.sequence : 0 }
        : item
    );
    onBoxChange(newBox);
  };

  const handleSequenceChange = (characterId: string, sequence: number) => {
    const newBox = currentBox.map((item) =>
      item.characterId === characterId ? { ...item, sequence } : item
    );
    onBoxChange(newBox);
  };

  const handleExport = () => {
    exportBoxToExcel(playerName, currentBox);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedBox = await importBoxFromExcel(file);
      // Fusionner avec la box existante
      const mergedBox = currentBox.map((item) => {
        const imported = importedBox.find((i) => i.characterId === item.characterId);
        return imported || item;
      });
      onBoxChange(mergedBox);
    } catch (error) {
      console.error("Erreur d'import:", error);
      alert("Erreur lors de l'import du fichier");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectAll = () => {
    const newBox = currentBox.map((item) => ({ ...item, owned: true }));
    onBoxChange(newBox);
  };

  const handleDeselectAll = () => {
    const newBox = currentBox.map((item) => ({ ...item, owned: false, sequence: 0 }));
    onBoxChange(newBox);
  };

  const getBoxItem = (characterId: string) => {
    return currentBox.find((b) => b.characterId === characterId) || {
      characterId,
      owned: false,
      sequence: 0,
    };
  };

  const ownedCount = currentBox.filter((b) => b.owned).length;

  return (
    <div className={cn(
      "flex flex-col h-full rounded-xl border-2 overflow-hidden",
      playerId === 1 ? "border-player1/50 bg-player1/5" : "border-player2/50 bg-player2/5"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b",
        playerId === 1 ? "border-player1/30 bg-player1/10" : "border-player2/30 bg-player2/10"
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
              playerId === 1 ? "bg-player1" : "bg-player2"
            )}>
              {playerId}
            </div>
            <Input
              value={playerName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={`Joueur ${playerId}`}
              className="w-40 bg-background/50"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Points totaux</p>
            <p className="text-2xl font-bold text-primary">{totalPoints}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{ownedCount} / {characters.length} personnages</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Tout sélectionner
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              Tout désélectionner
            </Button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="p-3 border-b border-border/50 space-y-3">
        {/* Recherche */}
        <Input
          placeholder="Rechercher un personnage..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background/50"
        />

        {/* Filtres éléments */}
        <div className="flex flex-wrap gap-1">
          <Button
            variant={elementFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setElementFilter("all")}
            className="text-xs"
          >
            Tous
          </Button>
          {elements.map((element) => (
            <Button
              key={element}
              variant={elementFilter === element ? "default" : "outline"}
              size="sm"
              onClick={() => setElementFilter(element)}
              className={cn(
                "text-xs",
                element === "Glacio" && "hover:bg-cyan-500/20 hover:text-cyan-400",
                element === "Fusion" && "hover:bg-orange-500/20 hover:text-orange-400",
                element === "Electro" && "hover:bg-violet-500/20 hover:text-violet-400",
                element === "Aero" && "hover:bg-emerald-500/20 hover:text-emerald-400",
                element === "Spectro" && "hover:bg-yellow-500/20 hover:text-yellow-400",
                element === "Havoc" && "hover:bg-pink-500/20 hover:text-pink-400"
              )}
            >
              {element}
            </Button>
          ))}
        </div>

        {/* Filtres rareté et possession */}
        <div className="flex gap-4">
          <div className="flex gap-1">
            <Button
              variant={rarityFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setRarityFilter("all")}
              className="text-xs"
            >
              Toutes
            </Button>
            <Button
              variant={rarityFilter === 5 ? "default" : "outline"}
              size="sm"
              onClick={() => setRarityFilter(5)}
              className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30"
            >
              5 Stars
            </Button>
            <Button
              variant={rarityFilter === 4 ? "default" : "outline"}
              size="sm"
              onClick={() => setRarityFilter(4)}
              className="text-xs bg-violet-500/20 hover:bg-violet-500/30"
            >
              4 Stars
            </Button>
          </div>

          <div className="flex gap-1">
            <Button
              variant={showOwned === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOwned("all")}
              className="text-xs"
            >
              Tous
            </Button>
            <Button
              variant={showOwned === "owned" ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOwned("owned")}
              className="text-xs"
            >
              Possédés
            </Button>
            <Button
              variant={showOwned === "not-owned" ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOwned("not-owned")}
              className="text-xs"
            >
              Non possédés
            </Button>
          </div>
        </div>
      </div>

      {/* Grille de personnages */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {filteredCharacters.map((char) => {
            const boxItem = getBoxItem(char.id);
            return (
              <CharacterCard
                key={char.id}
                character={char}
                owned={boxItem.owned}
                sequence={boxItem.sequence}
                onOwnedChange={(owned) => handleOwnedChange(char.id, owned)}
                onSequenceChange={(seq) => handleSequenceChange(char.id, seq)}
                mode="edit"
                size="sm"
              />
            );
          })}
        </div>
        {filteredCharacters.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Aucun personnage trouvé
          </div>
        )}
      </div>

      {/* Footer - Import/Export */}
      <div className="p-3 border-t border-border/50 flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          Importer Box
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex-1 bg-transparent"
        >
          Exporter Box
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={downloadTemplate}
          className="text-xs"
        >
          Template
        </Button>
      </div>
    </div>
  );
}
