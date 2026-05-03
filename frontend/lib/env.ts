import { z } from 'zod'

// Client-side env schema (only NEXT_PUBLIC_* variables)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url('NEXT_PUBLIC_API_BASE_URL must be a valid URL'),
})

// Server-side env schema (includes server-only variables)
const serverEnvSchema = clientEnvSchema.extend({
  AI_API_URL: z.string().url('AI_API_URL must be a valid URL'),
  AI_API_KEY: z.string().min(10, 'AI_API_KEY must be at least 10 characters'),
  AI_MODEL: z.string().optional().default('gpt-3.5-turbo'),
})

export type Env = z.infer<typeof serverEnvSchema>

function validateEnv(): Env {
  const isServer = typeof window === 'undefined'
  const schema = isServer ? serverEnvSchema : clientEnvSchema

  const parsed = schema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    ...(isServer && {
      AI_API_URL: process.env.AI_API_URL,
      AI_API_KEY: process.env.AI_API_KEY,
      AI_MODEL: process.env.AI_MODEL,
    }),
  })

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(JSON.stringify(parsed.error.format(), null, 2))
    throw new Error('Invalid environment variables')
  }

  return parsed.data as Env
}

export const env = validateEnv()
