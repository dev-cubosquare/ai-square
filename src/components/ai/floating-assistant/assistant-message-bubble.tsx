"use client";

import type { UIMessage } from "ai";
import { motion } from "motion/react";

import { Response } from "./components/response";
import { StreamingText } from "./components/streaming-text";
import { cn } from "@/lib/utils";
import type {
  AssistantComponentPayload,
  FormSubmittedComponentOptions,
} from "./utils/message-builder";

export type { AssistantComponentPayload };

export function ComponentMessageBubble({
  component,
}: {
  component: AssistantComponentPayload;
}) {
  if (component.component === "form-submitted") {
    return (
      <Notification options={component as FormSubmittedComponentOptions} />
    );
  }

  const title = `${component.title ?? "Notification"}`;
  const description = `${
    component.description ??
    "Thanks! We'll be in touch with the next steps shortly."
  }`;

  return (
    <Notification
      options={{
        title,
        description,
      }}
    />
  );
}

export function Notification({
  options: { title, description },
}: {
  options: Omit<FormSubmittedComponentOptions, "component">;
}) {
  return (
    <motion.div
      className="flex items-end gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex-1 rounded-2xl border border-primary/35 bg-primary/10 px-4 py-3 shadow-[0_16px_32px_-24px_rgba(107,176,42,0.65)] backdrop-blur-sm">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-foreground/70">{description}</p>
      </div>
    </motion.div>
  );
}

export function TextMessageBubble({
  role,
  text,
  isStreaming = false,
}: {
  role: UIMessage["role"];
  text: string;
  isStreaming?: boolean;
}) {
  const bubbleClasses = cn(
    "flex-1 rounded-2xl border px-4 py-3 shadow-[0_18px_36px_-28px_rgba(56,189,248,0.55)] backdrop-blur-sm transition-colors duration-300",
    role === "user"
      ? "rounded-br-none border-white/10 bg-background/80 text-foreground"
      : "rounded-tl-none border-white/12 bg-linear-to-br from-primary/12 via-[#86c940]/10 to-[#9dd958]/12 text-foreground",
  );

  return (
    <motion.div
      className="flex items-end gap-2"
      initial={{ opacity: 0, x: role === "user" ? 20 : -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        delay: 0.1,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <motion.div
        className={bubbleClasses}
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {role === "assistant" && isStreaming ? (
          <StreamingText text={text} isStreaming={isStreaming} className="text-sm" />
        ) : (
          <Response className="text-sm">{text}</Response>
        )}
      </motion.div>
    </motion.div>
  );
}
