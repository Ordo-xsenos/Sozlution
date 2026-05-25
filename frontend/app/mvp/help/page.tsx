'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/context/app-context'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="bg-[#1a2744] border-[#334155]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-[#2a3f5f] transition-colors"
      >
        <h3 className="text-left font-semibold text-white text-sm md:text-base">{question}</h3>
        <ChevronDown
          className={`w-4 h-4 md:w-5 md:h-5 text-blue-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <CardContent className="pt-0 text-gray-300 text-sm md:text-base">
          <p>{answer}</p>
        </CardContent>
      )}
    </Card>
  )
}

export default function HelpPage() {
  const { user } = useApp()
  const t = mvpText[getMvpLang(user?.lang)].help

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-sm md:text-base text-gray-400">{t.subtitle}</p>
        </div>

        {/* FAQs */}
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
          {t.faq.map(([question, answer], idx) => (
            <FAQItem key={idx} question={question} answer={answer} />
          ))}
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-lg md:text-xl text-white">{t.contactTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm md:text-base text-white/90">
            <p className="mb-4">
              {t.contactText}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <a
                href="mailto:support@sozlution.com"
                className="flex-1 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center text-sm md:text-base"
              >
                Email
              </a>
              <a
                href="#"
                className="flex-1 px-4 py-2 border border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-center text-sm md:text-base"
              >
                {t.chat}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
