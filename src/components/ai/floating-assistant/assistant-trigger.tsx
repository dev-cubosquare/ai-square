"use client";

import type { MotionValue } from "motion/react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FloatingAssistantTooltip } from "./assistant-tooltip";
import type { DragConstraints } from "./use-floating-assistant-state";
import { SquareAILogo } from "./components/square-ai-logo";

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Number.POSITIVE_INFINITY,
    ease: "easeInOut" as const,
  },
};

const wiggleTransition = {
  duration: 2,
  repeat: Number.POSITIVE_INFINITY,
  ease: "easeInOut" as const,
};

interface FloatingAssistantTriggerProps {
  buttonX: MotionValue<number>;
  buttonY: MotionValue<number>;
  hasUnreadMessages?: boolean;
  isDragging: boolean;
  isReady: boolean;
  lastAssistantMessage?: string;
  onHideTooltip: () => void;
  onShowTooltip: () => void;
  onToggle: () => void;
  resetTooltipMotion: () => void;
  showTooltip: boolean;
  tooltipRotate: MotionValue<number>;
  tooltipTranslateX: MotionValue<number>;
  triggerDragHandlers: {
    onDragEnd: () => void;
    onDragStart: () => void;
  };
  triggerDragProps: {
    drag: boolean;
    dragConstraints: DragConstraints;
    dragElastic: number;
    dragTransition: {
      bounceDamping: number;
      bounceStiffness: number;
    };
  };
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onPointerMove: (event: React.PointerEvent<HTMLButtonElement>) => void;
}

export function FloatingAssistantTrigger({
  buttonX,
  buttonY,
  hasUnreadMessages = false,
  isDragging,
  isReady,
  lastAssistantMessage,
  onHideTooltip,
  onPointerMove,
  onShowTooltip,
  onToggle,
  resetTooltipMotion,
  showTooltip,
  tooltipRotate,
  tooltipTranslateX,
  triggerDragHandlers,
  triggerDragProps,
  triggerRef,
}: FloatingAssistantTriggerProps) {
  const handleHoverStart = () => {
    if (isDragging) return;
    resetTooltipMotion();
    onShowTooltip();
  };

  const handleHoverEnd = () => {
    onHideTooltip();
    resetTooltipMotion();
  };

  // Show tooltip by default if there's an unread message
  const shouldShowTooltip = showTooltip || hasUnreadMessages;

  return (
    <motion.div className="pointer-events-none fixed inset-0 z-9998">
      <motion.div
        className="pointer-events-auto absolute left-1/2 bottom-10 -translate-x-1/2"
        style={{
          x: buttonX,
          y: buttonY,
          pointerEvents: isReady ? "auto" : "none",
        }}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: isReady ? 1 : 0, scale: isReady ? 1 : 0.94 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        {...triggerDragProps}
        onDragStart={triggerDragHandlers.onDragStart}
        onDragEnd={triggerDragHandlers.onDragEnd}
      >
        <motion.div
          className="relative"
          animate={pulseAnimation}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div whileHover={{ scale: 1.1 }}>
            <Button
              ref={triggerRef}
              size="lg"
              onClick={onToggle}
className={cn(
  "relative h-14 w-14 rounded-full shadow-2xl backdrop-blur-md backdrop-saturate-150",
  "bg-white/10 border border-white/20",
  "hover:bg-white/20 hover:shadow-primary/40 transition-all duration-300",
  triggerDragProps.drag && "cursor-grab active:cursor-grabbing",
  "p-0"
)}


              onPointerEnter={handleHoverStart}
              onPointerMove={onPointerMove}
              onPointerLeave={handleHoverEnd}
              onFocus={handleHoverStart}
              onBlur={handleHoverEnd}
            >
              <motion.div
                aria-hidden
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={wiggleTransition}
                className="relative flex size-full items-center justify-center pointer-events-none"
              >
                <SquareAILogo size={32} className="text-white" />
              </motion.div>
              <AnimatePresence>
                {hasUnreadMessages && (
                  <motion.span
                    key="unread-badge"
                    aria-label="New message"
                    className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-lg ring-2 ring-background"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 18,
                    }}
                  >
                    <motion.span
                      className="absolute inset-0 rounded-full bg-primary"
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.8, 0, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="relative text-[10px] font-bold text-white">
                      1
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
          <FloatingAssistantTooltip
            open={shouldShowTooltip}
            rotate={tooltipRotate}
            translateX={tooltipTranslateX}
          >
            {lastAssistantMessage ? (
              <div className="space-y-1.5">
                <p className="text-sm text-foreground leading-relaxed">
                  {lastAssistantMessage}
                </p>
              </div>
            ) : (
              <p className="text-sm text-foreground text-center font-medium">
                Hi! I'm Square AI. How can I help you today?
              </p>
            )}
          </FloatingAssistantTooltip>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
