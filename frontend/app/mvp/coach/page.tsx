'use client'

import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/app-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Send, Loader2, Bot, User as UserIcon } from 'lucide-react'

import { getAuthToken } from '@/lib/auth'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
  structured?: {
    explanation: string
    corrections: string[]
    suggestions: string[]
    ielts_score?: number | null
  }
}

export default function CoachPage() {
  const { user } = useApp()
  const t = mvpText[getMvpLang(user?.lang)].coach
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: t.greeting,
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

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0]?.id !== '1' || prev[0].role !== 'assistant') return prev
      return [{ ...prev[0], text: t.greeting }]
    })
  }, [t.greeting])

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

    const botMessageId = (Date.now() + 1).toString()
    let accumulatedContent = ''

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text })).slice(-6)
      const token = getAuthToken()
      const requestUrl = '/api/stream'
      console.log('DEBUG: Sending request to:', requestUrl)
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userText,
          history: history,
          language: user?.lang || 'ru'
        })
      })

      if (!response.ok) throw new Error('Chat request failed')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'assistant',
        text: '',
        timestamp: new Date()
      }])

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const parts = chunk.split('data: ').filter(Boolean)

        for (const dataStr of parts) {
          const trimmed = dataStr.trim()
          if (trimmed === '[DONE]') break
          try {
            const parsed = JSON.parse(trimmed)
            const content = parsed.choices?.[0]?.delta?.content || ''
            accumulatedContent += content

            let displayText = accumulatedContent
            if (accumulatedContent.trim().startsWith('{')) {
              // 1. Try standard English key
              const standardMatch = accumulatedContent.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)/)

              if (standardMatch && standardMatch[1]) {
                displayText = standardMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
              } else {
                // 2. Fallback: Find the first long string value (could be a translated key like "Ответ")
                const genericMatch = accumulatedContent.match(/":\s*"([^"]{20,})/ )
                if (genericMatch && genericMatch[1]) {
                  displayText = genericMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
                } else {
                  displayText = t.analyzing
                }
              }
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, text: displayText } : msg
              )
            )
          } catch (e) {
            // Partial chunk
          }
        }
      }

      // Final structured pass
      try {
        const start = accumulatedContent.indexOf('{')
        const end = accumulatedContent.lastIndexOf('}')
        if (start !== -1 && end !== -1) {
          const structured = JSON.parse(accumulatedContent.substring(start, end + 1))
          
          let finalText = structured.explanation || ''
          if (!finalText && (structured.corrections?.length > 0 || structured.suggestions?.length > 0)) {
            finalText = t.fallback
          }

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    text: finalText || msg.text,
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
        }
      } catch (e) {
        console.warn('Final parse error', e)
      }

    } catch (e) {
      console.error(e)
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'assistant',
        text: t.error,
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
            <p className="text-sm text-slate-400">{t.subtitle}</p>
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
                    <div className="space-y-4">
                      {msg.text.split('\n').filter(Boolean).map((para, i) => {
                        const isHeader = para.startsWith('Paragraph') || para.startsWith('Theory:')
                        return (
                          <p key={i} className={`leading-relaxed ${isHeader ? 'font-bold text-blue-300 mt-4' : ''}`}>
                            {para}
                          </p>
                        )
                      })}
                    </div>
                    
                    {msg.structured && (
                      <div className="mt-3 pt-3 border-t border-blue-400/20 space-y-3">
                        {msg.structured.corrections.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                              {t.corrections}
                            </p>
                            <ul className="list-disc list-inside text-xs space-y-1 text-slate-300">
                              {msg.structured.corrections.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {msg.structured.suggestions.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                              Power Words
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {msg.structured.suggestions.map((s, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-300 font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {msg.structured.ielts_score && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                              Est. IELTS Score:
                            </span>
                            <span className="text-sm font-black text-cyan-300">
                              {msg.structured.ielts_score}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

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
                    <span className="text-sm text-slate-400 animate-pulse">{t.thinking}</span>
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
                placeholder={t.placeholder}
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
