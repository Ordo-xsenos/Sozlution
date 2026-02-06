'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, TrendingUp, Brain, Headphones, BookOpen, Award, Globe, Phone, Send } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'uz' | 'ru'>('en')

  const [expandedStep, setExpandedStep] = useState<number | null>(null)

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
      noCardRequired: 'No credit card required. Premium features after 7 days.',
      watchDemo: 'Watch Demo',
      learnSystematically: 'Learn Systematically',
      aiPowered: 'AI-powered personalization',
      wordsToMaster: 'Words to Master',
      successRate: 'Success Rate',
      activeLearnersCount: 'Active Learners',
      cefr: 'CEFR Levels',
      powerfullFeatures: 'Powerful Features for Serious Learners',
      allYouNeed: 'Everything you need to master English vocabulary and ace your IELTS exam',
      dailyVocab: 'Daily Vocabulary Builder',
      dailyVocabDesc: 'Master 5 new words each day with translation, pronunciation, and contextual examples.',
      spacedRep: 'Spaced Repetition System',
      spacedRepDesc: 'AI-optimized recall schedule that maximizes long-term retention using neuroscience principles.',
      levelTests: 'Adaptive Level Tests',
      levelTestsDesc: 'Intelligent assessment across A1 to C1 CEFR levels with personalized learning paths.',
      ieltsPrep: 'IELTS Exam Prep',
      ieltsPrepDesc: 'Full practice tests, writing feedback, and speaking analysis from AI instructors.',
      nativeAudio: 'Native Audio Training',
      nativeAudioDesc: 'Professional pronunciation guides and listening comprehension with speed controls.',
      analytics: 'Progress Analytics',
      analyticsDesc: 'Detailed dashboards tracking accuracy, streaks, words learned, and performance metrics.',
      howItWorksTitle: 'How It Works',
      howItWorksDesc: 'Simple steps to master English',
      processSteps: 'Process Steps',
      step1: 'Take Level Test',
      step1Desc: 'Start with a comprehensive assessment to determine your current English proficiency level (A1-C1).',
      step2: 'Learn Daily Words',
      step2Desc: 'Master 5 vocabulary words per day through interactive lessons: translation and contextual usage.',
      step3: 'Practice & Progress',
      step3Desc: 'Maintain your streak, track your progress, and reach 86% mastery level to unlock the Level-Up test.',
      step4: 'Rise Your Level',
      step4Desc: 'Successfully complete level challenges to advance through CEFR proficiency tiers.',
      step5: 'Practice IELTS',
      step5Desc: 'Prepare for your IELTS exam with full mock tests and specialized practice sections.',
      step6: 'Achieve Your Goal',
      step6Desc: 'Reach your target proficiency level and pass IELTS with confidence through consistent learning.',
      studentSuccessStories: 'Student Success Stories',
      realLearners: 'Real learners sharing their English mastery journey with So\'zlution',
      successStory1: 'I improved from B1 to C1 in just 4 months. The spaced repetition system really works!',
      successStory1Name: 'Ayten Abdurahimova',
      successStory1Role: 'IELTS Exam Passer',
      successStory2: 'The voice input feature helped me with pronunciation. Now I speak English confidently.',
      successStory2Name: 'Muhammad Karim',
      successStory2Role: 'Business Professional',
      successStory3: 'Best learning app I\'ve tried. The AI feedback on writing is incredibly helpful.',
      successStory3Name: 'Dildora Shodmonova',
      successStory3Role: 'University Student',
      blogArticles: 'Learn from Our 10,000+ Articles',
      blogExcerpt: 'English learning tips, vocabulary insights, and IELTS strategies from our expert team',
      blogTitle1: 'The Science Behind Spaced Repetition',
      blogExcerpt1: 'Discover how spaced repetition leverages neuroscience to make vocabulary stick permanently.',
      blogDate1: 'Feb 1, 2024',
      blogTitle2: 'IELTS Writing Tips from Top Scorers',
      blogExcerpt2: 'Learn strategies that helped our users achieve high scores in IELTS writing exams.',
      blogDate2: 'Jan 28, 2024',
      blogTitle3: 'Pronunciation Guide: Common Mistakes',
      blogExcerpt3: 'Master difficult English sounds with native speaker audio and detailed explanations.',
      blogDate3: 'Jan 25, 2024',
      pricing1: 'Classic',
      pricing2: 'Premium',
      pricingSubtitle1: 'Perfect for self-paced learners',
      pricingSubtitle2: 'For serious IELTS learners',
      pricingFree: 'Free',
      pricingForever: 'Forever',
      pricing99: '$9.99',
      pricingMonth: '/month',
      pricing1Include: '20 words daily',
      pricing2Include: 'Everything in Classic',
      readyToMaster: 'Ready to Master English?',
      join100k: 'Join 100,000+ learners who are systematically building their English vocabulary and acing their IELTS exams with So\'zlution.',
      contact1Title: 'Contact So\'zlution',
      contact1Desc: 'We care about you. Get in touch with any questions or feedback',
      contactPhone: 'Phone',
      contactTelegram: 'Telegram',
      contactWebsite: 'Website',
      allRightsReserved: 'All rights reserved.',
      product: 'Product',
      company: 'Company',
      followUs: 'Follow Us',
    },
    uz: {
      tagline: 'Har kuni 5 ta yangi so\'z o\'rganing',
      hero: 'Ingliz tilini Spaced Repetition bilan o\'zlashtiring',
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
      noCardRequired: 'Kredit kartasi talab qilinmaydi. Premium xususiyatlar 7 kundan keyin.',
      watchDemo: 'Demo ko\'ring',
      learnSystematically: 'Tizimli o\'rganing',
      aiPowered: 'Sun\'iy intellekt tomonidan shaxsiylashtirish',
      wordsToMaster: 'o\'zlashtirish uchun so\'zlar',
      successRate: 'Muvaffaqiyat darajasi',
      activeLearnersCount: 'Faol ta\'lim qiluvchilar',
      cefr: 'CEFR darajalari',
      powerfullFeatures: 'Jiddiy ta\'lim qiluvchilar uchun kuchli xususiyatlar',
      allYouNeed: 'Ingliz tilini o\'zlashtirish va IELTS imtihonida muvaffaq bo\'lish uchun kerak bo\'lgan hamma narsa',
      dailyVocab: 'Kunlik so\'z boyitish',
      dailyVocabDesc: 'Har kuni 5 ta so\'zni tarjima, talaffuz va kontekstual misollari bilan o\'zlashtiring.',
      spacedRep: 'Spaced Repetition tizimi',
      spacedRepDesc: 'Sun\'iy intellekt tomonidan optimallashtirish uchun tuzilgan eslashni ko\'pnik vaqt uchun saqlaydi.',
      levelTests: 'Adaptiv darajali testlar',
      levelTestsDesc: 'A1 dan C1 gacha CEFR darajalari bo\'yicha intelligent baholash va shaxsiy ta\'lim yo\'llari.',
      ieltsPrep: 'IELTS imtihon tayyorgarligi',
      ieltsPrepDesc: 'To\'liq amaliy testlar, yozish bo\'yicha fikr-mulohaza va AI instruktorlardan nutq tahlili.',
      nativeAudio: 'Native audio o\'qitish',
      nativeAudioDesc: 'Professional talaffuz qo\'llanmalari va tezlik boshqaruvi bilan tinglash tushunchasi.',
      analytics: 'Taraqqiyot tahlilotikasi',
      analyticsDesc: 'Aniqlik, soatlar, o\'rganilgan so\'zlar va samaradorlik metrikalarini kuzatadigan batafsil boshqaruvchi paneeli.',
      howItWorksTitle: 'Qanday ishlaydi',
      howItWorksDesc: 'Ingliz tilini o\'zlashtirish uchun oddiy qadamlar',
      processSteps: 'Jarayon bosqichlari',
      step1: 'Darajani aniqlash testi',
      step1Desc: 'Sizning hozirgi Ingliz tilini o\'zlashtirish darajasini aniqlash uchun keng qamrovli baholash bilan boshlang (A1-C1).',
      step2: 'Kunlik so\'zlarni o\'rganing',
      step2Desc: 'Har kuni 5 ta so\'z bilimini interaktiv darslar orqali o\'zlashtiring: tarjima va kontekstual foydalanish.',
      step3: 'Amaliyot va taraqqiyot',
      step3Desc: 'Soatlaringizni saqlang, taraqqiyotingizni kuzatib boring va 86% o\'zlashtirish darajasiga erishing.',
      step4: 'Darajangizni ko\'taring',
      step4Desc: 'Darajani o\'zlashtirish sinov sinov qilish orqali CEFR malakadorlik darajasini bosqichma-bosqich ko\'taring.',
      step5: 'IELTS amaliyoti',
      step5Desc: 'IELTS imtihoniga to\'liq amaliy testlar va ixtisoslashtirilgan amaliyot bo\'limlari bilan tayyorlaning.',
      step6: 'O\'z maqsalingizga erishing',
      step6Desc: 'Tizimli ta\'lim orqali maqsad darajasiga erishing va IELTS imtihonini osonlik bilan o\'tib ketaveringiz.',
      studentSuccessStories: 'Talabalar muvaffaqiyatining hikoyalari',
      realLearners: 'So\'zlution bilan ingliz tilini o\'zlashtirish sayohatingizni ulashayotgan haqiqiy ta\'lim qiluvchilar',
      successStory1: 'Men B1 dan C1 ga 4 oy ichida o\'sdim. Spaced repetition tizimi haqiqatan ham ishlaydi!',
      successStory1Name: 'Ayten Abdurahimova',
      successStory1Role: 'IELTS imtihon topshirgani',
      successStory2: 'Ovozli kiritish xususiyati mani talaffuz bilan yordam berdi. Endi men ingliz tilida ishonch bilan gaplashaman.',
      successStory2Name: 'Muhammad Karim',
      successStory2Role: 'Biznes mutaxassisi',
      successStory3: 'Sinovdan o\'tgan eng yaxshi ta\'lim ilovalari. AI yozish bo\'yicha fikr-mulohaza juda foydali.',
      successStory3Name: 'Dildora Shodmonova',
      successStory3Role: 'Universitet talabasiy',
      blogArticles: '10,000+ maqolalardan o\'rganing',
      blogExcerpt: 'Ingliz tili o\'qitish maslahatlar, so\'z xavfi va IELTS strategiyalar bizning mutaxassis jamoasi tomonidan',
      blogTitle1: 'Spaced Repetition orqasidagi fan',
      blogExcerpt1: 'Spaced repetition qanday neyrobiologiya bilan so\'zlar qolayotganini o\'rtadi.',
      blogDate1: 'Feb 1, 2024',
      blogTitle2: 'En\'anali ko\'rsatkichlar orasidan IELTS yozish maslahatlar',
      blogExcerpt2: 'IELTS yozish imtihonida yuqori ballga yetishtirilgan strategiyalarni o\'rganing.',
      blogDate2: 'Jan 28, 2024',
      blogTitle3: 'Talaffuz qo\'llanmasi: keng tarqalgan xatolar',
      blogExcerpt3: 'Qiyin Ingliz tillarini native speaker audio va batafsil tushuntirishlar bilan o\'zlashtiring.',
      blogDate3: 'Jan 25, 2024',
      pricing1: 'Klassik',
      pricing2: 'Premium',
      pricingSubtitle1: 'O\'z tempi bilan o\'rganadigon ta\'lim qiluvchilar uchun',
      pricingSubtitle2: 'Jiddiy IELTS ta\'lim qiluvchilar uchun',
      pricingFree: 'Bepul',
      pricingForever: 'Abadiy',
      pricing99: '$9.99',
      pricingMonth: '/oy',
      pricing1Include: 'Har kuni 20 so\'z',
      pricing2Include: 'Klassikda hamma nars',
      readyToMaster: 'Ingliz tilini o\'zlashtirishga tayyor musiz?',
      join100k: '100,000+ ta\'lim qiluvchilar So\'zlution bilan ingliz tilini o\'zlashtirish va IELTS imtihoniga muvaffaq bo\'lishdagi So\'zlution bilan qo\'shiling.',
      contact1Title: 'So\'zlution bilan aloqa',
      contact1Desc: 'Biz sizni g\'amxoramiz. Savollar yoki fikr-mulohaza uchun bog\'laning',
      contactPhone: 'Telefon',
      contactTelegram: 'Telegram',
      contactWebsite: 'Veb-sayt',
      allRightsReserved: 'Barcha huquqlar himoyalangan.',
      product: 'Mahsulot',
      company: 'Kompaniya',
      followUs: 'Bizni kuzatib boring',
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
      noCardRequired: 'Кредитная карта не требуется. Премиум-функции через 7 дней.',
      watchDemo: 'Смотреть демо',
      learnSystematically: 'Учитесь систематически',
      aiPowered: 'Персонализация на основе ИИ',
      wordsToMaster: 'Слов для изучения',
      successRate: 'Уровень успеха',
      activeLearnersCount: 'Активных учащихся',
      cefr: 'Уровни CEFR',
      powerfullFeatures: 'Мощные функции для серьезных учащихся',
      allYouNeed: 'Все, что вам нужно для овладения английским словарем и успешной сдачи экзамена IELTS',
      dailyVocab: 'Ежедневное изучение словарного запаса',
      dailyVocabDesc: 'Овладейте 5 словами в день с переводом, произношением и примерами в контексте.',
      spacedRep: 'Система распределенного повторения',
      spacedRepDesc: 'Оптимизированное ИИ расписание повторений, которое максимизирует долговременное сохранение, используя принципы нейробиологии.',
      levelTests: 'Адаптивные тесты уровня',
      levelTestsDesc: 'Интеллектуальное оценивание по уровням CEFR с A1 по C1 и персонализированные траектории обучения.',
      ieltsPrep: 'Подготовка к экзамену IELTS',
      ieltsPrepDesc: 'Полные практические тесты, отзывы по письму и анализ речи от преподавателей на основе ИИ.',
      nativeAudio: 'Обучение нативному аудио',
      nativeAudioDesc: 'Профессиональные руководства по произношению и понимание на слух с элементами управления скоростью.',
      analytics: 'Аналитика прогресса',
      analyticsDesc: 'Подробные панели инструментов, отслеживающие точность, серии, изученные слова и метрики производительности.',
      howItWorksTitle: 'Как это работает',
      howItWorksDesc: 'Простые шаги для овладения английским языком',
      processSteps: 'Этапы процесса',
      step1: 'Тест определения уровня',
      step1Desc: 'Начните с комплексной оценки, чтобы определить ваш текущий уровень владения английским языком (A1-C1).',
      step2: 'Учите ежедневные слова',
      step2Desc: 'Овладейте 5 словами в день чере�� интерактивные уроки: перевод и использование в контексте.',
      step3: 'Практика и прогресс',
      step3Desc: 'Сохраняйте свою серию, отслеживайте прогресс и достигайте 86% уровня владения для разблокировки теста повышения уровня.',
      step4: 'Повысьте уровень',
      step4Desc: 'Успешно завершите испытания уровня, чтобы продвинуться по уровням мастерства CEFR.',
      step5: 'Практика IELTS',
      step5Desc: 'Подготовьтесь к экзамену IELTS с полными практическими тестами и специализированными разделами практики.',
      step6: 'Достигните своей цели',
      step6Desc: 'Достигните целевого уровня владения и пройдите IELTS с уверенностью благодаря последовательному обучению.',
      studentSuccessStories: 'Истории успеха учащихся',
      realLearners: 'Настоящие учащиеся, делящиеся своим путем овладения английским языком с So\'zlution',
      successStory1: 'Я улучшился с B1 на C1 всего за 4 месяца. Система распределенного повторения действительно работает!',
      successStory1Name: 'Айтен Абдурахимова',
      successStory1Role: 'Сдавший экзамен IELTS',
      successStory2: 'Функция голосового ввода помогла мне с произношением. Теперь я уверенно говорю по-английски.',
      successStory2Name: 'Мухаммад Карим',
      successStory2Role: 'Бизнес-профессионал',
      successStory3: 'Лучшее приложение для обучения из всех, что я пробовал. Отзывы ИИ по письму невероятно полезны.',
      successStory3Name: 'Дилдора Шодмонова',
      successStory3Role: 'Студентка университета',
      blogArticles: 'Учитесь из наших 10,000+ статей',
      blogExcerpt: 'Советы по изучению английского языка, идеи по словарю и стратегии IELTS от нашей команды экспертов',
      blogTitle1: 'Наука распределенного повторения',
      blogExcerpt1: 'Откройте, как распределенное повторение использует нейробиологию для постоянного запоминания слов.',
      blogDate1: 'Feb 1, 2024',
      blogTitle2: 'Советы по написанию IELTS от лучших учащихся',
      blogExcerpt2: 'Изучите стратегии, которые помогли нашим пользователям получить высокие баллы на письменном экзамене IELTS.',
      blogDate2: 'Jan 28, 2024',
      blogTitle3: 'Руководство по произношению: распространенные ошибки',
      blogExcerpt3: 'Овладейте сложными английскими звуками с помощью аудио носителя языка и подробных объяснений.',
      blogDate3: 'Jan 25, 2024',
      pricing1: 'Классический',
      pricing2: 'Премиум',
      pricingSubtitle1: 'Идеально для самостоятельного обучения',
      pricingSubtitle2: 'Для серьезных учащихся IELTS',
      pricingFree: 'Бесплатно',
      pricingForever: 'Навсегда',
      pricing99: '$9.99',
      pricingMonth: '/месяц',
      pricing1Include: '20 слов в день',
      pricing2Include: 'Все в классическом',
      readyToMaster: 'Готовы овладеть английским?',
      join100k: 'Присоединитесь к 100 000+ учащимся, которые систематически развивают словарный запас английского языка и блестяще сдают экзамен IELTS с помощью So\'zlution.',
      contact1Title: 'Контактная информация So\'zlution',
      contact1Desc: 'Мы заботимся о вас. Свяжитесь с нами с любыми вопросами или отзывами',
      contactPhone: 'Телефон',
      contactTelegram: 'Telegram',
      contactWebsite: 'Веб-сайт',
      allRightsReserved: 'Все права защищены.',
      product: 'Продукт',
      company: 'Компания',
      followUs: 'Следите за нами',
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
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col justify-center">
              <h1 className="text-6xl sm:text-7xl font-bold text-foreground mb-6 leading-tight text-balance">
                {t.hero}
              </h1>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
                {t.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-full font-semibold">
                  {t.startFree}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg border-2 border-foreground text-foreground hover:bg-foreground/5 bg-transparent rounded-full px-8 py-6 font-semibold"
                >
                  {t.watchDemo}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{t.noCardRequired}</p>
            </div>

            {/* Hero Visual - Minimalist */}
            <div className="relative h-96 sm:h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-accent/15 rounded-3xl"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <p className="text-2xl font-semibold text-foreground mb-2">{t.learnSystematically}</p>
                <p className="text-muted-foreground">{t.aiPowered}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 border-b border-border bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { stat: '50K+', label: 'Words to Master' },
              { stat: '86%', label: 'Success Rate' },
              { stat: '100K+', label: 'Active Learners' },
              { stat: 'A1-C1', label: 'CEFR Levels' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-3">{item.stat}</div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 max-w-3xl">
              {t.powerfullFeatures}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t.allYouNeed}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                icon: BookOpen,
                title: t.dailyVocab,
                description: t.dailyVocabDesc,
              },
              {
                icon: TrendingUp,
                title: t.spacedRep,
                description: t.spacedRepDesc,
              },
              {
                icon: Brain,
                title: t.levelTests,
                description: t.levelTestsDesc,
              },
              {
                icon: Award,
                title: t.ieltsPrep,
                description: t.ieltsPrepDesc,
              },
              {
                icon: Headphones,
                title: t.nativeAudio,
                description: t.nativeAudioDesc,
              },
              {
                icon: TrendingUp,
                title: t.analytics,
                description: t.analyticsDesc,
              },
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="group">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-secondary/30 scroll-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              {t.howItWorksTitle}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t.howItWorksDesc}
            </p>
          </div>

          <div className="space-y-4">
            {[
              { step: 1, title: t.step1, desc: t.step1Desc },
              { step: 2, title: t.step2, desc: t.step2Desc },
              { step: 3, title: t.step3, desc: t.step3Desc },
              { step: 4, title: t.step4, desc: t.step4Desc },
              { step: 5, title: t.step5, desc: t.step5Desc },
              { step: 6, title: t.step6, desc: t.step6Desc },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all"
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                  className="w-full px-6 py-6 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <div
                    className={`text-primary transition-transform ${
                      expandedStep === idx ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </div>
                </button>
                {expandedStep === idx && (
                  <div className="px-6 pb-6 border-t border-border bg-secondary/30">
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                )}
              </div>
            ))}
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
              {language === 'uz' ? 'Bepul boshlang, istalgan vaqtda yangilanish. Yashirin to\'lov yo\'q.' : language === 'ru' ? 'Начните бесплатно, обновляйте в любое время. Нет скрытых платежей.' : 'Start free, upgrade anytime. No hidden fees.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Classic Plan */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">{t.pricing1}</h3>
              <p className="text-muted-foreground mb-6">{t.pricingSubtitle1}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{t.pricingFree}</span>
                <p className="text-muted-foreground mt-2">{t.pricingForever}</p>
              </div>
              <Button variant="outline" className="w-full mb-8 border-primary text-primary hover:bg-primary/10 bg-transparent">
                {t.startFree}
              </Button>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{t.pricing1Include}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{t.spacedRep}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">1 {language === 'uz' ? 'to\'liq' : language === 'ru' ? 'полный' : 'full'} mock test/{language === 'uz' ? 'kun' : language === 'ru' ? 'день' : 'day'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{language === 'uz' ? 'Taraqqiyot kuzatish' : language === 'ru' ? 'Отслеживание прогресса' : 'Progress tracking'}</span>
                </li>
              </ul>
            </div>

            {/* Premium Plan */}
            <div className="bg-card border-2 border-primary rounded-xl p-8 relative shadow-lg">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  {language === 'uz' ? 'Eng mashhur' : language === 'ru' ? 'Самый популярный' : 'Most Popular'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{t.pricing2}</h3>
              <p className="text-muted-foreground mb-6">{t.pricingSubtitle2}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{t.pricing99}</span>
                <span className="text-muted-foreground">{t.pricingMonth}</span>
              </div>
              <Button className="w-full mb-8 bg-primary hover:bg-primary/90">
                {language === 'uz' ? 'Bepul sinab ko\'ring' : language === 'ru' ? 'Начать бесплатную пробную версию' : 'Start Free Trial'}
              </Button>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{t.pricing2Include}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">AI {language === 'uz' ? 'yozish' : language === 'ru' ? 'письмо' : 'writing'} {language === 'uz' ? 'fikri' : language === 'ru' ? 'отзыв' : 'feedback'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">AI {language === 'uz' ? 'soʻzlash tahlili' : language === 'ru' ? 'анализ речи' : 'speaking analysis'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{language === 'uz' ? 'Cheksiz' : language === 'ru' ? 'Неограниченный' : 'Unlimited'} mock tests</span>
                </li>
              </ul>
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
              {t.studentSuccessStories} <span className="text-primary"></span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.realLearners}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: t.successStory1Name,
                role: t.successStory1Role,
                content: t.successStory1,
                rating: 5,
              },
              {
                name: t.successStory2Name,
                role: t.successStory2Role,
                content: t.successStory2,
                rating: 5,
              },
              {
                name: t.successStory3Name,
                role: t.successStory3Role,
                content: t.successStory3,
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
              {t.blogArticles}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.blogExcerpt}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: t.blogTitle1,
                excerpt: t.blogExcerpt1,
                date: t.blogDate1,
              },
              {
                title: t.blogTitle2,
                excerpt: t.blogExcerpt2,
                date: t.blogDate2,
              },
              {
                title: t.blogTitle3,
                excerpt: t.blogExcerpt3,
                date: t.blogDate3,
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
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">{t.readyToMaster}</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            {t.join100k}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg font-semibold"
            >
              {t.startFree}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-lg font-semibold bg-transparent"
            >
              {language === 'uz' ? 'Demo rejalashtiring' : language === 'ru' ? 'Запланировать демо' : 'Schedule Demo'}
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 sm:py-32 bg-secondary/30 scroll-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t.contact1Title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.contact1Desc}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{t.contactPhone}</h3>
              <p className="text-muted-foreground">+998 71 123 45 67</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
              <Send className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{t.contactTelegram}</h3>
              <p className="text-muted-foreground">@sozlution_support</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
              <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{t.contactWebsite}</h3>
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
              <h4 className="font-semibold text-foreground mb-4">{t.product}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition">
                    {t.features}
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-primary transition">
                    {t.pricing}
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-primary transition">
                    {t.howItWorks}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t.company}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary transition">
                    {t.about}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition">
                    {t.blog}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition">
                    {t.contact}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t.followUs}</h4>
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
            <p>&copy; 2024 So&apos;zlution. {t.allRightsReserved}</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition">
                {language === 'uz' ? 'Shaxsiylik siyosati' : language === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
              </Link>
              <Link href="#" className="hover:text-foreground transition">
                {language === 'uz' ? 'Foydalanish shartlari' : language === 'ru' ? 'Условия обслуживания' : 'Terms of Service'}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
