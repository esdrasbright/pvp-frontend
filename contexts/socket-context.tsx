"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import type { PlayerBox, DraftState, DraftConfig } from "@/lib/game-state";

// ============================================
// TYPES
// ============================================

interface DiscordUser {
  discordId: string;
  username: string;
  avatar: string | null;
}

interface RoomPlayer {
  discordId: string;
  username: string;
  avatar: string | null;
  socketId: string;
}

interface RoomState {
  player1: RoomPlayer | null;
  player2: RoomPlayer | null;
}

interface SocketContextType {
  // Etat connexion
  socket: Socket | null;
  isConnected: boolean;
  
  // Authentification Discord
  user: DiscordUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithDiscord: () => void;
  logout: () => void;
  
  // Room
  roomState: RoomState;
  joinAsPlayer: (slot: "player1" | "player2") => void;
  leaveSlot: () => void;
  myPlayerSlot: 1 | 2 | null;
  
  // Box
  myBox: PlayerBox[];
  saveBox: (box: PlayerBox[]) => void;
  boxSaving: boolean;
  
  // Config
  serverConfig: DraftConfig | null;
  updateConfig: (config: Partial<DraftConfig>) => void;
  
  // Draft
  serverDraftState: DraftState | null;
  startDraft: () => void;
  ban: (characterId: string) => void;
  pick: (characterId: string) => void;
  resetDraft: () => void;
  isMyTurn: boolean;
  
  // Errors
  lastError: string | null;
  clearError: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// ============================================
// CONFIGURATION
// ============================================

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

// ============================================
// PROVIDER
// ============================================

export function SocketProvider({ children }: { children: ReactNode }) {
  // Socket state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Auth state
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Room state
  const [roomState, setRoomState] = useState<RoomState>({
    player1: null,
    player2: null,
  });
  
  // Box state
  const [myBox, setMyBox] = useState<PlayerBox[]>([]);
  const [boxSaving, setBoxSaving] = useState(false);
  
  // Config state
  const [serverConfig, setServerConfig] = useState<DraftConfig | null>(null);
  
  // Draft state
  const [serverDraftState, setServerDraftState] = useState<DraftState | null>(null);
  
  // Error state
  const [lastError, setLastError] = useState<string | null>(null);

  // ----------------------------------------
  // Initialisation Socket
  // ----------------------------------------
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      withCredentials: true,
      autoConnect: false,
    });

    newSocket.on("connect", () => {
      console.log("[Socket] Connecte");
      setIsConnected(true);
      
      // Si on a deja un user, s'authentifier
      if (user) {
        newSocket.emit("auth:login", user);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("[Socket] Deconnecte");
      setIsConnected(false);
    });

    // Room events
    newSocket.on("room:state", (data) => {
      setRoomState({
        player1: data.player1,
        player2: data.player2,
      });
      if (data.draftState) {
        setServerDraftState(data.draftState);
      }
      if (data.config) {
        setServerConfig(data.config);
      }
    });

    newSocket.on("room:updated", (data) => {
      setRoomState({
        player1: data.player1,
        player2: data.player2,
      });
    });

    // Box events
    newSocket.on("box:loaded", (data) => {
      console.log("[Socket] Box chargee:", data.box?.length, "personnages");
      setMyBox(data.box || []);
    });

    newSocket.on("box:saved", () => {
      setBoxSaving(false);
    });

    // Config events
    newSocket.on("config:updated", (config) => {
      setServerConfig(config);
    });

    // Draft events
    newSocket.on("draft:started", (data) => {
      setServerDraftState(data.draftState);
      setServerConfig(data.config);
    });

    newSocket.on("draft:updated", (data) => {
      setServerDraftState(data.draftState);
    });

    newSocket.on("draft:reset", () => {
      setServerDraftState(null);
    });

    // Error events
    newSocket.on("error", (data) => {
      setLastError(data.message);
      setBoxSaving(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Connecter le socket quand l'utilisateur est authentifie
  useEffect(() => {
    if (user && socket && !socket.connected) {
      socket.connect();
    }
  }, [user, socket]);

  // Authentifier apres connexion socket
  useEffect(() => {
    if (isConnected && user && socket) {
      socket.emit("auth:login", user);
    }
  }, [isConnected, user, socket]);

  // ----------------------------------------
  // Verifier la session au chargement
  // ----------------------------------------
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${SERVER_URL}/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.log("[Auth] Pas de session");
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  // ----------------------------------------
  // Fonctions d'authentification
  // ----------------------------------------
  const loginWithDiscord = useCallback(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/discord`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${SERVER_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignorer les erreurs
    }
    setUser(null);
    socket?.disconnect();
  }, [socket]);

  // ----------------------------------------
  // Fonctions Room
  // ----------------------------------------
  const joinAsPlayer = useCallback(
    (slot: "player1" | "player2") => {
      socket?.emit("room:join", { slot });
    },
    [socket]
  );

  const leaveSlot = useCallback(() => {
    socket?.emit("room:leave");
  }, [socket]);

  const myPlayerSlot = user
    ? roomState.player1?.discordId === user.discordId
      ? 1
      : roomState.player2?.discordId === user.discordId
        ? 2
        : null
    : null;

  // ----------------------------------------
  // Fonctions Box
  // ----------------------------------------
  const saveBox = useCallback(
    (box: PlayerBox[]) => {
      setBoxSaving(true);
      setMyBox(box);
      socket?.emit("box:save", { box });
    },
    [socket]
  );

  // ----------------------------------------
  // Fonctions Config
  // ----------------------------------------
  const updateConfig = useCallback(
    (config: Partial<DraftConfig>) => {
      socket?.emit("config:update", config);
    },
    [socket]
  );

  // ----------------------------------------
  // Fonctions Draft
  // ----------------------------------------
  const startDraft = useCallback(() => {
    socket?.emit("draft:start");
  }, [socket]);

  const ban = useCallback(
    (characterId: string) => {
      socket?.emit("draft:ban", { characterId });
    },
    [socket]
  );

  const pick = useCallback(
    (characterId: string) => {
      socket?.emit("draft:pick", { characterId });
    },
    [socket]
  );

  const resetDraft = useCallback(() => {
    socket?.emit("draft:reset");
  }, [socket]);

  const isMyTurn =
    serverDraftState && myPlayerSlot
      ? serverDraftState.currentPlayer === myPlayerSlot
      : false;

  // ----------------------------------------
  // Fonctions Error
  // ----------------------------------------
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithDiscord,
        logout,
        roomState,
        joinAsPlayer,
        leaveSlot,
        myPlayerSlot,
        myBox,
        saveBox,
        boxSaving,
        serverConfig,
        updateConfig,
        serverDraftState,
        startDraft,
        ban,
        pick,
        resetDraft,
        isMyTurn,
        lastError,
        clearError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
