"use client";

import type { ChatStatus, UIMessage } from "ai";
import { motion } from "motion/react";
import { Fragment } from "react";

import { Loader } from "./components/loader";
import { Message, MessageContent } from "./components/message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import {
  ComponentMessageBubble,
  TextMessageBubble,
  type AssistantComponentPayload,
} from "./assistant-message-bubble";
import { ScrollArea, ScrollButton } from "./components/scroll-area";
import { SquareAILogo } from "./components/square-ai-logo";

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
  return (
    <ScrollArea mode="stick-to-bottom" className="h-svh px-2">
      <div className="flex flex-col gap-4 py-4">
        {messages.length === 0 && (
          <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="px-1 text-xs text-muted-foreground">
              Quick questions:
            </p>
            {suggestions.map((question) => (
              <motion.button
                type="button"
                key={question}
                className="text-left text-xs bg-background hover:bg-muted border rounded-lg p-2 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onQuickSend(question)}
              >
                {question}
              </motion.button>
            ))}
          </motion.div>
        )}

        {messages.map((message) => (
          <Message
            from={message.role}
            key={message.id}
            className={cn(message.role === "assistant" ? "items-start" : "")}
          >
            <MessageContent className="bg-transparent! p-0 rounded-none">
              {message.parts.map((part, index) => {
                if (part.type !== "text" || !part.text) return null;

                const { component, text: withoutComponent } = extractComponent(
                  part.text,
                );
                const cleanedText = stripTaggedSection(
                  stripTaggedSection(withoutComponent, "form-data"),
                  "component",
                ).trim();

                return (
                  <Fragment key={`${message.id}-${index}-group`}>
                    {component ? (
                      <ComponentMessageBubble component={component} />
                    ) : null}
                    {shouldRenderTextBubble(
                      component,
                      cleanedText,
                      message.role,
                    ) ? (
                      <TextMessageBubble
                        role={message.role}
                        text={cleanedText}
                      />
                    ) : null}
                  </Fragment>
                );
              })}
            </MessageContent>
            {message.role === "assistant" ? (
              <div className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-[#86c940]">
                <SquareAILogo size={24} className="text-white" />
              </div>
            ) : (
              <Avatar className="size-8 ring-1 ring-border">
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
            )}
          </Message>
        ))}

        {status === "submitted" && <Loader />}
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
