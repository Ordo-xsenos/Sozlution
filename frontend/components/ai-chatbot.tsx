'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot'
  text: string
  timestamp: Date
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
      title: 'Sozlution Assistant',
      placeholder: 'Ask me about Sozlution...',
      greeting: 'Hello! I\'m your Sozlution assistant. Ask me anything about our AI-powered English learning platform.',
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
      title: 'Sozlution Assistenti',
      placeholder: 'Sozlution haqida savol bering...',
      greeting: 'Salom! Men Sozlution assistentiman. Bizning AI-powered ingliz tilini o\'rganish platformasi haqida istalganingizni soring.',
      questions: [
        'Spaced repetition qanday ishlaydi?',
        'Narx modeli nima?',
        'Qanday boshlash kerak?',
        'Bepul sinovdan o\'tishi mumkinmi?',
      ],
      responses: {
        greeting: 'Salom! Men Sozlution haqida ko\'proq bilib olishda yordam berish uchun shu yerdaman. Istalganingizni sora olasiz!',
        pricing: 'Biz cheksiz xususiyatlarga ega bepul qatlamni taklif etamiz, premium rejasiga oy uchun $4.99 narxi bilan.',
        spaced: 'Spaced repetition - bu ma\'lumotni ortib boruvchi oraliqlar bilan qayta ko\'rish usuli. Bizning AI algoritmi maksimal saqlash uchun bu oraliqlarni optimallashtirib beradi.',
        getting_started: 'Sozlution bilan boshlash oson! Ro\'yxatdan o\'ting, darajani aniqlash testini qo\'ying va o\'rganishni boshlang.',
        trial: 'Ha! Biz kredit kartasiz 7 kunni premium xususiyatlarini bepul taklif etamiz.',
        features: 'Sozlution AI-powered spaced repetition, adaptiv o\'rganish yo\'llari, real-time fikr-mulohaza va boshqalarni o\'z ichiga oladi.',
        team: 'Bizning jamoamiz AI muhandislari, ta\'lim mutaxassislari va mahsulot ekspertlaridan iborat.',
        technology: 'Biz GPT-4, Next.js, Node.js va advanced ML modellarini ishlatamiz.',
      },
    },
    ru: {
      title: 'Ассистент Sozlution',
      placeholder: 'Спросите о Sozlution...',
      greeting: 'Привет! Я ассистент Sozlution. Спросите меня о нашей платформе изучения английского на основе ИИ.',
      questions: [
        'Как работает интервальное повторение?',
        'Какая модель ценообразования?',
        'Как начать?',
        'Есть ли бесплатный пробный период?',
      ],
      responses: {
        greeting: 'Привет! Я здесь, чтобы помочь вам узнать больше о Sozlution. Спросите меня о чем угодно!',
        pricing: 'Мы предлагаем бесплатный тариф навсегда с ограниченными функциями и премиум-план за $4.99/месяц.',
        spaced: 'Интервальное повторение - это метод обучения, когда вы повторяете информацию с растущими интервалами. Наш ИИ оптимизирует эти интервалы для максимального запоминания.',
        getting_started: 'Начало работы с Sozlution очень просто! Зарегистрируйтесь, пройдите тест уровня и начните учиться.',
        trial: 'Да! Мы предлагаем 7 дней премиум-функций бесплатно без карты.',
        features: 'Sozlution включает интервальное повторение, адаптивные пути обучения, обратную связь в реальном времени и аналитику прогресса.',
        team: 'Наша команда состоит из инженеров ИИ, специалистов в области образования и экспертов по продуктам.',
        technology: 'Мы используем GPT-4, Next.js, Node.js и передовые модели МИ.',
      },
    },
  }

  const t = translations[language]

  const quickAnswers = [
    { keyword: ['pricing', 'cost', 'price', 'how much', 'narx', 'стоим'], response: t.responses.pricing },
    { keyword: ['spaced', 'repetition', 'repeat', 'algorithm', 'algoritm'], response: t.responses.spaced },
    { keyword: ['start', 'begin', 'getting started', 'boshlash', 'начин'], response: t.responses.getting_started },
    { keyword: ['trial', 'free', 'bepul', 'бесплат'], response: t.responses.trial },
    { keyword: ['features', 'xususiyatlar', 'функции'], response: t.responses.features },
    { keyword: ['team', 'jamoа', 'команда'], response: t.responses.team },
    { keyword: ['technology', 'tech', 'stack', 'texnologiya', 'технолог'], response: t.responses.technology },
  ]

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
          text: t.greeting,
          timestamp: new Date(),
        },
      ])
    }
  }, [isOpen])

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

    try {
      const history = messages
        .filter((msg) => msg.type === 'user' || msg.type === 'bot')
        .slice(-6)
        .map((msg) => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          text: msg.text,
        }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          language,
          history,
        }),
      })

      if (!response.ok) {
        throw new Error('Chat request failed')
      }

      const data = (await response.json()) as { reply?: string }
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: data.reply || t.responses.greeting,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch {
      let fallback = t.responses.greeting
      const lowerInput = messageText.toLowerCase()
      for (const item of quickAnswers) {
        if (item.keyword.some((keyword) => lowerInput.includes(keyword))) {
          fallback = item.response
          break
        }
      }
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: fallback,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
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
