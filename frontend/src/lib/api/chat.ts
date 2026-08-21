import { apiClient } from "./client";
import type { ChatbotEndResponse, ChatbotResponse, ChatHistoryResponse } from "@/types";

export const chatApi = {
  sendMessage: (userId: string, message: string) =>
    apiClient.post<ChatbotResponse>(`/chatbot/${userId}`, { message }),

  endSession: (userId: string) =>
    apiClient.post<ChatbotEndResponse>(`/chatbot/${userId}/end`),

  getHistory: (userId: string) =>
    apiClient.get<ChatHistoryResponse>(`/chatbot/${userId}/history`),
};
