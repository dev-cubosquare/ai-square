"use client";

import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  className?: string;
}

export function StreamingText({
  text,
  isStreaming = false,
  className,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (!isStreaming) {
      // If not streaming, show full text immediately
      setDisplayedText(text);
      return;
    }

    // Animate character reveal
    const controls = animate(count, text.length, {
      type: "tween",
      duration: Math.min(text.length * 0.02, 2), // Max 2 seconds
      ease: "linear",
      onUpdate(latest) {
        setDisplayedText(text.slice(0, Math.round(latest)));
      },
    });

    return controls.stop;
  }, [text, isStreaming, count]);

  // Update immediately when text changes and not streaming
  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
    }
  }, [text, isStreaming]);

  return (
    <motion.div
      className={cn(
        "size-full prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedText}
      </ReactMarkdown>
      {isStreaming && (
        <motion.span
          className="ml-0.5 inline-block h-4 w-0.5 bg-primary"
          animate={{
            opacity: [1, 0, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
}
