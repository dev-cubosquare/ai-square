"use client";

import { useChat } from "@ai-sdk/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { PromptInputMessage } from "./assistant-panel";

import { FloatingAssistantPanel } from "./assistant-panel";
import { FloatingAssistantTrigger } from "./assistant-trigger";
import { FloatingAssistantContextProvider } from "./floating-assistant-context";
import {
  type FloatingAssistantOptions,
  useFloatingAssistantState,
} from "./use-floating-assistant-state";
import { DefaultChatTransport } from "ai";

const QUICK_SUGGESTIONS = [
  "What services does Square AI offer?",
  "How can AI help my business?",
  "Tell me about your solutions.",
];

const SOUND_STORAGE_KEY = "square-ai-assistant-muted";
const SEND_SOUND_URL = "/sounds/woosh.wav";
const RECEIVE_SOUND_URL = "/sounds/soap-bubble.wav";

const MOBILE_BREAKPOINT = 640;

export interface FloatingAIAssistantProps
  extends Partial<
    Pick<
      FloatingAssistantOptions,
      "defaultPosition" | "defaultCollapsed" | "draggable"
    >
  > {
  children?: ReactNode;
}

export function FloatingAIAssistant({
  children,
  defaultCollapsed = true,
  defaultPosition,
  draggable = true,
}: FloatingAIAssistantProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
    api: 'http://192.168.1.200:10060/chat/ui',
  }),
    
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const [isMuted, setIsMuted] = useState(false);
  const sendSoundRef = useRef<HTMLAudioElement | null>(null);
  const receiveSoundRef = useRef<HTMLAudioElement | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const isMobile = useIsMobile();
  const safeDraggable = draggable && !isMobile;

  const {
    cardX,
    cardY,
    buttonX,
    buttonY,
    isReady,
    isExpanded,
    showTooltip,
    setShowTooltip,
    toggleExpanded,
    tooltipRotate,
    tooltipTranslateX,
    triggerRef,
    triggerDragHandlers,
    triggerDragProps,
    panelDragProps,
    handleTooltipPointerMove,
    resetTooltipMotion,
    isDragging,
  } = useFloatingAssistantState({
    defaultCollapsed,
    defaultPosition,
    draggable: safeDraggable,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedValue = window.localStorage.getItem(SOUND_STORAGE_KEY);
    if (storedValue !== null) {
      setIsMuted(storedValue === "true");
    }
  }, []);

  const toggleMuted = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sendAudio = new Audio(SEND_SOUND_URL);
    const receiveAudio = new Audio(RECEIVE_SOUND_URL);

    sendAudio.volume = 0.45;
    receiveAudio.volume = 0.6;

    sendSoundRef.current = sendAudio;
    receiveSoundRef.current = receiveAudio;

    return () => {
      sendAudio.pause();
      receiveAudio.pause();
      sendSoundRef.current = null;
      receiveSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sendSoundRef.current) {
      sendSoundRef.current.muted = isMuted;
    }
    if (receiveSoundRef.current) {
      receiveSoundRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (messages.length === 0) {
      lastMessageIdRef.current = null;
      return;
    }

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage?.id) return;

    if (!lastMessageIdRef.current) {
      lastMessageIdRef.current = latestMessage.id;
      return;
    }

    if (lastMessageIdRef.current === latestMessage.id) return;

    lastMessageIdRef.current = latestMessage.id;

    if (isMuted) return;

    if (latestMessage.role !== "assistant" && latestMessage.role !== "user") {
      return;
    }

    const targetAudio =
      latestMessage.role === "assistant"
        ? receiveSoundRef.current
        : sendSoundRef.current;

    if (!targetAudio) return;

    targetAudio.currentTime = 0;
    void targetAudio.play().catch((error) => {
      console.warn("Assistant sound playback failed:", error);
    });
  }, [isMuted, messages]);

  const openAssistant = useCallback(() => {
    if (!isExpanded) {
      toggleExpanded();
    }
  }, [isExpanded, toggleExpanded]);

  const closeAssistant = useCallback(() => {
    if (isExpanded) {
      toggleExpanded();
    }
  }, [isExpanded, toggleExpanded]);

  const contextValue = useMemo(
    () => ({
      messages,
      sendMessage,
      status,
      openAssistant,
      closeAssistant,
      toggleAssistant: toggleExpanded,
      isAssistantOpen: isExpanded,
      isMuted,
      toggleMuted,
    }),
    [
      closeAssistant,
      isExpanded,
      isMuted,
      messages,
      openAssistant,
      sendMessage,
      status,
      toggleMuted,
      toggleExpanded,
    ],
  );

  const handlePromptSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());

      if (!hasText) {
        return;
      }

      sendMessage({
        text: message.text || "Sent with attachments",
        files: message.files as any,
      });
    },
    [sendMessage],
  );

  const handleQuickSend = useCallback(
    (prompt: string) => {
      sendMessage({ text: prompt });
    },
    [sendMessage],
  );

  return (
    <FloatingAssistantContextProvider value={contextValue}>
      {children}

      {!isExpanded && (
        <FloatingAssistantTrigger
          buttonX={buttonX}
          buttonY={buttonY}
          isDragging={isDragging}
          isReady={isReady}
          onHideTooltip={() => setShowTooltip(false)}
          onPointerMove={handleTooltipPointerMove}
          onShowTooltip={() => setShowTooltip(true)}
          onToggle={toggleExpanded}
          resetTooltipMotion={resetTooltipMotion}
          showTooltip={showTooltip}
          tooltipRotate={tooltipRotate}
          tooltipTranslateX={tooltipTranslateX}
          triggerDragHandlers={triggerDragHandlers}
          triggerDragProps={triggerDragProps}
          triggerRef={triggerRef}
        />
      )}

      <FloatingAssistantPanel
        cardX={cardX}
        cardY={cardY}
        isMobile={isMobile}
        isReady={isReady}
        messages={messages}
        onClose={toggleExpanded}
        onPromptSubmit={handlePromptSubmit}
        onQuickSend={handleQuickSend}
        open={isExpanded}
        panelDragProps={panelDragProps}
        status={status}
        suggestions={QUICK_SUGGESTIONS}
      />
    </FloatingAssistantContextProvider>
  );
}

function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}
