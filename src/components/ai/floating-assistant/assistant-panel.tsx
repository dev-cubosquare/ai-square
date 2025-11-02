"use client";

import type { ChatStatus, UIMessage } from "ai";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { MotionValue } from "motion/react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { type PointerEvent as ReactPointerEvent, useCallback } from "react";

import { Suggestions } from "./components/suggestion";
import PopupHeader from "./components/popup-header";
import { PromptInputInput } from "./components/prompt-input-simple";

import { FloatingAssistantMessageList } from "./assistant-message-list";
import { AssistantSoundToggle } from "./assistant-sound-toggle";
import type { DragConstraints } from "./use-floating-assistant-state";
import { SquareAILogo } from "./components/square-ai-logo";

const panelVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 28,
    },
  },
};

export type PromptInputMessage = {
  text?: string;
  files?: File[];
};

interface FloatingAssistantPanelProps {
  cardX: MotionValue<number>;
  cardY: MotionValue<number>;
  isMobile: boolean;
  isReady: boolean;
  messages: UIMessage[];
  onClose: () => void;
  onPromptSubmit: (message: PromptInputMessage) => void;
  onQuickSend: (prompt: string) => void;
  open: boolean;
  panelDragProps: {
    drag: boolean;
    dragConstraints: DragConstraints;
    dragElastic: number;
    dragMomentum: boolean;
    dragTransition: {
      bounceDamping: number;
      bounceStiffness: number;
    };
  };
  status: ChatStatus;
  suggestions: string[];
}

export function FloatingAssistantPanel({
  cardX,
  cardY,
  isReady,
  messages,
  onClose,
  onPromptSubmit,
  onQuickSend,
  open,
  panelDragProps,
  status,
  suggestions,
  isMobile,
}: FloatingAssistantPanelProps) {
  const dragControls = useDragControls();

  const handleHeaderPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!panelDragProps.drag) return;
      if ((event.target as HTMLElement | null)?.closest("button")) return;
      event.preventDefault();
      dragControls.start(event);
    },
    [dragControls, panelDragProps.drag],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get("message") as string;

    if (!text?.trim()) return;

    onPromptSubmit({ text });
    e.currentTarget.reset();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="floating-assistant-panel"
          className="pointer-events-none fixed inset-0 z-9999"
        >
          <motion.div
            className="pointer-events-auto absolute inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            style={{
              x: isMobile ? 0 : cardX,
              y: isMobile ? 0 : cardY,
              pointerEvents: isReady ? "auto" : "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isReady ? 1 : 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            dragControls={dragControls}
            dragListener={false}
            {...panelDragProps}
          >
            <motion.div
              className="flex h-full w-full flex-col overflow-hidden bg-background border-none rounded-none shadow-none sm:h-auto sm:w-[400px] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <PopupHeader
                className={panelDragProps.drag ? "cursor-move" : ""}
                onClose={onClose}
                title="Square AI Assistant"
                subtitle="Live product guidance"
                onPointerDown={handleHeaderPointerDown}
                actions={<AssistantSoundToggle />}
                icon={<SquareAILogo size={32} />}
              />

              <div className="flex min-h-[320px] flex-1 flex-col md:max-h-[70svh] overflow-hidden gap-4">
                <FloatingAssistantMessageList
                  messages={messages}
                  onQuickSend={onQuickSend}
                  status={status}
                  suggestions={suggestions}
                />

                <div onPointerDown={(event) => event.stopPropagation()}>
                  <Suggestions className="py-3 [&>div]:w-full [&>div]:gap-3">
                    {suggestions.map((suggestion) => (
                      <motion.button
                        type="button"
                        key={suggestion}
                        className="group relative flex min-w-[220px] max-w-[320px] items-center gap-3 overflow-hidden rounded-xl border border-white/12 bg-background/70 px-4 py-3 text-left text-sm text-foreground/75 shadow-[0_14px_30px_-24px_rgba(107,176,42,0.55)] transition-all duration-200 backdrop-blur-sm hover:-translate-y-1 hover:border-primary/45 hover:text-foreground"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => onQuickSend(suggestion)}
                      >
                        <span className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/0 via-primary/8 to-[#9dd958]/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <span className="relative z-10 flex size-2.5 shrink-0 rounded-full bg-linear-to-br from-primary via-[#86c940] to-[#9dd958] shadow-[0_0_14px_rgba(107,176,42,0.85)]" />
                        <span className="relative z-10 flex-1 text-sm font-medium leading-snug text-left text-foreground whitespace-normal">
                          {suggestion}
                        </span>
                        <ArrowUpRight className="relative z-10 size-3.5 text-foreground/55 transition-colors duration-200 group-hover:text-foreground/85" />
                      </motion.button>
                    ))}
                  </Suggestions>
                  <form onSubmit={handleSubmit} className="p-3">
                    <motion.div
                      className="group/input relative flex w-full items-center"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: "easeOut",
                        delay: 0.05,
                      }}
                    >
                      <motion.div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-40"
                        animate={{
                          opacity: [0.35, 0.55, 0.35],
                          scale: [1, 1.02, 1],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(107,176,42,0.55), rgba(134,201,64,0.45), rgba(157,217,88,0.45))",
                          filter: "blur(18px)",
                        }}
                      />
                      <div className="relative z-10 flex w-full items-center gap-3 rounded-full border border-white/10 bg-background/95 px-4 py-2 backdrop-blur-lg transition-all duration-300 group-focus-within/input:border-primary/60 group-focus-within/input:bg-background/90">
                        <div className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-r from-white/5 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover/input:opacity-60 group-focus-within/input:opacity-100" />
                        <PromptInputInput
                          placeholder="Ask me anything..."
                          className="h-12 border-none bg-transparent px-0 text-sm text-foreground placeholder:text-foreground/60 focus-visible:ring-0 focus-visible:outline-none focus-visible:shadow-none"
                        />
                        <motion.div
                          className="relative z-10 shrink-0"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                        >
                          <button
                            type="submit"
                            disabled={status === "submitted"}
                            className="relative h-11 w-11 overflow-hidden rounded-full bg-linear-to-r from-primary via-[#86c940] to-[#9dd958] text-white shadow-[0_20px_40px_-18px_rgba(107,176,42,0.85)] transition-all duration-300 hover:bg-transparent hover:shadow-[0_24px_50px_-18px_rgba(107,176,42,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:shadow-[0_16px_32px_-18px_rgba(107,176,42,0.7)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 2L11 13" />
                              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                            </svg>
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </form>
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-linear-to-r from-primary/15 via-[#86c940]/15 to-[#9dd958]/15 px-3 py-1 text-xs text-foreground/80 backdrop-blur-sm shadow-[0_12px_28px_-24px_rgba(107,176,42,0.55)]">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <p className="font-medium tracking-wide">
                      Powered by Square AI
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
