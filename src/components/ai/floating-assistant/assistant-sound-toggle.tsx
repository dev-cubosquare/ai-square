"use client";

import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useFloatingAssistant } from "./floating-assistant-context";

export function AssistantSoundToggle() {
  const { isMuted, toggleMuted } = useFloatingAssistant();

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={toggleMuted}
      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
    >
      {isMuted ? (
        <VolumeX aria-hidden className="h-4 w-4" />
      ) : (
        <Volume2 aria-hidden className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isMuted ? "Unmute assistant sounds" : "Mute assistant sounds"}
      </span>
    </Button>
  );
}
