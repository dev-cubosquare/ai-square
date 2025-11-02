"use client";

import type { ToolUIPart } from "ai";
import { ScrollArea, ScrollBar } from "./scroll-area";
import { Tool, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";

interface GenericToolCallProps {
  part: ToolUIPart;
  title?: string;
}

export function GenericToolCall({ part, title }: GenericToolCallProps) {
  const hasOutput = true

  return (
    <Tool>
      <ToolHeader type={part.type} title={title || "Submit"} state={part.state} />
      <ScrollArea className="max-w-full">
        <ToolInput input={part.input} />
        {hasOutput && (
          <ToolOutput
            errorText={part.errorText}
            output={part.errorText || part.output || {}}
          />
        )}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Tool>
  );
}
