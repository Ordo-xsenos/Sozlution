'use client'

import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/app-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, Loader2, Bot, User as UserIcon } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
}

export default function CoachPage() {
  const { user, request } = useApp()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: 'Привет! Я ваш AI Coach. Я помогу вам в изучении английского языка. О чем вы хотите узнать?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userText = input.trim()
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }))
      const response = await request('/api/v1/ai/chat', {
        body: {
          message: userText,
          history: history,
          language: user?.lang || 'ru'
        }
      }, 'post')

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.text,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, botMsg])
    } catch (e) {
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'assistant',
        text: 'Извините, произошла ошибка при соединении с ИИ. Пожалуйста, попробуйте позже.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col text-white">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-screen p-4 md:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">So&apos;zlution AI Coach</h1>
            <p className="text-sm text-slate-400">Ваш персональный языковой тютор</p>
          </div>
        </div>

        <Card className="flex-1 bg-[#1a2744] border-[#334155] rounded-3xl overflow-hidden flex flex-col mb-6 shadow-2xl">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-sm md:text-base ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-[#2a3f5f] text-slate-100'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[10px] mt-2 block opacity-50">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  </div>
                  <div className="bg-[#2a3f5f] px-4 py-3 rounded-2xl">
                    <span className="text-sm text-slate-400 animate-pulse">Думаю...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-900/50 border-t border-[#334155]">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Задайте вопрос по грамматике или лексике..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-12"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
