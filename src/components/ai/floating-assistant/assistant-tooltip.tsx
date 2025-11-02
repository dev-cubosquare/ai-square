"use client";

import type { MotionValue } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

interface FloatingAssistantTooltipProps extends PropsWithChildren {
  className?: string;
  open: boolean;
  rotate: MotionValue<number>;
  translateX: MotionValue<number>;
}

export function FloatingAssistantTooltip({
  className,
  open,
  rotate,
  translateX,
  children,
}: FloatingAssistantTooltipProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="floating-assistant-tooltip"
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2",
            className,
          )}
          style={{ translateX, rotate }}
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 280,
              damping: 22,
            },
          }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
        >
          <div className="relative">
            <div className="relative z-10 w-[320px] rounded-2xl border border-border/80 bg-background/95 px-5 py-4 shadow-[0_20px_60px_-25px_rgba(107,176,42,0.5)]">
              <div className="absolute inset-x-12 -top-px h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
              <div className="absolute inset-x-16 -top-1 h-px bg-linear-to-r from-transparent via-[#9dd958]/60 to-transparent blur-sm" />
              {children ?? (
                <p className="text-sm text-foreground text-center font-medium">
                  Hi! I'm your AI assistant. How can I help you today?
                </p>
              )}
            </div>
            <div className="absolute inset-x-20 -bottom-3 h-6 blur-xl bg-linear-to-r from-primary/30 via-[#86c940]/40 to-[#9dd958]/30" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <motion.span className="block size-3 rotate-45 border border-border/60 bg-background/95 shadow-md" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
