"use client";

import type { ToolUIPart } from "ai";
import { Tool, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";


interface GenericToolCallProps {
  part: ToolUIPart;
  title?: string;
}

export function GenericToolCall({ part, title }: GenericToolCallProps) {
  const hasOutput = true

  return (
    <Tool>
      <ToolHeader type={part.type} title={title || "Submit"} state={part.state} />
      <ScrollArea>
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
