import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_PASSWORD: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  const missing = Object.keys(result.error.flatten().fieldErrors);
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

export const env = result.data;
