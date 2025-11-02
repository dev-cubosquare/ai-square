"use client";

import { Settings, Trash2, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFloatingAssistant } from "./floating-assistant-context";

export function AssistantSettingsMenu() {
  const { isMuted, toggleMuted, clearChat } = useFloatingAssistant();
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearChat = (e: Event) => {
    e.preventDefault();
    if (showConfirm) {
      clearChat();
      setShowConfirm(false);
      setOpen(false);
    } else {
      setShowConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset confirmation state when menu closes
      setShowConfirm(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/10"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-[10000]" sideOffset={8}>
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={toggleMuted}>
          {isMuted ? (
            <>
              <VolumeX className="mr-2 h-4 w-4" />
              <span>Unmute Sounds</span>
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              <span>Mute Sounds</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={handleClearChat}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>{showConfirm ? "Click Again to Confirm" : "Clear Chat History"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
