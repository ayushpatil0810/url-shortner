import { z } from "zod";

export const signupPostRequestRequestBodySchema = z.object({
  firstname: z.string(),
  lastname: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(3),
});

export const loginPostRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

export const shortenPostRequestBodySchema = z.object({
  url: z.string().url(),
  code: z.string().optional(),
});
