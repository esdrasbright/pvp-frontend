// Types et état du jeu PvP

export type GameMode = "whiwa" | "toa";

export interface PlayerBox {
  characterId: string;
  owned: boolean;
  sequence: number;
}

export interface Player {
  name: string;
  box: PlayerBox[];
  totalPoints: number;
}

export interface DraftConfig {
  gameMode: GameMode;
  bansPhase1: number;
  bansPhase2: number;
  draftTimerMinutes: number;
  draftTimerSeconds: number;
  prepTimerMinutes: number;
  balanceBans: number;
  balanceBansPlayer: 1 | 2;
}

export interface BannedCharacter {
  characterId: string;
  phase: "phase1" | "phase2" | "balance";
  bannedBy: 1 | 2;
}

export interface PickedCharacter {
  characterId: string;
  pickedBy: 1 | 2;
  order: number;
}

export interface TeamAssignment {
  team1: string[]; // 3 character IDs
  team2: string[]; // 3 character IDs
}

export interface DraftState {
  phase: "ban1" | "pick1" | "ban2" | "pick2" | "complete";
  currentPlayer: 1 | 2;
  bans: BannedCharacter[];
  picks: PickedCharacter[];
  player1Picks: string[];
  player2Picks: string[];
  currentPhase1BanCount: { player1: number; player2: number };
  currentPhase2BanCount: { player1: number; player2: number };
  currentPick1Count: { player1: number; player2: number };
  currentPick2Count: { player1: number; player2: number };
  balanceBansUsed: number;
}

export interface GameState {
  player1: Player;
  player2: Player;
  config: DraftConfig;
  draft: DraftState;
  finalTeams: {
    player1: TeamAssignment;
    player2: TeamAssignment;
  };
}

// État initial
export const initialDraftConfig: DraftConfig = {
  gameMode: "whiwa",
  bansPhase1: 1,
  bansPhase2: 1,
  draftTimerMinutes: 5,
  draftTimerSeconds: 0,
  prepTimerMinutes: 7,
  balanceBans: 0,
  balanceBansPlayer: 1
};

export const initialPlayer: Player = {
  name: "",
  box: [],
  totalPoints: 0
};

export const initialDraftState: DraftState = {
  phase: "ban1",
  currentPlayer: 1,
  bans: [],
  picks: [],
  player1Picks: [],
  player2Picks: [],
  currentPhase1BanCount: { player1: 0, player2: 0 },
  currentPhase2BanCount: { player1: 0, player2: 0 },
  currentPick1Count: { player1: 0, player2: 0 },
  currentPick2Count: { player1: 0, player2: 0 },
  balanceBansUsed: 0
};

export const initialTeamAssignment: TeamAssignment = {
  team1: [],
  team2: []
};

export const initialGameState: GameState = {
  player1: { ...initialPlayer, name: "Joueur 1" },
  player2: { ...initialPlayer, name: "Joueur 2" },
  config: initialDraftConfig,
  draft: initialDraftState,
  finalTeams: {
    player1: { ...initialTeamAssignment },
    player2: { ...initialTeamAssignment }
  }
};
