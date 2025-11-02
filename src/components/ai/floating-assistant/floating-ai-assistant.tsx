"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
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

const DEFAULT_SUGGESTIONS: string[] = [
];

const SOUND_STORAGE_KEY = "square-ai-assistant-muted";
const CHAT_STORAGE_KEY = "square-ai-assistant-chat";
const READ_STATUS_STORAGE_KEY = "square-ai-assistant-read-status";
const CHAT_TTL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds - chat resets after 2 hours of inactivity
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
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
    api: 'https://square-ai-chat.csqr.app/chat/ui',
  }),

    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const [isMuted, setIsMuted] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string>("");
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const sendSoundRef = useRef<HTMLAudioElement | null>(null);
  const receiveSoundRef = useRef<HTMLAudioElement | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const lastProcessedMessageIdRef = useRef<string | null>(null);
  const lastReadMessageIdRef = useRef<string | null>(null);

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

  // Load mute preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedValue = window.localStorage.getItem(SOUND_STORAGE_KEY);
    if (storedValue !== null) {
      setIsMuted(storedValue === "true");
    }
  }, []);

  // Load chat messages from storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedData = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (storedData) {
        const { messages: savedMessages, timestamp } = JSON.parse(storedData);
        const now = Date.now();

        // Check if stored messages are still valid (within TTL)
        if (now - timestamp < CHAT_TTL && Array.isArray(savedMessages) && savedMessages.length > 0) {
          setMessages(savedMessages);
        } else {
          // Clear expired messages
          window.localStorage.removeItem(CHAT_STORAGE_KEY);
          window.localStorage.removeItem(READ_STATUS_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn("Failed to load chat messages:", error);
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
      window.localStorage.removeItem(READ_STATUS_STORAGE_KEY);
    }
  }, [setMessages]);

  // Load read status from storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedReadStatus = window.localStorage.getItem(READ_STATUS_STORAGE_KEY);
      if (storedReadStatus) {
        const { lastReadMessageId, hasUnread } = JSON.parse(storedReadStatus);
        if (lastReadMessageId) {
          lastReadMessageIdRef.current = lastReadMessageId;
        }
        if (typeof hasUnread === "boolean") {
          setHasUnreadMessages(hasUnread);
        }
      }
    } catch (error) {
      console.warn("Failed to load read status:", error);
      window.localStorage.removeItem(READ_STATUS_STORAGE_KEY);
    }
  }, []);

  // Save chat messages to storage whenever they change
  useEffect(() => {
    if (typeof window === "undefined" || messages.length === 0) return;

    try {
      const dataToStore = {
        messages,
        timestamp: Date.now(),
      };
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.warn("Failed to save chat messages:", error);
    }
  }, [messages]);

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

    // Preload audio files
    sendAudio.load();
    receiveAudio.load();

    sendSoundRef.current = sendAudio;
    receiveSoundRef.current = receiveAudio;

    // Prime audio on first user interaction
    const primeAudio = () => {
      sendAudio.play().then(() => {
        sendAudio.pause();
        sendAudio.currentTime = 0;
      }).catch(() => {
        // Ignore errors, this is just priming
      });
      receiveAudio.play().then(() => {
        receiveAudio.pause();
        receiveAudio.currentTime = 0;
      }).catch(() => {
        // Ignore errors, this is just priming
      });

      // Remove listener after first interaction
      document.removeEventListener("click", primeAudio);
      document.removeEventListener("touchstart", primeAudio);
    };

    // Listen for first user interaction
    document.addEventListener("click", primeAudio, { once: true });
    document.addEventListener("touchstart", primeAudio, { once: true });

    return () => {
      sendAudio.pause();
      receiveAudio.pause();
      sendSoundRef.current = null;
      receiveSoundRef.current = null;
      document.removeEventListener("click", primeAudio);
      document.removeEventListener("touchstart", primeAudio);
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
      lastProcessedMessageIdRef.current = null;
      lastReadMessageIdRef.current = null;
      setSuggestions(DEFAULT_SUGGESTIONS);
      setLastAssistantMessage("");
      return;
    }

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage?.id) return;

    // Extract and store last assistant message for preview
    if (latestMessage.role === "assistant") {
      const messageText = extractMessageText(latestMessage);
      if (messageText) {
        setLastAssistantMessage(messageText);
        // Mark as unread only if it's a NEW message (different from last read) and panel is closed
        if (!isExpanded && lastReadMessageIdRef.current !== latestMessage.id) {
          setHasUnreadMessages(true);
        }
      }
    }

    // Extract quick-reply suggestions from assistant messages
    // Only process when streaming is complete and we haven't processed this message yet
    if (
      latestMessage.role === "assistant" &&
      status !== "streaming" &&
      lastProcessedMessageIdRef.current !== latestMessage.id
    ) {
      const quickReplies = extractQuickReplies(latestMessage);
      if (quickReplies.length > 0) {
        setSuggestions(quickReplies);
      }
      lastProcessedMessageIdRef.current = latestMessage.id;
    }

    // Handle sound effects
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
  }, [isMuted, messages, status, isExpanded]);

  // Mark messages as read when panel opens
  useEffect(() => {
    if (isExpanded) {
      setHasUnreadMessages(false);
      // Update last read message ID to the latest message
      if (messages.length > 0) {
        const latestMessage = messages[messages.length - 1];
        if (latestMessage?.id) {
          lastReadMessageIdRef.current = latestMessage.id;
        }
      }
    }
  }, [isExpanded, messages]);

  // Save read status to storage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const readStatus = {
        lastReadMessageId: lastReadMessageIdRef.current,
        hasUnread: hasUnreadMessages,
      };
      window.localStorage.setItem(READ_STATUS_STORAGE_KEY, JSON.stringify(readStatus));
    } catch (error) {
      console.warn("Failed to save read status:", error);
    }
  }, [hasUnreadMessages]);

  // Show welcome message after 5 seconds if no messages
  useEffect(() => {
    if (hasShownWelcome || messages.length > 0 || !isReady) return;

    const timer = setTimeout(() => {
      const welcomeMessage = "Hi! I'm Square AI Assistant. I can help you with product information, services, and answer your questions. How can I assist you today?";
      setLastAssistantMessage(welcomeMessage);
      setHasUnreadMessages(true);
      setHasShownWelcome(true);

      // Play pop sound for welcome message
      if (!isMuted && receiveSoundRef.current) {
        receiveSoundRef.current.currentTime = 0;
        void receiveSoundRef.current.play().catch((error) => {
          console.warn("Welcome message sound playback failed:", error);
        });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasShownWelcome, messages.length, isReady, isMuted]);

  const openAssistant = useCallback(() => {
    if (!isExpanded) {
      toggleExpanded();

      // Prime audio when opening assistant for the first time
      if (sendSoundRef.current && receiveSoundRef.current) {
        const primeIfNeeded = (audio: HTMLAudioElement) => {
          audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
          }).catch(() => {
            // Ignore errors
          });
        };

        primeIfNeeded(sendSoundRef.current);
        primeIfNeeded(receiveSoundRef.current);
      }
    }
  }, [isExpanded, toggleExpanded]);

  const closeAssistant = useCallback(() => {
    if (isExpanded) {
      toggleExpanded();
    }
  }, [isExpanded, toggleExpanded]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setHasUnreadMessages(false);
    lastReadMessageIdRef.current = null;
    setLastAssistantMessage("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
      window.localStorage.removeItem(READ_STATUS_STORAGE_KEY);
    }
  }, [setMessages]);

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
      clearChat,
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
      clearChat,
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
          hasUnreadMessages={hasUnreadMessages}
          lastAssistantMessage={lastAssistantMessage}
          onHideTooltip={() => setShowTooltip(false)}
          onPointerMove={handleTooltipPointerMove}
          onShowTooltip={() => setShowTooltip(true)}
          onToggle={openAssistant}
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
        suggestions={suggestions}
      />
    </FloatingAssistantContextProvider>
  );
}

function extractMessageText(message: UIMessage): string {
  for (const part of message.parts) {
    if (part.type !== "text") continue;

    const textContent = (part as any).text || (part as any).content || "";
    if (!textContent) continue;

    // Strip tagged sections to get clean text
    let cleanText = textContent;
    cleanText = stripTaggedSection(cleanText, "component");
    cleanText = stripTaggedSection(cleanText, "form-data");
    cleanText = stripTaggedSection(cleanText, "quick-reply");
    cleanText = cleanText.replace(/\[Request interrupted by user\]/gi, "").trim();

    if (cleanText) {
      // Limit to first 100 characters for preview
      return cleanText.length > 100
        ? cleanText.substring(0, 100) + "..."
        : cleanText;
    }
  }

  return "";
}

function stripTaggedSection(text: string, tag: string): string {
  const pattern = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "gi");
  return text.replace(pattern, "");
}

function extractQuickReplies(message: UIMessage): string[] {
  const replies: string[] = [];

  for (const part of message.parts) {
    if (part.type !== "text") continue;

    // The text might be in different properties depending on the state
    const textContent = (part as any).text || (part as any).content || "";
    if (!textContent) continue;

    const match = matchTaggedSection(textContent, "quick-reply");
    if (!match) continue;

    const lines = match.json
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    for (const line of lines) {
      // Remove leading dash/bullet and trim
      const cleaned = line.replace(/^[-•*]\s*/, "").trim();
      if (cleaned) {
        replies.push(cleaned);
      }
    }
  }

  return replies;
}

function matchTaggedSection(
  text: string,
  tag: string,
): { json: string; stripped: string } | null {
  const startToken = `[${tag}]`;
  const endToken = `[/${tag}]`;
  const start = text.indexOf(startToken);
  const end = text.indexOf(endToken);

  if (start === -1 || end === -1 || end <= start) return null;

  const json = text.slice(start + startToken.length, end).trim();
  const stripped =
    text.slice(0, start) + text.slice(end + endToken.length, text.length);

  return { json, stripped };
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
