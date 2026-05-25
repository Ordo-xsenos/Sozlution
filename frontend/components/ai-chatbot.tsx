'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react'
import { getAuthToken } from '@/lib/auth'

interface Message {
  id: string
  type: 'user' | 'bot'
  text: string
  timestamp: Date
  structured?: {
    explanation: string
    corrections: string[]
    suggestions: string[]
    ielts_score?: number | null
  }
}

interface ChatbotProps {
  language?: 'en' | 'uz' | 'ru'
}

export default function AIChatbot({ language = 'en' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const translations = {
    en: {
      title: 'Sozlution Tutor',
      placeholder: 'Ask your tutor...',
      greeting: 'Hello! I\'m your personal IELTS Tutor. Let\'s practice your English together!',
      corrections: 'Corrections',
      suggestions: 'Power Words',
      score: 'Est. IELTS Score',
      questions: [
        'How does spaced repetition work?',
        'What is the pricing model?',
        'How to get started?',
        'Is there a free trial?',
      ],
      responses: {
        greeting: 'Hello! I\'m here to help you learn more about Sozlution. Feel free to ask me anything!',
        pricing: 'We offer a free tier forever with limited features, and a premium plan at $4.99/month for unlimited access to all features including 20 daily words and advanced analytics.',
        spaced: 'Spaced repetition is a learning technique where you review information at increasing intervals. Our AI algorithm optimizes these intervals based on your performance for maximum vocabulary retention.',
        getting_started: 'Getting started with Sozlution is easy! Simply sign up, take a level assessment test, and begin learning with our adaptive system. You\'ll be learning personalized vocabulary within minutes.',
        trial: 'Yes! We offer 7 days of premium features free with no credit card required. After that, you can continue with the free plan or upgrade to premium.',
        features: 'Sozlution includes AI-powered spaced repetition, adaptive learning paths, real-time feedback, voice input for pronunciation practice, IELTS exam prep, and detailed progress analytics.',
        team: 'Our team consists of AI engineers, education specialists, and product experts passionate about making English learning accessible and effective for everyone.',
        technology: 'We use cutting-edge technologies including GPT-4 for personalized feedback, Next.js for our frontend, Node.js for backend, and advanced ML models for adaptive learning.',
      },
    },
    uz: {
      title: 'Sozlution Repetitori',
      placeholder: 'Repetitordan so\'rang...',
      greeting: 'Salom! Men sizning shaxsiy IELTS repetitoringizman. Keling, birga ingliz tilini mashq qilamiz!',
      corrections: 'Tuzatishlar',
      suggestions: 'Kuchli so\'zlar',
      score: 'IELTS bahosi',
      questions: [
        'Spaced repetition qanday ishlaydi?',
        'Narx modeli nima?',
        'Qanday boshlash kerak?',
        'Bepul sinovdan o\'tishi mumkinmi?',
      ],
      responses: {
        greeting: 'Salom! Sozlution haqida savollaringizga javob beraman.',
        pricing: 'Bizda bepul tarif va $4.99/oy premium reja mavjud.',
        spaced: 'Spaced repetition — ma\'lumotni ortib boruvchi intervalda takrorlash usuli.',
        getting_started: 'Ro\'yxatdan o\'ting, daraja testini topshiring va o\'rganishni boshlang.',
        trial: 'Ha, 7 kunlik bepul premium sinov mavjud.',
        features: 'AI takrorlash, moslashtirilgan yo\'l, IELTS tayyorgarlik va analitika.',
        team: 'Biz ta\'lim va AI mutaxassislaridan iborat jamoamiz.',
        technology: 'Next.js, FastAPI va zamonaviy ML modellardan foydalanamiz.',
      },
    },
    ru: {
      title: 'Тьютор Sozlution',
      placeholder: 'Спросите тьютора...',
      greeting: 'Привет! Я твой личный IELTS тьютор. Давай практиковать английский вместе!',
      corrections: 'Исправления',
      suggestions: 'Сильные слова',
      score: 'Оценка IELTS',
      questions: [
        'Как работает интервальное повторение?',
        'Какая модель ценообразования?',
        'Как начать?',
        'Есть ли бесплатный пробный период?',
      ],
      responses: {
        greeting: 'Привет! Я помогу узнать больше о Sozlution.',
        pricing: 'Есть бесплатный тариф и premium за $4.99/мес.',
        spaced: 'Интервальное повторение — техника повторения с увеличивающимися интервалами.',
        getting_started: 'Зарегистрируйтесь, пройдите тест уровня и начните обучение.',
        trial: 'Да, 7 дней premium бесплатно без карты.',
        features: 'AI-повторение, адаптивный путь, подготовка к IELTS и аналитика.',
        team: 'Команда специалистов по образованию и AI.',
        technology: 'Next.js, FastAPI и современные ML-модели.',
      },
    },
  }

  const t = translations[language]

  const getLocalResponse = (messageText: string): string => {
    const lower = messageText.toLowerCase()
    const responses = (t as typeof translations.en).responses
    if (lower.includes('pric') || lower.includes('narx') || lower.includes('цен')) {
      return responses.pricing
    }
    if (lower.includes('spaced') || lower.includes('takror') || lower.includes('повтор')) {
      return responses.spaced
    }
    if (lower.includes('start') || lower.includes('boshla') || lower.includes('начат')) {
      return responses.getting_started
    }
    if (lower.includes('trial') || lower.includes('sinov') || lower.includes('пробн')) {
      return responses.trial
    }
    if (lower.includes('feature') || lower.includes('funksiya') || lower.includes('функц')) {
      return responses.features
    }
    if (lower.includes('team') || lower.includes('jamoa') || lower.includes('команд')) {
      return responses.team
    }
    if (lower.includes('tech') || lower.includes('texnolog') || lower.includes('технолог')) {
      return responses.technology
    }
    return responses.greeting
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'bot',
          text: (t as any).greeting,
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen, messages.length, t])

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const botMessageId = (Date.now() + 1).toString()
    let accumulatedContent = ''

    try {
      const history = messages
        .filter((msg) => msg.type === 'user' || msg.type === 'bot')
        .slice(-6)
        .map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          text: msg.text,
        }))

      const token = getAuthToken()
      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            id: botMessageId,
            type: 'bot',
            text: getLocalResponse(messageText),
            timestamp: new Date(),
          },
        ])
        return
      }

      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageText,
          history,
        }),
      })

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: botMessageId,
            type: 'bot',
            text: getLocalResponse(messageText),
            timestamp: new Date(),
          },
        ])
        return
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      setMessages((prev) => [
        ...prev,
        { id: botMessageId, type: 'bot', text: '', timestamp: new Date() },
      ])

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        // Split by SSE data prefix. Filter empty and handle multiple chunks.
        const parts = chunk.split('data: ').filter(Boolean)

        for (const dataStr of parts) {
          const trimmed = dataStr.trim()
          if (trimmed === '[DONE]') break
          try {
            const parsed = JSON.parse(trimmed)
            const content = parsed.choices?.[0]?.delta?.content || ''
            accumulatedContent += content

            // UI Streaming: Extract 'explanation' value if it's currently being generated
            let displayText = accumulatedContent
            if (accumulatedContent.trim().startsWith('{')) {
              // Regex looks for "explanation":"... value
              const match = accumulatedContent.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)/)
              if (match && match[1]) {
                displayText = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
              }
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, text: displayText } : msg
              )
            )
          } catch (e) {
            // Might be a partial JSON chunk at the end of the read, ignore
          }
        }
      }

      // Final pass to try and parse the full JSON
      try {
        const cleanJson = accumulatedContent.substring(
          accumulatedContent.indexOf('{'),
          accumulatedContent.lastIndexOf('}') + 1
        )
        const structured = JSON.parse(cleanJson)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  text: structured.explanation || msg.text,
                  structured: {
                    explanation: structured.explanation,
                    corrections: structured.corrections || [],
                    suggestions: structured.suggestions || [],
                    ielts_score: structured.ielts_score,
                  },
                }
              : msg
          )
        )
      } catch (e) {
        console.warn('Could not parse final structured response', e)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'bot',
          text: 'Error connecting to AI. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-110 z-40"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-40 transition-all duration-200 ${isMinimized ? 'w-auto' : 'w-96'}`}>
      <div className="bg-card border-2 border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-cyan-500/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <h3 className="font-bold text-foreground">{t.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Minimize"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-cyan-500/20 text-foreground border border-cyan-500/50'
                        : 'bg-purple-500/20 text-foreground border border-purple-500/50'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    {message.structured && (
                      <div className="mt-3 pt-3 border-t border-purple-500/30 space-y-3">
                        {message.structured.corrections.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1">
                              {(t as any).corrections}
                            </p>
                            <ul className="list-disc list-inside text-xs space-y-1 text-slate-300">
                              {message.structured.corrections.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {message.structured.suggestions.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                              {(t as any).suggestions}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {message.structured.suggestions.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] text-emerald-300"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {message.structured.ielts_score && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                              {(t as any).score}:
                            </span>
                            <span className="text-sm font-black text-cyan-300">
                              {message.structured.ielts_score}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-purple-500/20 border border-purple-500/50 px-4 py-3 rounded-lg">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 py-3 border-t border-border bg-secondary/20">
                <p className="text-xs text-muted-foreground mb-2">Popular questions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {t.questions.slice(0, 4).map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(question)}
                      className="text-xs px-3 py-2 bg-secondary border border-border rounded-lg hover:border-cyan-500/50 transition-colors text-left"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-4 bg-secondary/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t.placeholder}
                  className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500/50"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
