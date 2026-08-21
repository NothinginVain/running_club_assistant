import { apiClient } from "./client";
import type { User, UserCreate, UserUpdate } from "@/types";

export const usersApi = {
  create: (data: UserCreate) => apiClient.post<User>("/users/", data),

  list: () => apiClient.get<User[]>("/users/"),

  get: (userId: string) => apiClient.get<User>(`/users/${userId}`),

  update: (userId: string, data: UserUpdate) =>
    apiClient.patch<User>(`/users/${userId}`, data),

  remove: (userId: string) => apiClient.delete<void>(`/users/${userId}`),
};
