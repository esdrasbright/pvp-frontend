"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Character, Element } from "@/lib/characters";

interface CharacterCardProps {
  character: Character;
  owned?: boolean;
  sequence?: number;
  onOwnedChange?: (owned: boolean) => void;
  onSequenceChange?: (sequence: number) => void;
  mode?: "edit" | "display" | "draft";
  player1Sequence?: number | null;
  player2Sequence?: number | null;
  isBanned?: boolean;
  isPicked?: boolean;
  pickedBy?: 1 | 2;
  isSelectable?: boolean;
  onSelect?: () => void;
  size?: "sm" | "md" | "lg";
}

const elementColorMap: Record<Element, { bg: string; border: string; glow: string }> = {
  Glacio: { bg: "bg-cyan-500/20", border: "border-cyan-500/50", glow: "shadow-cyan-500/30" },
  Fusion: { bg: "bg-orange-500/20", border: "border-orange-500/50", glow: "shadow-orange-500/30" },
  Electro: { bg: "bg-violet-500/20", border: "border-violet-500/50", glow: "shadow-violet-500/30" },
  Aero: { bg: "bg-emerald-500/20", border: "border-emerald-500/50", glow: "shadow-emerald-500/30" },
  Spectro: { bg: "bg-yellow-500/20", border: "border-yellow-500/50", glow: "shadow-yellow-500/30" },
  Havoc: { bg: "bg-pink-500/20", border: "border-pink-500/50", glow: "shadow-pink-500/30" },
};

const sizeClasses = {
  sm: "w-16 h-20",
  md: "w-24 h-28",
  lg: "w-32 h-36",
};

export function CharacterCard({
  character,
  owned = false,
  sequence = 0,
  onOwnedChange,
  onSequenceChange,
  mode = "display",
  player1Sequence,
  player2Sequence,
  isBanned = false,
  isPicked = false,
  pickedBy,
  isSelectable = true,
  onSelect,
  size = "md",
}: CharacterCardProps) {
  const [imageError, setImageError] = useState(false);
  const elementColors = elementColorMap[character.element];
  
  const showDefaultAvatar = !character.image || imageError;
  
  const handleClick = () => {
    if (mode === "edit" && onOwnedChange) {
      onOwnedChange(!owned);
    } else if (mode === "draft" && isSelectable && onSelect) {
      onSelect();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(/[\s-]+/)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer group",
        sizeClasses[size],
        elementColors.bg,
        elementColors.border,
        mode === "edit" && owned && "ring-2 ring-primary",
        mode === "draft" && isBanned && "opacity-40 grayscale",
        mode === "draft" && isPicked && pickedBy === 1 && "ring-2 ring-player1",
        mode === "draft" && isPicked && pickedBy === 2 && "ring-2 ring-player2",
        mode === "draft" && !isSelectable && "cursor-not-allowed opacity-50",
        mode === "draft" && isSelectable && "hover:scale-105 hover:shadow-lg",
        elementColors.glow
      )}
    >
      {/* Image ou avatar par défaut */}
      <div className="absolute inset-0 flex items-center justify-center">
        {showDefaultAvatar ? (
          <div className={cn(
            "w-full h-full flex items-center justify-center text-foreground font-bold",
            size === "sm" && "text-sm",
            size === "md" && "text-lg",
            size === "lg" && "text-xl"
          )}>
            {getInitials(character.name)}
          </div>
        ) : (
          <Image
            src={character.image || "/placeholder.svg"}
            alt={character.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Overlay pour rareté */}
      <div className={cn(
        "absolute top-0 left-0 px-1 text-xs font-bold rounded-br",
        character.rarity === 5 ? "bg-yellow-500 text-black" : "bg-violet-500 text-white"
      )}>
        {character.rarity}
      </div>

      {/* Étiquettes de possession (mode draft) */}
      {mode === "draft" && (
        <div className="absolute top-0 right-0 flex flex-col gap-0.5">
          {player1Sequence !== null && player1Sequence !== undefined && (
            <div className="bg-player1 text-white text-xs font-bold px-1 rounded-bl">
              S{player1Sequence}
            </div>
          )}
          {player2Sequence !== null && player2Sequence !== undefined && (
            <div className="bg-player2 text-white text-xs font-bold px-1 rounded-bl">
              S{player2Sequence}
            </div>
          )}
        </div>
      )}

      {/* Indicateur de séquence (mode edit/display) */}
      {mode !== "draft" && owned && (
        <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-tl">
          S{sequence}
        </div>
      )}

      {/* Icône de ban */}
      {isBanned && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" />
          </svg>
        </div>
      )}

      {/* Indicateur de pick */}
      {isPicked && !isBanned && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          pickedBy === 1 ? "bg-player1/40" : "bg-player2/40"
        )}>
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
      )}

      {/* Nom du personnage */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
        <p className={cn(
          "text-white font-medium truncate text-center",
          size === "sm" && "text-[10px]",
          size === "md" && "text-xs",
          size === "lg" && "text-sm"
        )}>
          {character.name}
        </p>
      </div>

      {/* Contrôle de séquence (mode edit) */}
      {mode === "edit" && owned && onSequenceChange && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={sequence}
            onChange={(e) => onSequenceChange(parseInt(e.target.value, 10))}
            className="bg-black/80 text-white text-xs rounded px-1 py-0.5 border border-white/30"
          >
            {Array.from({ length: character.maxSequence + 1 }, (_, i) => (
              <option key={i} value={i}>
                S{i}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
