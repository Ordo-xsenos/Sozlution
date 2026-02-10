import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

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
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured' },
      { status: 500 },
    )
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
You are the Sozlution assistant.
Only answer questions about the Sozlution startup, product, features, pricing, roadmap, team, or IELTS/English-learning experience on the Sozlution platform.
If the user greets or asks generally about the startup/platform, give a short overview first, then offer to answer details.
If the user asks about anything else, politely refuse and ask them to ask about Sozlution.
Respond in the user's language if you can detect it; otherwise use ${language === 'uz' ? 'Uzbek' : language === 'ru' ? 'Russian' : 'English'}.
Keep answers concise and helpful.

Sozlution context:
- AI-powered English learning platform with spaced repetition for vocabulary.
- Daily word practice, pronunciation, and contextual examples.
- Adaptive level tests (A1–C1 CEFR) and IELTS preparation.
- Progress analytics and learning paths.
- Free tier; premium plan shown on the landing page is $4.99/month with a 7-day premium trial.
  `.trim()

  const contents = [
    ...history.slice(-6).map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.text }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ]

  const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 512,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    return NextResponse.json(
      { error: 'Gemini request failed', details: errorText },
      { status: 502 },
    )
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
  }

  const reply =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim() || refusalByLanguage[language]

  return NextResponse.json({ reply })
}
