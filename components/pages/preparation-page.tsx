"use client";

import { useState, useEffect } from "react";
import { useGame } from "@/contexts/game-context";
import { characters } from "@/lib/characters";
import { CharacterCard } from "@/components/character-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableCharacterProps {
  id: string;
  characterId: string;
  playerId: 1 | 2;
}

function SortableCharacter({ id, characterId, playerId }: SortableCharacterProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const character = characters.find((c) => c.id === characterId);
  if (!character) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-30"
      )}
    >
      <CharacterCard
        character={character}
        mode="display"
        owned
        isPicked
        pickedBy={playerId}
        size="lg"
      />
    </div>
  );
}

interface PlayerTeamEditorProps {
  playerId: 1 | 2;
  playerName: string;
  picks: string[];
  team1: string[];
  team2: string[];
  onTeamChange: (team1: string[], team2: string[]) => void;
}

function PlayerTeamEditor({
  playerId,
  playerName,
  picks,
  team1,
  team2,
  onTeamChange,
}: PlayerTeamEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize teams if empty
  useEffect(() => {
    if (team1.length === 0 && team2.length === 0 && picks.length === 6) {
      onTeamChange(picks.slice(0, 3), picks.slice(3, 6));
    }
  }, [picks, team1.length, team2.length, onTeamChange]);

  // Create unique IDs for items
  const team1Items = team1.map((id) => `t1-${id}`);
  const team2Items = team2.map((id) => `t2-${id}`);
  const allItems = [...team1Items, ...team2Items];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    if (active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Parse IDs: format is "t1-characterId" or "t2-characterId"
    const activeTeam = activeId.startsWith("t1-") ? 1 : 2;
    const overTeam = overId.startsWith("t1-") ? 1 : 2;
    const activeCharId = activeId.substring(3);
    const overCharId = overId.substring(3);

    let newTeam1 = [...team1];
    let newTeam2 = [...team2];

    if (activeTeam === overTeam) {
      // Same team - reorder
      if (activeTeam === 1) {
        const oldIndex = newTeam1.indexOf(activeCharId);
        const newIndex = newTeam1.indexOf(overCharId);
        if (oldIndex !== -1 && newIndex !== -1) {
          newTeam1 = arrayMove(newTeam1, oldIndex, newIndex);
        }
      } else {
        const oldIndex = newTeam2.indexOf(activeCharId);
        const newIndex = newTeam2.indexOf(overCharId);
        if (oldIndex !== -1 && newIndex !== -1) {
          newTeam2 = arrayMove(newTeam2, oldIndex, newIndex);
        }
      }
    } else {
      // Different teams - swap characters
      const activeIndex = activeTeam === 1 
        ? newTeam1.indexOf(activeCharId) 
        : newTeam2.indexOf(activeCharId);
      const overIndex = overTeam === 1 
        ? newTeam1.indexOf(overCharId) 
        : newTeam2.indexOf(overCharId);

      if (activeIndex !== -1 && overIndex !== -1) {
        if (activeTeam === 1) {
          // Swap: team1[activeIndex] <-> team2[overIndex]
          const temp = newTeam1[activeIndex];
          newTeam1[activeIndex] = newTeam2[overIndex];
          newTeam2[overIndex] = temp;
        } else {
          // Swap: team2[activeIndex] <-> team1[overIndex]
          const temp = newTeam2[activeIndex];
          newTeam2[activeIndex] = newTeam1[overIndex];
          newTeam1[overIndex] = temp;
        }
      }
    }

    onTeamChange(newTeam1, newTeam2);
  };

  // Get active character for drag overlay
  const activeCharId = activeId?.substring(3);
  const activeCharacter = activeCharId ? characters.find((c) => c.id === activeCharId) : null;

  return (
    <div className={cn(
      "flex-1 p-6 rounded-2xl border-2",
      playerId === 1 
        ? "border-player1/50 bg-gradient-to-br from-player1/10 to-transparent" 
        : "border-player2/50 bg-gradient-to-br from-player2/10 to-transparent"
    )}>
      {/* Player header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center font-bold text-2xl text-white",
          playerId === 1 ? "bg-player1" : "bg-player2"
        )}>
          {playerId}
        </div>
        <div>
          <h2 className={cn(
            "text-2xl font-bold",
            playerId === 1 ? "text-player1-light" : "text-player2-light"
          )}>
            {playerName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Glissez-deposez pour organiser vos equipes
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allItems} strategy={rectSortingStrategy}>
          <div className="space-y-6">
            {/* Team 1 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Equipe 1</h3>
              <div className={cn(
                "p-4 rounded-xl border-2 border-dashed min-h-[140px]",
                playerId === 1 ? "border-player1/30 bg-player1/5" : "border-player2/30 bg-player2/5"
              )}>
                <div className="flex gap-4 justify-center">
                  {team1.map((charId) => (
                    <SortableCharacter
                      key={`t1-${charId}`}
                      id={`t1-${charId}`}
                      characterId={charId}
                      playerId={playerId}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Equipe 2</h3>
              <div className={cn(
                "p-4 rounded-xl border-2 border-dashed min-h-[140px]",
                playerId === 1 ? "border-player1/30 bg-player1/5" : "border-player2/30 bg-player2/5"
              )}>
                <div className="flex gap-4 justify-center">
                  {team2.map((charId) => (
                    <SortableCharacter
                      key={`t2-${charId}`}
                      id={`t2-${charId}`}
                      characterId={charId}
                      playerId={playerId}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SortableContext>

        {/* Drag overlay for smoother visual feedback */}
        <DragOverlay>
          {activeCharacter && (
            <div className="opacity-90 scale-105">
              <CharacterCard
                character={activeCharacter}
                mode="display"
                owned
                isPicked
                pickedBy={playerId}
                size="lg"
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export function PreparationPage() {
  const {
    gameState,
    updatePlayer1Teams,
    updatePlayer2Teams,
    resetDraft,
    setCurrentStep,
  } = useGame();

  const { draft, config, player1, player2, finalTeams } = gameState;

  // Timer
  const [timeLeft, setTimeLeft] = useState(config.prepTimerMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Bans summary
  const player1Bans = draft.bans.filter((b) => b.bannedBy === 1);
  const player2Bans = draft.bans.filter((b) => b.bannedBy === 2);

  const handleReplay = () => {
    resetDraft();
    setCurrentStep("draft");
  };

  const handleQuit = () => {
    setCurrentStep("config");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center flex-col">
            <h1 className="text-3xl font-bold text-foreground">Préparation du PvP</h1>
            <div className={cn(
              "text-5xl font-mono font-bold mt-2 px-6 py-2 rounded-lg",
              timeLeft < 60 
                ? "text-destructive bg-destructive/10" 
                : "text-primary bg-primary/10"
            )}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Organisez vos équipes avant le combat
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* VS Banner */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-8">
            <span className={cn(
              "text-2xl font-bold",
              "text-player1-light"
            )}>
              {player1.name}
            </span>
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-player1 to-player2 flex items-center justify-center">
                <span className="text-3xl font-black text-white">VS</span>
              </div>
            </div>
            <span className={cn(
              "text-2xl font-bold",
              "text-player2-light"
            )}>
              {player2.name}
            </span>
          </div>
        </div>

        {/* Team editors side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PlayerTeamEditor
            playerId={1}
            playerName={player1.name}
            picks={draft.player1Picks}
            team1={finalTeams.player1.team1}
            team2={finalTeams.player1.team2}
            onTeamChange={(t1, t2) => updatePlayer1Teams({ team1: t1, team2: t2 })}
          />
          <PlayerTeamEditor
            playerId={2}
            playerName={player2.name}
            picks={draft.player2Picks}
            team1={finalTeams.player2.team1}
            team2={finalTeams.player2.team2}
            onTeamChange={(t1, t2) => updatePlayer2Teams({ team1: t1, team2: t2 })}
          />
        </div>

        {/* Bans summary */}
        <div className="bg-card/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            Personnages bannis
          </h3>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Bans de {player1.name}</p>
              <div className="flex gap-2">
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
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">Bans de {player2.name}</p>
              <div className="flex gap-2 justify-end">
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
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleQuit}
          >
            Retour à la configuration
          </Button>
          <Button
            size="lg"
            onClick={handleReplay}
            className="bg-primary hover:bg-primary/90"
          >
            Rejouer une draft
          </Button>
        </div>
      </main>
    </div>
  );
}
