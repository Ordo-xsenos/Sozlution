import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url('NEXT_PUBLIC_API_BASE_URL must be a valid URL'),
  AI_API_URL: z.string().url('AI_API_URL must be a valid URL'),
  AI_API_KEY: z.string().min(10, 'AI_API_KEY must be at least 10 characters'),
  AI_MODEL: z.string().optional().default('gpt-3.5-turbo'),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    AI_API_URL: process.env.AI_API_URL,
    AI_API_KEY: process.env.AI_API_KEY,
    AI_MODEL: process.env.AI_MODEL,
  })

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(JSON.stringify(parsed.error.format(), null, 2))
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

export const env = validateEnv()
