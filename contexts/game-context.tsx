"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  type GameState,
  type DraftConfig,
  type Player,
  type DraftState,
  type TeamAssignment,
  initialGameState,
  initialDraftState,
  initialTeamAssignment,
} from "@/lib/game-state";
import { characters, getCharacterPoints, calculateBalanceBans } from "@/lib/characters";

interface GameContextType {
  gameState: GameState;
  currentStep: "box" | "config" | "draft" | "preparation";
  setCurrentStep: (step: "box" | "config" | "draft" | "preparation") => void;
  updatePlayer1: (player: Partial<Player>) => void;
  updatePlayer2: (player: Partial<Player>) => void;
  updateConfig: (config: Partial<DraftConfig>) => void;
  updateDraft: (draft: Partial<DraftState>) => void;
  updatePlayer1Teams: (teams: TeamAssignment) => void;
  updatePlayer2Teams: (teams: TeamAssignment) => void;
  calculatePlayerPoints: (playerId: 1 | 2) => number;
  resetDraft: () => void;
  resetAll: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [currentStep, setCurrentStep] = useState<"box" | "config" | "draft" | "preparation">("box");

  const calculatePlayerPoints = useCallback((playerId: 1 | 2): number => {
    const player = playerId === 1 ? gameState.player1 : gameState.player2;
    let total = 0;
    for (const item of player.box) {
      if (item.owned) {
        total += getCharacterPoints(item.characterId, item.sequence, gameState.config.gameMode);
      }
    }
    return total;
  }, [gameState]);

  const updatePlayer1 = useCallback((updates: Partial<Player>) => {
    setGameState((prev) => ({
      ...prev,
      player1: { ...prev.player1, ...updates },
    }));
  }, []);

  const updatePlayer2 = useCallback((updates: Partial<Player>) => {
    setGameState((prev) => ({
      ...prev,
      player2: { ...prev.player2, ...updates },
    }));
  }, []);

  const updateConfig = useCallback((updates: Partial<DraftConfig>) => {
    setGameState((prev) => {
      const newConfig = { ...prev.config, ...updates };
      
      // Recalculer les bans d'équilibrage si le mode de jeu change
      if (updates.gameMode) {
        const p1Points = calculatePlayerPoints(1);
        const p2Points = calculatePlayerPoints(2);
        const { player, bans } = calculateBalanceBans(p1Points, p2Points);
        newConfig.balanceBans = bans;
        newConfig.balanceBansPlayer = player;
      }
      
      return {
        ...prev,
        config: newConfig,
      };
    });
  }, [calculatePlayerPoints]);

  const updateDraft = useCallback((updates: Partial<DraftState>) => {
    setGameState((prev) => ({
      ...prev,
      draft: { ...prev.draft, ...updates },
    }));
  }, []);

  const updatePlayer1Teams = useCallback((teams: TeamAssignment) => {
    setGameState((prev) => ({
      ...prev,
      finalTeams: { ...prev.finalTeams, player1: teams },
    }));
  }, []);

  const updatePlayer2Teams = useCallback((teams: TeamAssignment) => {
    setGameState((prev) => ({
      ...prev,
      finalTeams: { ...prev.finalTeams, player2: teams },
    }));
  }, []);

  const resetDraft = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      draft: { ...initialDraftState },
      finalTeams: {
        player1: { ...initialTeamAssignment },
        player2: { ...initialTeamAssignment },
      },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setGameState(initialGameState);
    setCurrentStep("box");
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        currentStep,
        setCurrentStep,
        updatePlayer1,
        updatePlayer2,
        updateConfig,
        updateDraft,
        updatePlayer1Teams,
        updatePlayer2Teams,
        calculatePlayerPoints,
        resetDraft,
        resetAll,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
