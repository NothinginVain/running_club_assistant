"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { chatApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/types/api";
import type { ChatHistoryResponse, ChatMemory, ChatMessage } from "@/types";

interface CoachChatContextValue {
  messages: ChatMessage[];
  isHistoryLoading: boolean;
  isOpen: boolean;
  hasUnread: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (message: string) => void;
  retryMessage: (message: string) => void;
  isSending: boolean;
  endChat: () => void;
  isEndingChat: boolean;
  endedChatSummary: ChatMemory | null;
  dismissEndedChatSummary: () => void;
}

const CoachChatContext = createContext<CoachChatContextValue | null>(null);

function emptyHistory(): ChatHistoryResponse {
  return {
    messages: [],
    current_goal: null,
    preferences: [],
    topics_of_interest: [],
    progress: null,
  };
}

const EMPTY_MESSAGES: ChatMessage[] = [];

export function CoachChatProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [endedChatSummary, setEndedChatSummary] = useState<ChatMemory | null>(null);

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: queryKeys.chatHistory,
    queryFn: () => chatApi.getHistory(),
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const messages = history?.messages ?? EMPTY_MESSAGES;

  const openChat = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
  }, []);

  const closeChat = useCallback(() => setIsOpen(false), []);

  const toggleChat = useCallback(() => {
    setIsOpen((current) => {
      const next = !current;
      if (next) setHasUnread(false);
      return next;
    });
  }, []);

  const sendMutation = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(message),
  });

  const dispatchSend = useCallback(
    (message: string) => {
      const optimisticMessage: ChatMessage = { role: "user", content: message };

      queryClient.setQueryData<ChatHistoryResponse>(queryKeys.chatHistory, (current) => ({
        ...(current ?? emptyHistory()),
        messages: [...(current?.messages ?? []), optimisticMessage],
      }));

      sendMutation.mutate(message, {
        onSuccess: (response) => {
          queryClient.setQueryData<ChatHistoryResponse>(queryKeys.chatHistory, (current) => ({
            ...(current ?? emptyHistory()),
            messages: [
              ...(current?.messages ?? []),
              { role: "assistant", content: response.reply },
            ],
          }));

          if (!isOpen) setHasUnread(true);
        },
        onError: () => {
          queryClient.setQueryData<ChatHistoryResponse>(queryKeys.chatHistory, (current) => ({
            ...(current ?? emptyHistory()),
            messages: (current?.messages ?? []).map((entry) =>
              entry === optimisticMessage ? { ...entry, status: "failed" as const } : entry,
            ),
          }));
        },
      });
    },
    [isOpen, queryClient, sendMutation],
  );

  const sendMessage = useCallback(
    (message: string) => {
      dispatchSend(message);
    },
    [dispatchSend],
  );

  const retryMessage = useCallback(
    (message: string) => {
      queryClient.setQueryData<ChatHistoryResponse>(queryKeys.chatHistory, (current) => {
        if (!current) return current;

        const failedIndex = current.messages.findIndex(
          (entry) => entry.status === "failed" && entry.content === message,
        );
        if (failedIndex === -1) return current;

        return {
          ...current,
          messages: current.messages.filter((_, index) => index !== failedIndex),
        };
      });

      dispatchSend(message);
    },
    [dispatchSend, queryClient],
  );

  const endChatMutation = useMutation({
    mutationFn: () => chatApi.endSession(),
    onSuccess: (response) => {
      queryClient.setQueryData<ChatHistoryResponse>(queryKeys.chatHistory, emptyHistory());
      queryClient.invalidateQueries({ queryKey: queryKeys.chatHistory });
      setEndedChatSummary(response.summary.chat);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Couldn't end the chat. Please try again.",
      );
    },
  });

  const endChat = useCallback(() => {
    if (endChatMutation.isPending) return;
    endChatMutation.mutate();
  }, [endChatMutation]);

  const value = useMemo<CoachChatContextValue>(
    () => ({
      messages,
      isHistoryLoading,
      isOpen,
      hasUnread,
      openChat,
      closeChat,
      toggleChat,
      sendMessage,
      retryMessage,
      isSending: sendMutation.isPending,
      endChat,
      isEndingChat: endChatMutation.isPending,
      endedChatSummary,
      dismissEndedChatSummary: () => setEndedChatSummary(null),
    }),
    [
      messages,
      isHistoryLoading,
      isOpen,
      hasUnread,
      openChat,
      closeChat,
      toggleChat,
      sendMessage,
      retryMessage,
      sendMutation.isPending,
      endChat,
      endChatMutation.isPending,
      endedChatSummary,
    ],
  );

  return <CoachChatContext.Provider value={value}>{children}</CoachChatContext.Provider>;
}

export function useCoachChat(): CoachChatContextValue {
  const context = useContext(CoachChatContext);

  if (!context) {
    throw new Error("useCoachChat must be used within a CoachChatProvider");
  }

  return context;
}
