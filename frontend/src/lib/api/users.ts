import { apiClient } from "./client";
import type { User, UserUpdate } from "@/types";

export const usersApi = {
  getMe: () => apiClient.get<User>("/users/me"),

  updateMe: (data: UserUpdate) => apiClient.patch<User>("/users/me", data),
};
