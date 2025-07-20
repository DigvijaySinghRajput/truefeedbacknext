import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "message must be of atleast 10 characters" })
    .max(300, { message: "message must be of less than 300 characters" }),
  createdAt: z.date(),
});
