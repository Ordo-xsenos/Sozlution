'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import AIChatbot from '@/components/ai-chatbot'
import { Play, ArrowRight, ExternalLink } from 'lucide-react'

export default function DemoPage() {
  const [language, setLanguage] = useState<'en' | 'uz' | 'ru'>('en')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  const translations = {
    en: {
      title: 'Demo & Prototype',
      subtitle: 'Experience Sozlution in Action',
      demoVideo: 'Demo Video',
      videoDesc: '5-minute walkthrough of Sozlution\'s core features',
      videoTitle: 'Sozlution Demo - AI-Powered English Learning',
      videoDescription: 'This demo showcases how Sozlution combines spaced repetition, adaptive learning, and AI feedback to help learners master English vocabulary efficiently.',
      watchDemo: 'Watch Full Demo',
      tryPrototype: 'Try Working Prototype',
      prototypeLink: 'Launch Interactive Prototype',
      features: 'Key Features Demonstrated',
      feature1Title: 'Level Assessment',
      feature1Desc: 'Real-time proficiency level detection (A1-C1 CEFR)',
      feature2Title: 'Daily Learning',
      feature2Desc: 'Master 20 new vocabulary words with context and examples',
      feature3Title: 'AI Feedback',
      feature3Desc: 'Personalized recommendations based on your performance',
      feature4Title: 'Progress Tracking',
      feature4Desc: 'Visual analytics showing your vocabulary mastery and streaks',
      videoSection: 'How It Works',
      section1: 'AI-Powered Spaced Repetition',
      section1Desc: 'Our algorithm optimizes when you review words for maximum retention',
      section2: 'Adaptive Learning Paths',
      section2Desc: 'Content adapts to your proficiency level in real-time',
      section3: 'Real-Time Feedback',
      section3Desc: 'Get instant AI-powered guidance on pronunciation and usage',
      visitPrototype: 'Visit Prototype',
      videoPlaceholder: 'Demo video will be available soon',
      comingSoon: 'Prototype coming soon',
      readMore: 'View on YouTube',
    },
    uz: {
      title: 'Demo va Prototip',
      subtitle: 'Sozlutionni harakatda sinab ko\'ring',
      demoVideo: 'Demo Video',
      videoDesc: 'Sozlution\'s asosiy xususiyatlarining 5 daqiqalik ko\'rish',
      videoTitle: 'Sozlution Demo - AI-Powered Ingliz tilini o\'rganish',
      videoDescription: 'Bu demo Sozlutionning spaced repetition, adaptiv o\'rganish va AI fikr-mulohazani qanday birlashtirishini ko\'rsatadi.',
      watchDemo: 'To\'liq Demoni Ko\'ring',
      tryPrototype: 'Ishchi Prototipni Sinab Ko\'ring',
      prototypeLink: 'Interaktiv Prototipni Ishga Tushiring',
      features: 'Namoyish Qilingan Asosiy Xususiyatlar',
      feature1Title: 'Darajani aniqlash',
      feature1Desc: 'Real-time malakadorlik darajasi aniqlashi (A1-C1 CEFR)',
      feature2Title: 'Kunlik o\'rganish',
      feature2Desc: '20 ta yangi lug\'at so\'zlarini kontekst va misollar bilan o\'zlashtiring',
      feature3Title: 'AI fikr-mulohaza',
      feature3Desc: 'Sizning samaradorligingiz asosida shaxsiylashtirish tavsiyalari',
      feature4Title: 'Taraqqiyotni kuzatish',
      feature4Desc: 'So\'z boyitish va soat shogʻlanishingizni ko\'rsatadigan vizual tahlillar',
      videoSection: 'Qanday ishlaydi',
      section1: 'AI-Powered Spaced Repetition',
      section1Desc: 'Bizning algoritm maksimal saqlash uchun so\'zlarni qayta ko\'rishning vaqtini optimallashtiradi',
      section2: 'Adaptiv o\'rganish yo\'llari',
      section2Desc: 'Kontent real vaqtda sizning malakadorlik darajangizga mos keladi',
      section3: 'Real-Time Fikr-mulohaza',
      section3Desc: 'Talaffuz va foydalanish bo\'yicha instant AI-powered yo\'l-yo\'riqlar olish',
      visitPrototype: 'Prototipni Tashrif Buyuring',
      videoPlaceholder: 'Demo video tez orada taqdim etiladi',
      comingSoon: 'Prototip tez orada keladi',
      readMore: 'YouTube da ko\'ring',
    },
    ru: {
      title: 'Демо и Прототип',
      subtitle: 'Испытайте Sozlution в действии',
      demoVideo: 'Видео демонстрация',
      videoDesc: '5-минутный обзор основных функций Sozlution',
      videoTitle: 'Демо Sozlution - изучение английского с ИИ',
      videoDescription: 'В этой демонстрации показано, как Sozlution объединяет интервальное повторение, адаптивное обучение и обратную связь ИИ.',
      watchDemo: 'Смотреть полную демо',
      tryPrototype: 'Попробовать рабочий прототип',
      prototypeLink: 'Запустить интерактивный прототип',
      features: 'Основные функции в демонстрации',
      feature1Title: 'Оценка уровня',
      feature1Desc: 'Определение уровня владения в реальном времени (A1-C1 CEFR)',
      feature2Title: 'Ежедневное обучение',
      feature2Desc: 'Освойте 20 новых слов с контекстом и примерами',
      feature3Title: 'Обратная связь ИИ',
      feature3Desc: 'Персонализированные рекомендации на основе вашей деятельности',
      feature4Title: 'Отслеживание прогресса',
      feature4Desc: 'Визуальная аналитика вашего словарного запаса и серий',
      videoSection: 'Как это работает',
      section1: 'Интеллектуальное повторение',
      section1Desc: 'Наш алгоритм оптимизирует повторение для максимального запоминания',
      section2: 'Адаптивные пути обучения',
      section2Desc: 'Содержание адаптируется к вашему уровню в реальном времени',
      section3: 'Обратная связь в реальном времени',
      section3Desc: 'Получайте мгновенные рекомендации ИИ по произношению и использованию',
      visitPrototype: 'Посетить прототип',
      videoPlaceholder: 'Видео демонстрация скоро будет доступна',
      comingSoon: 'Прототип скоро',
      readMore: 'Смотреть на YouTube',
    },
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-background relative z-10 overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Cursor glow effect */}
      <div
        className="cursor-glow"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            So'zlution
          </a>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-secondary/50 rounded-full p-1 border border-border">
            {(['en', 'uz', 'ru'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  language === lang
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 sm:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-6xl sm:text-7xl font-bold text-foreground mb-6">
                {t.title}
              </h1>
              <p className="text-2xl text-muted-foreground mb-12">
                {t.subtitle}
              </p>
            </div>

            {/* Video Section */}
            <div className="grid md:grid-cols-2 gap-12 mb-20">
              {/* Video Player */}
              <div className="relative">
                <div className="aspect-video bg-secondary/30 border-2 border-cyan-500/30 rounded-2xl overflow-hidden flex items-center justify-center group hover:border-cyan-500/60 transition-all">
                  <div className="relative w-full h-full">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title={t.videoTitle}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
              </div>

              {/* Video Description */}
              <div className="flex flex-col justify-center">
                <h2 className="text-4xl font-bold text-foreground mb-6">
                  {t.demoVideo}
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {t.videoDescription}
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    { title: t.feature1Title, desc: t.feature1Desc },
                    { title: t.feature2Title, desc: t.feature2Desc },
                    { title: t.feature3Title, desc: t.feature3Desc },
                    { title: t.feature4Title, desc: t.feature4Desc },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                >
                  {t.readMore} <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-secondary/30 border border-border rounded-2xl p-12 mb-20">
              <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
                {t.videoSection}
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: t.section1, desc: t.section1Desc, num: '1', color: 'cyan' },
                  { title: t.section2, desc: t.section2Desc, num: '2', color: 'purple' },
                  { title: t.section3, desc: t.section3Desc, num: '3', color: 'pink' },
                ].map((item, idx) => (
                  <div key={idx} className={`bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-xl p-6`}>
                    <div className={`w-10 h-10 rounded-full bg-${item.color}-500 text-background font-bold flex items-center justify-center mb-4`}>
                      {item.num}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prototype Section */}
            <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-12">
              <h2 className="text-4xl font-bold text-foreground mb-6">
                {t.tryPrototype}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t.comingSoon}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold rounded-lg transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/50 backdrop-blur relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">So&apos;zlution</h3>
              <p className="text-sm text-muted-foreground">Master English with AI</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/#features" className="hover:text-primary transition">Features</a></li>
                <li><a href="/#pricing" className="hover:text-primary transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/#team" className="hover:text-primary transition">Team</a></li>
                <li><a href="/#contact" className="hover:text-primary transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 So&apos;zlution. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <AIChatbot language={language} />
    </div>
  )
}
