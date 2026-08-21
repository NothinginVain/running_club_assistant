import { apiClient } from "./client";
import type { ChatbotEndResponse, ChatbotResponse, ChatHistoryResponse } from "@/types";

export const chatApi = {
  sendMessage: (message: string) =>
    apiClient.post<ChatbotResponse>("/chatbot/", { message }),

  endSession: () => apiClient.post<ChatbotEndResponse>("/chatbot/end"),

  getHistory: () => apiClient.get<ChatHistoryResponse>("/chatbot/history"),
};
