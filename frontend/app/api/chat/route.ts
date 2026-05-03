import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 минута
  uniqueTokenPerInterval: 500,
})

type ChatHistoryItem = {
  role: 'user' | 'assistant'
  text: string
}

const ALLOWED_KEYWORDS = [
  'sozlution',
  "soz'lution",
  'english',
  'ielts',
  'spaced repetition',
  'vocabulary',
  'words',
  'cefr',
  'ai',
  'learning',
  'pronunciation',
  'writing',
  'speaking',
  'pricing',
  'price',
  'cost',
  'trial',
  'free',
  'features',
  'team',
  'roadmap',
  'start',
  'sign up',
  'level test',
  'narx',
  'bepul',
  'boshlash',
  'xususiyat',
  'jamoa',
  'цена',
  'бесплат',
  'начать',
  'функц',
  'команд',
  'startup',
  'start-up',
  'project',
  'platform',
  'стартап',
  'проект',
  'платформ',
  'startap',
  'loyiha',
  'platforma',
]

const refusalByLanguage = {
  en: 'I can help only with Sozlution-related questions. Ask me about the platform, features, pricing, or IELTS prep.',
  uz: 'Men faqat Sozlution haqida savollarga yordam bera olaman. Platforma, xususiyatlar, narxlar yoki IELTS tayyorgarligi haqida so‘rang.',
  ru: 'Я могу помочь только с вопросами о Sozlution. Спросите о платформе, функциях, цене или подготовке к IELTS.',
} as const

const BLOCKED_KEYWORDS = [
  'politics',
  'election',
  'president',
  'war',
  'stock',
  'crypto',
  'bitcoin',
  'weather',
  'recipe',
  'medical',
  'diagnosis',
  'finance',
  'спорт',
  'политик',
  'войн',
  'крипт',
  'биткоин',
  'погода',
  'рецепт',
  'медицин',
  'диагноз',
  'финанс',
]

function isOnTopic(message: string) {
  const lower = message.toLowerCase()
  if (BLOCKED_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return false
  }
  if (ALLOWED_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return true
  }
  // Allow short greetings or general questions; model will enforce scope.
  return lower.trim().split(/\s+/).length <= 6
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

  const { success, remaining } = limiter.check(10, ip) // 10 запросов в минуту

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    )
  }

  const baseUrl = env.AI_API_URL
  const apiKey = env.AI_API_KEY
  const model = env.AI_MODEL

  // Normalize URL to OpenAI-compatible chat completions endpoint
  let endpoint = baseUrl.replace(/\/+$/, '')
  if (endpoint.endsWith('/models')) {
    endpoint = endpoint.substring(0, endpoint.length - 7)
  }
  if (!endpoint.endsWith('/chat/completions')) {
    endpoint = `${endpoint.replace(/\/+$/, '')}/chat/completions`
  }

  let payload: {
    message?: string
    language?: 'en' | 'uz' | 'ru'
    history?: ChatHistoryItem[]
  }

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const message = payload?.message?.trim()
  const language = payload?.language ?? 'en'
  const history = Array.isArray(payload?.history) ? payload.history : []

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  if (!isOnTopic(message)) {
    return NextResponse.json({ reply: refusalByLanguage[language] })
  }

  const systemInstruction = `
You are the Sozlution assistant. Only answer questions about the Sozlution startup, English learning, vocabulary practice, IELTS prep, and the Sozlution platform experience.
If the user asks about anything else, politely refuse and ask them to ask about Sozlution or English learning.
Respond in the user's language (Russian if user uses Russian, Uzbek if user uses Uzbek, otherwise English).
Keep answers concise and practical with mini examples.

Sozlution context:
- AI-powered English learning platform with spaced repetition for vocabulary.
- Daily word practice, pronunciation, and contextual examples.
- Adaptive level tests (A1–C1 CEFR) and IELTS preparation.
- Progress analytics and learning paths.
- Free tier; premium plan is $4.99/month with a 7-day premium trial.
  `.trim()

  // Format messages in OpenAI style
  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.slice(-6).map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: item.text,
    })),
    { role: 'user', content: message },
  ]

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 512,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: 'AI API request failed', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extract reply from OpenAI format choices[0].message.content
    const reply = data.choices?.[0]?.message?.content?.trim() || refusalByLanguage[language]

    return NextResponse.json({ reply })
  } catch (error) {
    logger.error('AI API Proxy Error:', error)
    return NextResponse.json({ error: 'Failed to connect to AI API' }, { status: 502 })
  }
}
