"use client";

import type { MotionValue } from "motion/react";
import { motion } from "motion/react";

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
  isDragging: boolean;
  isReady: boolean;
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
  isDragging,
  isReady,
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
                "relative h-14 w-14 rounded-full shadow-2xl",
                "bg-linear-to-br from-primary via-[#86c940] to-[#9dd958]",
                "hover:shadow-primary/50 transition-shadow duration-300",
                triggerDragProps.drag && "cursor-grab active:cursor-grabbing",
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
                className="relative flex size-full items-center justify-center"
              >
                <SquareAILogo size={32} className="text-white" />
              </motion.div>
              <motion.span
                aria-hidden
                className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.45,
                  type: "spring",
                  stiffness: 500,
                  damping: 18,
                }}
              />
            </Button>
          </motion.div>
          <FloatingAssistantTooltip
            open={showTooltip}
            rotate={tooltipRotate}
            translateX={tooltipTranslateX}
          >
            <p className="text-sm text-foreground text-center font-medium">
              Hi! I'm Square AI. How can I help you today?
            </p>
          </FloatingAssistantTooltip>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
