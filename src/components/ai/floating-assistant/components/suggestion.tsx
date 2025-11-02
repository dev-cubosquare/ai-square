"use client";

import type { ComponentProps } from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "../components/scroll-area";
import { cn } from "@/lib/utils";

export type SuggestionsProps = ComponentProps<typeof ScrollArea>;

export const Suggestions = ({
  className,
  children,
  ...props
}: SuggestionsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    // Convert vertical scroll to horizontal
    if (scrollRef.current && e.deltaY !== 0) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <ScrollArea className="w-full overflow-x-auto whitespace-nowrap" {...props}>
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className={cn("flex w-max flex-nowrap items-center gap-2", className)}
      >
        {children}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <Button
      className={cn("cursor-pointer rounded-full px-4", className)}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
};
