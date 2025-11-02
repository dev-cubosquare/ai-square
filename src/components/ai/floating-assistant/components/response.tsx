"use client";

import { type ComponentProps, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type ResponseProps = ComponentProps<"div"> & {
  children: string;
};

export const Response = memo(
  ({ className, children, ...props }: ResponseProps) => (
    <div
      className={cn(
        "size-full prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      {...props}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);

Response.displayName = "Response";
