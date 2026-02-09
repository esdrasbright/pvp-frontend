"use client";

import { useSocket } from "@/contexts/socket-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, Wifi, WifiOff } from "lucide-react";

export function DiscordLogin() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isConnected,
    loginWithDiscord,
    logout,
  } = useSocket();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={loginWithDiscord}
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white gap-2"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
        Se connecter avec Discord
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Status connexion */}
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded text-xs",
          isConnected
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        )}
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>En ligne</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Hors ligne</span>
          </>
        )}
      </div>

      {/* Avatar et nom */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
        {user?.avatar ? (
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={user.username}
            className="w-7 h-7 rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-xs font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-foreground">
          {user?.username}
        </span>
      </div>

      {/* Bouton deconnexion */}
      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        className="text-muted-foreground hover:text-destructive"
        title="Se deconnecter"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
