'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Zap, TrendingUp, Brain, Headphones, BookOpen, Award, Users, Globe, Phone, Send } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'uz' | 'ru'>('en')

  const translations = {
    en: {
      tagline: 'Learn 5 new words daily',
      hero: 'Master English Vocabulary with Spaced Repetition',
      description: 'Learn English systematically with AI-powered lessons, voice input, and IELTS preparation.',
      features: 'Features',
      howItWorks: 'How it works',
      pricing: 'Pricing',
      signIn: 'Sign In',
      startFree: 'Get Started Free',
      testimonials: 'Testimonials',
      blog: 'Blog',
      contact: 'Contact',
      about: 'About',
    },
    uz: {
      tagline: 'Har kuni 5 ta yangi so\'z o\'rganing',
      hero: 'Ingliz tilini spaced repetition bilan o\'zlashtiring',
      description: 'AI-powered darslar, ovozli kiritish va IELTS tayyorgarligi bilan ingliz tilini tizimli o\'rganing.',
      features: 'Xususiyatlar',
      howItWorks: 'Qanday ishlaydi',
      pricing: 'Narxlar',
      signIn: 'Kirish',
      startFree: 'Bepul boshlang',
      testimonials: 'Sharhlar',
      blog: 'Blog',
      contact: 'Aloqa',
      about: 'Biz haqida',
    },
    ru: {
      tagline: 'Учите 5 новых слов каждый день',
      hero: 'Овладейте английским словарем с повторением',
      description: 'Систематически изучайте английский с помощью уроков на основе ИИ, голосового ввода и подготовки к IELTS.',
      features: 'Функции',
      howItWorks: 'Как это работает',
      pricing: 'Цены',
      signIn: 'Вход',
      startFree: 'Начать бесплатно',
      testimonials: 'Отзывы',
      blog: 'Блог',
      contact: 'Контакты',
      about: 'О нас',
    },
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-foreground">So&apos;zlution</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-foreground hover:text-primary transition">
                {t.features}
              </Link>
              <Link href="#how-it-works" className="text-foreground hover:text-primary transition">
                {t.howItWorks}
              </Link>
              <Link href="#pricing" className="text-foreground hover:text-primary transition">
                {t.pricing}
              </Link>
              <Link href="#testimonials" className="text-foreground hover:text-primary transition">
                {t.testimonials}
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {(['en', 'uz', 'ru'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 py-1 rounded text-sm font-medium transition ${
                      language === lang
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <Button variant="outline" className="hidden sm:inline-flex bg-transparent">
                {t.signIn}
              </Button>
              <Button className="bg-primary hover:bg-primary/90">{t.startFree}</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden scroll-animate">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-secondary rounded-full">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-secondary-foreground">{t.tagline}</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
                {t.hero}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{t.description}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg">
                  {t.startFree}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg border-primary text-primary hover:bg-primary/10 bg-transparent"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative h-96 sm:h-full min-h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="relative z-10 text-center px-6">
                <Brain className="w-24 h-24 text-primary mx-auto mb-4 opacity-50" />
                <p className="text-foreground font-semibold text-lg">Learn Systematically</p>
                <p className="text-muted-foreground text-sm mt-2">Spaced repetition + AI feedback</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-sm text-muted-foreground">Words to Learn</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">A1-C1</div>
              <p className="text-sm text-muted-foreground">Proficiency Levels</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">86%</div>
              <p className="text-sm text-muted-foreground">Level-Up Success</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100K+</div>
              <p className="text-sm text-muted-foreground">Active Learners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Everything You Need to Learn <span className="text-primary">English Fast</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive features designed for systematic vocabulary growth and IELTS exam success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Smart Vocabulary Builder</h3>
              <p className="text-muted-foreground mb-4">20 new words daily with two-section learning system: translation and contextual fill-in-the-blank exercises.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Audio pronunciation guide</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Real-world example sentences</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Spaced Repetition Algorithm</h3>
              <p className="text-muted-foreground mb-4">Advanced adaptive system that reviews words at optimal intervals for maximum retention and long-term memory.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Scientifically-proven method</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Daily streak tracking</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Level Assessment</h3>
              <p className="text-muted-foreground mb-4">Determine your English proficiency with intelligent level tests across A1 to C1 CEFR framework.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Initial proficiency test</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Regular level-up challenges</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">IELTS Practice Module</h3>
              <p className="text-muted-foreground mb-4">Comprehensive exam preparation with Reading, Listening, Writing, and Speaking practice sections.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Full mock tests</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>AI feedback on writing & speaking</span>
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Native Audio Lessons</h3>
              <p className="text-muted-foreground mb-4">Learn authentic pronunciation and listening comprehension with professional native speaker audio.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Clear pronunciation guide</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Speed adjustment options</span>
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Progress Analytics</h3>
              <p className="text-muted-foreground mb-4">Detailed statistics and insights into your learning journey with accuracy tracking and performance metrics.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Words learned dashboard</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Accuracy percentage tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              How So&apos;zlution <span className="text-primary">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple, systematic approach to English mastery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Take Level Test</h3>
              <p className="text-muted-foreground leading-relaxed">
                Start with a comprehensive 20-question assessment to determine your current English proficiency level (A1-C1).
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Learn Daily Words</h3>
              <p className="text-muted-foreground leading-relaxed">
                Master 20 vocabulary words per day through the two-section learning system: translation and contextual usage.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Practice & Progress</h3>
              <p className="text-muted-foreground leading-relaxed">
                Maintain your streak, track your progress, and reach 86% mastery level to unlock the Level-Up test.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                4
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Rise Your Level</h3>
              <p className="text-muted-foreground leading-relaxed">
                Successfully complete level challenges to advance through CEFR proficiency tiers and unlock premium content.
              </p>
            </div>

            {/* Step 5 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                5
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Practice IELTS</h3>
              <p className="text-muted-foreground leading-relaxed">
                Prepare for your IELTS exam with full mock tests, reading, listening, writing, and speaking practice sections.
              </p>
            </div>

            {/* Step 6 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mb-6 mx-auto">
                6
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Achieve Your Goal</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reach your target proficiency level and pass IELTS with confidence through consistent, systematic learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade anytime. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Classic Plan */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Classic</h3>
              <p className="text-muted-foreground mb-6">Perfect for self-paced learners</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">Free</span>
                <p className="text-muted-foreground mt-2">Forever</p>
              </div>
              <Button variant="outline" className="w-full mb-8 border-primary text-primary hover:bg-primary/10 bg-transparent">
                Get Started
              </Button>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">20 words daily</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Spaced repetition</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">1 Full mock test/day</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Progress tracking</span>
                </li>
              </ul>
            </div>

            {/* Premium Plan */}
            <div className="bg-card border-2 border-primary rounded-xl p-8 relative shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Premium</h3>
              <p className="text-muted-foreground mb-6">For serious IELTS learners</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Button className="w-full mb-8 bg-primary hover:bg-primary/90">
                Start Free Trial
              </Button>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Everything in Classic</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">AI Writing feedback</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">AI Speaking analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Unlimited mock tests</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-32 bg-secondary/30 scroll-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Student <span className="text-primary">Success Stories</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real learners sharing their English mastery journey with So&apos;zlution
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ayten Abdurahimova',
                role: 'IELTS Exam Passer',
                content: 'I improved from B1 to C1 in just 4 months. The spaced repetition system really works!',
                rating: 5,
              },
              {
                name: 'Muhammad Karim',
                role: 'Business Professional',
                content: 'The voice input feature helped me with pronunciation. Now I speak English confidently.',
                rating: 5,
              },
              {
                name: 'Dildora Shodmonova',
                role: 'University Student',
                content: 'Best learning app I\'ve tried. The AI feedback on writing is incredibly helpful.',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all">
                <div className="flex gap-1 mb-4">
                  {Array(testimonial.rating)
                    .fill(0)
                    .map((_, i) => (
                      <span key={i} className="text-accent">
                        ★
                      </span>
                    ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">{testimonial.content}</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 sm:py-32 scroll-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Learn from Our <span className="text-primary">10,000+ Articles</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              English learning tips, vocabulary insights, and IELTS strategies from our expert team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'The Science Behind Spaced Repetition',
                excerpt: 'Discover how spaced repetition leverages neuroscience to make vocabulary stick permanently.',
                date: 'Feb 1, 2024',
              },
              {
                title: 'IELTS Writing Tips from Top Scorers',
                excerpt: 'Learn strategies that helped our users achieve high scores in IELTS writing exams.',
                date: 'Jan 28, 2024',
              },
              {
                title: 'Pronunciation Guide: Common Mistakes',
                excerpt: 'Master difficult English sounds with native speaker audio and detailed explanations.',
                date: 'Jan 25, 2024',
              },
            ].map((post, idx) => (
              <Link
                key={idx}
                href="#"
                className="group bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-primary text-primary-foreground scroll-animate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Master English?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join 100,000+ learners who are systematically building their English vocabulary and acing their IELTS exams with So&apos;zlution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg font-semibold"
            >
              Start Learning Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-lg font-semibold bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 sm:py-32 bg-secondary/30 scroll-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Contact <span className="text-primary">So&apos;zlution</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We care about you. Get in touch with any questions or feedback
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-muted-foreground">+998 71 123 45 67</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
              <Send className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Telegram</h3>
              <p className="text-muted-foreground">@sozlution_support</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
              <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Website</h3>
              <p className="text-muted-foreground">www.sozlution.uz</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 scroll-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">S</span>
                </div>
                <span className="font-bold text-foreground">So&apos;zlution</span>
              </div>
              <p className="text-sm text-muted-foreground">Master English with AI-powered spaced repetition and IELTS preparation.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-primary transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-primary transition">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Follow Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition flex items-center gap-2">
                    <Send className="w-4 h-4" /> Telegram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Instagram
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>&copy; 2024 So&apos;zlution. Professional and clean design.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-foreground transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
