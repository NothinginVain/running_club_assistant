"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Footprints } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessage } from "@/components/chat/chat-message";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/use-current-user";
import { chatApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/types/api";
import type { ChatMessage as ChatMessageType } from "@/types";

function ThinkingBubble() {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <Footprints className="size-3.5" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CoachPage() {
  const { userId } = useCurrentUser();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const hasSeededHistory = useRef(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: queryKeys.chatHistory(userId ?? "none"),
    queryFn: () => chatApi.getHistory(userId as string),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (history && !hasSeededHistory.current) {
      setMessages(history.messages);
      hasSeededHistory.current = true;
    }
  }, [history]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(userId as string, message),
  });

  function handleSend(message: string) {
    setMessages((current) => [...current, { role: "user", content: message }]);

    sendMessage.mutate(message, {
      onSuccess: (response) => {
        setMessages((current) => [
          ...current,
          { role: "assistant", content: response.reply },
        ]);
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Your coach couldn't respond. Please try again.",
        );
      },
    });
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col md:h-[calc(100vh-3.5rem-2rem)]">
      <div className="pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Coach</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask about your training, adjust your plan, or check in.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg border">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {isHistoryLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="ml-auto h-10 w-1/2" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="max-w-xs text-sm text-muted-foreground">
                Say hello to your coach. Ask about pacing, recovery, or how
                your plan is going.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))
          )}
          {sendMessage.isPending && <ThinkingBubble />}
          <div ref={scrollAnchorRef} />
        </div>

        <ChatComposer onSend={handleSend} disabled={sendMessage.isPending} />
      </div>
    </div>
  );
}
