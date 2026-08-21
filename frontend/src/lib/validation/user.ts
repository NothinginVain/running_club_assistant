import { z } from "zod";

export const createAccountSchema = z.object({
  full_name: z.string().trim().min(1, "Enter your name"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Use at least 6 characters"),
});

export type CreateAccountValues = z.infer<typeof createAccountSchema>;
