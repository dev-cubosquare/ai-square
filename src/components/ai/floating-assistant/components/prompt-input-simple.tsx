import type { ComponentProps, KeyboardEventHandler } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PromptInputInputProps = ComponentProps<typeof Input> & {
  minHeight?: number;
  maxHeight?: number;
};

export const PromptInputInput = ({
  onChange,
  className,
  placeholder = "What would you like to know?",
  ...props
}: PromptInputInputProps) => {
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Allow newline
        return;
      }

      // Submit on Enter (without Shift)
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Input
      className={cn(
        "w-full resize-none rounded-none border-none p-3 shadow-none outline-none ring-0",
        "bg-transparent dark:bg-transparent field-sizing-content ",
        "focus-visible:ring-0",
        className,
      )}
      name="message"
      onChange={(e) => {
        onChange?.(e);
      }}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      placeholder={placeholder}
      {...props}
    />
  );
};
