import { Footprints, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

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

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-secondary" : "bg-primary text-primary-foreground",
        )}
        aria-hidden="true"
      >
        {isUser ? <UserRound className="size-3.5" /> : <Footprints className="size-3.5" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground whitespace-pre-wrap"
            : "rounded-tl-sm bg-muted",
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
    </div>
  );
}
