import { z } from "zod";

export const verifySchema = z.object({
  token: z.string().min(6, "token must be atleast 6 digits"),
});
