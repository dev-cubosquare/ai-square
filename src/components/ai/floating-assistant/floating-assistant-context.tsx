"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { createContext, useContext } from "react";

type ChatHelpers = UseChatHelpers<UIMessage>;

interface FloatingAssistantContextValue
  extends Pick<ChatHelpers, "messages" | "sendMessage" | "status"> {
  clearChat: () => void;
  closeAssistant: () => void;
  isAssistantOpen: boolean;
  isMuted: boolean;
  openAssistant: () => void;
  toggleAssistant: () => void;
  toggleMuted: () => void;
}

const FloatingAssistantContext =
  createContext<FloatingAssistantContextValue | null>(null);

export function useFloatingAssistant() {
  const context = useContext(FloatingAssistantContext);

  if (!context) {
    throw new Error(
      "useFloatingAssistant must be used within a FloatingAssistantContext.Provider",
    );
  }

  return context;
}

export const FloatingAssistantContextProvider =
  FloatingAssistantContext.Provider;
