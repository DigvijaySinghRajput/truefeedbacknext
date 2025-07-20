import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string(), //identifier is production level name for something like email
  password: z.string().min(6, "password must be of 6 characters"),
});
