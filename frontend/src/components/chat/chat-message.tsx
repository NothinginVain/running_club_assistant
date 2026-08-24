import { UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { BravesMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: (content: string) => void;
}

const MARKDOWN_COMPONENTS = {
  p: ({ ...props }) => <p className="[&:not(:first-child)]:mt-2" {...props} />,
  strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
  ul: ({ ...props }) => (
    <ul className="mt-2 list-disc space-y-1 pl-4 first:mt-0" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="mt-2 list-decimal space-y-1 pl-4 first:mt-0" {...props} />
  ),
  a: ({ ...props }) => (
    <a className="underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />
  ),
};

export function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isFailed = message.status === "failed";

  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      {isUser ? (
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary"
          aria-hidden="true"
        >
          <UserRound className="size-3.5" />
        </div>
      ) : (
        <BravesMark className="size-7 shrink-0" />
      )}
      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground whitespace-pre-wrap"
              : "rounded-tl-sm bg-muted",
            isFailed && "bg-destructive/10 text-destructive",
          )}
        >
          {isUser ? (
            message.content
          ) : (
            <ReactMarkdown components={MARKDOWN_COMPONENTS}>
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        {isFailed && (
          <button
            type="button"
            onClick={() => onRetry?.(message.content)}
            className="text-xs font-medium text-destructive underline underline-offset-2 hover:no-underline"
          >
            Failed to send · Retry
          </button>
        )}
      </div>
    </div>
  );
}
