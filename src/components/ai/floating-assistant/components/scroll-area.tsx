"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cva, type VariantProps } from "class-variance-authority";

import { ArrowDownIcon } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useStickToBottom } from "use-stick-to-bottom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Context for sharing scroll state between components
interface ScrollAreaContextType {
  isAtBottom: boolean;
  isNearBottom: boolean;
  scrollToBottom: () => void;
}

const ScrollAreaContext = createContext<ScrollAreaContextType | null>(null);

// Hook to access scroll area context with error handling
export const useScrollArea = () => {
  const context = useContext(ScrollAreaContext);
  if (!context) {
    throw new Error(
      "useScrollArea must be used within a <ScrollArea mode='stick-to-bottom'>",
    );
  }
  return context;
};

// Custom scrollbar component with theme-aware styling
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

// Internal component implementing stick-to-bottom behavior
function ScrollAreaBottomStick({
  className,
  children,
  ...props
}: ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  // Get scroll management from external library
  const {
    scrollRef: libScrollRef,
    contentRef: libContentRef,
    isAtBottom,
    isNearBottom,
    scrollToBottom,
  } = useStickToBottom();

  // Local ref for potential external access
  const localContainerRef = useRef<HTMLDivElement | null>(null);

  // Merge library ref with local ref to satisfy both dependencies
  const mergedScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      localContainerRef.current = node;

      if (!libScrollRef) return;
      if (typeof libScrollRef === "function") libScrollRef(node);
      else
        (libScrollRef as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [libScrollRef],
  );

  // Content ref must be attached to direct child of Viewport for proper measurement
  const mergedContentRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!libContentRef) return;
      if (typeof libContentRef === "function") libContentRef(node);
      else
        (libContentRef as React.RefObject<HTMLDivElement | null>).current =
          node;
    },
    [libContentRef],
  );

  // Memoize context values to prevent unnecessary re-renders
  const values = useMemo(() => {
    return {
      isNearBottom,
      isAtBottom,
      scrollToBottom,
    };
  }, [isAtBottom, scrollToBottom, isNearBottom]);

  return (
    <ScrollAreaContext.Provider value={values}>
      <ScrollAreaPrimitive.Root
        className={cn("relative h-full overflow-auto", className)}
        {...props}
      >
        {/* Viewport is the scrolling element - needs merged ref for tracking */}
        <ScrollAreaPrimitive.Viewport
          ref={mergedScrollRef}
          className="h-full w-full"
        >
          {/* Content wrapper needs ref for content measurement */}
          <div ref={mergedContentRef} className="min-h-full">
            {children}
          </div>
        </ScrollAreaPrimitive.Viewport>

        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    </ScrollAreaContext.Provider>
  );
}

// Main component with mode switching
interface ScrollAreaProps
  extends ComponentProps<typeof ScrollAreaPrimitive.Root> {
  mode?: "default" | "stick-to-bottom";
}

function ScrollArea({
  className,
  children,
  mode = "default",
  ...props
}: ScrollAreaProps) {
  // Switch between default and enhanced behavior
  if (mode === "stick-to-bottom") {
    return (
      <ScrollAreaBottomStick className={className} {...props}>
        {children}
      </ScrollAreaBottomStick>
    );
  }

  // Standard shadcn ScrollArea behavior
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative h-full overflow-auto", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full">
        <div className="min-h-full">{children}</div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

// Styled variants for scroll button positioning
const scrollButtonVariants = cva(
  "absolute left-[50%] translate-x-[-50%] rounded-full",
  {
    variants: {
      direction: {
        default: "bottom-4",
        bottom: "bottom-4",
      },
    },
    defaultVariants: {
      direction: "default",
    },
  },
);

// Floating button that appears when not at bottom
function ScrollButton({
  className,
  direction = "default",
  ...props
}: ComponentProps<"button"> & VariantProps<typeof scrollButtonVariants>) {
  const { isAtBottom, scrollToBottom } = useScrollArea();

  const handleScroll = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Only render when not at bottom
  return (
    !isAtBottom && (
      <Button
        className={cn(scrollButtonVariants({ direction, className }))}
        onClick={handleScroll}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
}

export { ScrollArea, ScrollBar, ScrollButton };
