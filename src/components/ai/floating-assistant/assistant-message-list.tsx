"use client";

import type { ChatStatus, UIMessage } from "ai";
import { motion } from "motion/react";
import { Fragment, useMemo } from "react";

import { TypingIndicator } from "./components/typing-indicator";
import { Message, MessageContent } from "./components/message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import {
  ComponentMessageBubble,
  TextMessageBubble,
  type AssistantComponentPayload,
} from "./assistant-message-bubble";
import { ScrollArea, ScrollBar, ScrollButton } from "./components/scroll-area";
import { SquareAILogo } from "./components/square-ai-logo";
import { QUESTIONS } from "./questions";
import { GenericToolCall } from "./components/generic-tool-call";


interface FloatingAssistantMessageListProps {
  messages: UIMessage[];
  onQuickSend: (prompt: string) => void;
  status: ChatStatus;
  suggestions: string[];
}

export function FloatingAssistantMessageList({
  messages,
  onQuickSend,
  status,
  suggestions,
}: FloatingAssistantMessageListProps) {
  // Pick 3 random questions from QUESTIONS array
  const randomQuestions = useMemo(() => {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  return (
    <ScrollArea mode="stick-to-bottom" id="scroll-without-table" className="h-svh px-2">
      <div className="flex flex-col gap-4 py-4">
        {messages.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center gap-6 py-8 px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Avatar */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <div className="flex size-20 items-center justify-center rounded-full bg-white/10 border border-white/20 shadow-lg">
                <SquareAILogo size={48} className="text-white" />
              </div>
              <motion.div
                className="absolute -inset-2 rounded-full bg-linear-to-br from-primary/20 via-[#86c940]/20 to-[#9dd958]/20 -z-10"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.3, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Name */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Square AI Assistant
              </h2>
              <p className="text-sm text-muted-foreground">
                Your intelligent business companion
              </p>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-center text-sm text-muted-foreground max-w-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Ask me anything about our services, solutions, and how AI can transform your business.
            </motion.p>

            {/* Questions */}
            <motion.div
              className="flex flex-col gap-2 w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="px-1 text-xs text-muted-foreground text-center mb-1">
                Popular questions:
              </p>
              {randomQuestions.map((question, index) => (
                <motion.button
                  type="button"
                  key={question}
                  className="text-center text-sm bg-background hover:bg-muted border border-border rounded-full cursor-help p-3 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onQuickSend(question)}
                >
                  {question}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}

  {messages.map((message, messageIndex) => {
          // Check if this is the last message and if we're currently streaming
          const isLastMessage = messageIndex === messages.length - 1;
          const isStreaming = isLastMessage && status === "streaming";

          return (
            <Message
              from={message.role}
              key={`${message.id}-${messageIndex}`}
              className={cn(message.role === "assistant" ? "items-start" : "")}
            >
              <MessageContent className="bg-transparent! p-0 rounded-none">
                {message.parts.map((part, index) => {
                  if (
                    part.type === "tool-submitSpecificRequest" ||
                    part.type === "tool-submitRequest"
                  ) {
                    return <GenericToolCall key={index} part={part} title="Submit" />;
                  }

                  if (part.type !== "text" || !part.text) return null;

                  const { component, text: withoutComponent } = extractComponent(
                    part.text,
                  );
                  let cleanedText = stripTaggedSection(
                    stripTaggedSection(withoutComponent, "form-data"),
                    "component",
                  );
                  // Strip quick-reply section
                  cleanedText = stripTaggedSection(cleanedText, "quick-reply");
                  // Remove [Request interrupted by user] text
                  cleanedText = cleanedText
                    .replace(/\[Request interrupted by user\]/gi, "")
                    .trim();

                  return (
                    <Fragment key={`${message.id}-${index}-group`}>
                      {component ? (
                        <ComponentMessageBubble component={component} />
                      ) : null}
                      {shouldRenderTextBubble(component, cleanedText, message.role) ? (
                        <TextMessageBubble
                          role={message.role}
                          text={cleanedText}
                          isStreaming={isStreaming && message.role === "assistant"}
                        />
                      ) : null}
                    </Fragment>
                  );
                })}
              </MessageContent>
              {message.role === "assistant" ? (
                <motion.div
                  className="flex size-8 items-center justify-center rounded-full bg-white/10 border border-white/20"
                  animate={
                    isStreaming
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(107, 176, 42, 0.4)",
                            "0 0 0 8px rgba(107, 176, 42, 0)",
                            "0 0 0 0 rgba(107, 176, 42, 0)",
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.5,
                    repeat: isStreaming ? Number.POSITIVE_INFINITY : 0,
                    ease: "easeInOut",
                  }}
                >
                  <SquareAILogo size={24} className="text-white" />
                </motion.div>
              ) : (
                <Avatar className="size-8 ring-1 ring-border">
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
              )}
            </Message>
          );
        })}

        {status === "submitted" && (
          <Message from="assistant" className="items-start">
            <MessageContent className="bg-transparent! p-0 rounded-none">
              <TypingIndicator />
            </MessageContent>
            <motion.div
              className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-[#86c940]"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(107, 176, 42, 0.4)",
                  "0 0 0 8px rgba(107, 176, 42, 0)",
                  "0 0 0 0 rgba(107, 176, 42, 0)",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <SquareAILogo size={24} className="text-white" />
            </motion.div>
          </Message>
        )}
      </div>
      <ScrollButton />
    </ScrollArea>
  );
}

function extractComponent(text: string): {
  component: AssistantComponentPayload | null;
  text: string;
} {
  const match = matchTaggedSection(text, "component");
  if (!match) return { component: null, text };

  const { json, stripped } = match;

  try {
    const parsed = JSON.parse(json) as AssistantComponentPayload;
    if (!parsed || typeof parsed !== "object") {
      return { component: null, text: stripped };
    }
    if (typeof parsed.component !== "string") {
      return { component: null, text: stripped };
    }

    return { component: parsed, text: stripped };
  } catch (error) {
    console.error("Failed to parse assistant component payload:", error);
    return { component: null, text: stripped };
  }
}

function stripTaggedSection(text: string, tag: string) {
  const pattern = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "gi");
  return text.replace(pattern, "");
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

function shouldRenderTextBubble(
  component: AssistantComponentPayload | null,
  text: string,
  role: UIMessage["role"],
) {
  if (!text.length) return false;
  if (!component) return true;
  return role !== "user";
}
