import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Enter your name"),
  gender: z.string().trim().nullable(),
  birth: z.string().nullable(),
  height_cm: z.number().positive().max(300).nullable(),
  address: z.string().trim().nullable(),
  shoe_size: z.string().trim().nullable(),
  interests: z.string().trim(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
