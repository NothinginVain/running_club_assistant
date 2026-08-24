export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** Client-only: set when an optimistically-sent message failed to deliver. */
  status?: "failed";
}

export interface ChatbotRequest {
  message: string;
}

export interface ChatbotResponse {
  reply: string;
}

export interface ChatMemory {
  current_goal: string | null;
  preferences: string[];
  topics_of_interest: string[];
  progress: string | null;
  current_conversation: ChatMessage[];
}

export interface CoachMemorySummary {
  chat: ChatMemory;
}

export interface ChatbotEndResponse {
  summary: CoachMemorySummary;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  current_goal: string | null;
  preferences: string[];
  topics_of_interest: string[];
  progress: string | null;
}
