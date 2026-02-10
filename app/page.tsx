'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import AIChatbot from '@/components/ai-chatbot'
import { Check, TrendingUp, Brain, Headphones, BookOpen, Award, Globe, Phone, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ThemeToggle from '@/components/theme-toggle'

type CountUpProps = {
  value: number
  suffix?: string
  formatter?: (value: number) => string
}

function CountUp({ value, suffix = '', formatter }: CountUpProps) {
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const node = ref.current
    if (!node) return

    const update = () => {
      const rect = node.getBoundingClientRect()
      const viewport = window.innerHeight || 1
      const elementCenter = rect.top + rect.height / 2
      const start = viewport
      const end = viewport / 2
      const progressRaw = 1 - (elementCenter - end) / (start - end)
      const progress = Math.min(Math.max(progressRaw, 0), 1)
      const current = Math.round(value * progress)
      setDisplay(current)
    }

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [started, value])

  const formatted = formatter ? formatter(display) : display.toString()

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  )
}

const translations = {
  en: {
    tagline: 'Learn 20 new words daily',
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
    powerfullFeatures: 'Powerful Features for Serious Learners',
    allYouNeed: 'Everything you need to master English vocabulary and ace your IELTS exam',
    dailyVocab: 'Daily Vocabulary Builder',
    dailyVocabDesc: 'Master 20 new words each day with translation, pronunciation, and contextual examples.',
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
    step1: 'Take Level Test',
    step1Desc: 'Start with a comprehensive assessment to determine your current English proficiency level (A1-C1).',
    step2: 'Learn Daily Words',
    step2Desc: 'Master 20 vocabulary words per day through interactive lessons: translation and contextual usage.',
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
    successStory1Name: 'Абдухалилов Азимжон',
    successStory1Role: 'IELTS Exam Passer',
    successStory2: 'The voice input feature helped me with pronunciation. Now I speak English confidently.',
    successStory2Name: 'Файзуллавев Акбар',
    successStory2Role: 'Business Professional',
    successStory3: 'Best learning app I\'ve tried. The AI feedback on writing is incredibly helpful.',
    successStory3Name: 'Файзуллаев Муххаммадали',
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
    pricingTitle: 'Simple, Transparent Pricing',
    mostPopular: 'Most Popular',
    pricingFree: 'Free',
    pricingForever: 'Forever',
    pricing99: '$4.99',
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
    statsWords: 'Words to Master',
    statsSuccess: 'Success Rate',
    statsActive: 'Active English Learners in Uzbekistan',
    statsCefr: 'CEFR Levels',
    problemPoint1: 'Ineffective learning methods',
    problemPoint2: 'Lack of personalization',
    problemPoint3: 'Low engagement and retention',
    solutionPoint1: 'AI-powered spaced repetition',
    solutionPoint2: 'Adaptive learning paths',
    solutionPoint3: 'Real-time personalized feedback',
    product: 'Product',
    company: 'Company',
    followUs: 'Follow Us',
    // Pitch sections
    problemSolution: 'Problem & Solution',
    problemTitle: 'The Problem',
    problemDesc: 'Millions of English learners struggle to maintain consistent progress due to ineffective methods, lack of motivation, and personalized guidance. Traditional learning apps use generic approaches without adapting to individual proficiency levels.',
    solutionTitle: 'Our Solution',
    solutionDesc: 'Sozlution combines AI-powered spaced repetition, adaptive learning paths, and real-time feedback to create a personalized English mastery experience that keeps learners engaged and motivated.',
    ourTeam: 'Our Team',
    teamLeader: 'Team Lead & Product',
    teamBackend: 'AI & Backend Engineer',
    teamFrontend: 'Frontend Developer',
    whyUs: 'Why We Can Solve This',
    whyUsDesc: 'Our team combines expertise in AI/ML, education technology, and product development with a passion for making quality English education accessible to everyone.',
    roadmap: 'Our Roadmap',
    roadmapIdea: 'Idea',
    roadmapIdeaDesc: 'Initial concept and market research',
    roadmapPrototype: 'Prototype',
    roadmapPrototypeDesc: 'MVP development and user testing',
    roadmapMvp: 'MVP',
    roadmapMvpDesc: 'Public beta launch',
    roadmapLaunch: 'Launched',
    roadmapLaunchDesc: 'Full production release',
    implementation: 'How We\'ll Implement It',
    phase1: 'Phase 1: Core Platform',
    phase1Desc: 'Build scalable backend infrastructure with Node.js, PostgreSQL, and AI model integration (GPT-4 for personalized feedback)',
    phase2: 'Phase 2: Frontend & Mobile',
    phase2Desc: 'Develop responsive web app (Next.js, React) and native mobile apps (React Native)',
    phase3: 'Phase 3: AI Features',
    phase3Desc: 'Implement advanced AI tutoring, voice recognition, and adaptive learning algorithms',
    phase4: 'Phase 4: Scale & Growth',
    phase4Desc: 'Multi-language support, analytics dashboard, and community features',
    techStack: 'Technology Stack',
    frontend: 'Frontend',
    backend: 'Backend',
    aiTools: 'AI & ML Tools',
    infrastructure: 'Infrastructure',
    demo: 'Demo & Prototype',
  },
  uz: {
    tagline: 'Har kuni 20 ta yangi so\'z o\'rganing',
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
    successStory1Name: 'Абдухалилов Азимжон',
    successStory1Role: 'IELTS imtihon topshirgani',
    successStory2: 'Ovozli kiritish xususiyati mani talaffuz bilan yordam berdi. Endi men ingliz tilida ishonch bilan gaplashaman.',
    successStory2Name: 'Файзуллавев Акбар',
    successStory2Role: 'Biznes mutaxassisi',
    successStory3: 'Sinovdan o\'tgan eng yaxshi ta\'lim ilovalari. AI yozish bo\'yicha fikr-mulohaza juda foydali.',
    successStory3Name: 'Файзуллаев Муххаммадали',
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
    pricingTitle: 'Oddiy va shaffof narxlar',
    mostPopular: 'Eng mashhur',
    pricingFree: 'Bepul',
    pricingForever: 'Abadiy',
    pricing99: '$4.99',
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
    statsWords: 'O‘zlashtiriladigan so‘zlar',
    statsSuccess: 'Muvaffaqiyat darajasi',
    statsActive: 'O‘zbekistondagi faol ingliz tili o‘quvchilari',
    statsCefr: 'CEFR darajalari',
    problemPoint1: 'Samarasiz o‘rganish usullari',
    problemPoint2: 'Shaxsiylashtirish yetishmasligi',
    problemPoint3: 'Past motivatsiya va saqlab qolish',
    solutionPoint1: 'AI asosidagi spaced repetition',
    solutionPoint2: 'Adaptiv o‘rganish yo‘llari',
    solutionPoint3: 'Real‑time shaxsiy fikr‑mulohaza',
    product: 'Mahsulot',
    company: 'Kompaniya',
    followUs: 'Bizni kuzatib boring',
    // Pitch sections
    problemSolution: 'Muammo va Yechim',
    problemTitle: 'Muammo',
    problemDesc: 'Millionlab ingliz tilini o\'rganuvchilar samarasiz metodlar, motivatsiya etishmayligi va shaxsiy rahbarlikka ega bo\'lmasligi sababli doimiy taraqqiyot ko\'rsatishda qiynalmoqdalar.',
    solutionTitle: 'Bizning Yechim',
    solutionDesc: 'Sozlution AI-powered spaced repetition, adaptiv o\'rganish yo\'llari va real-time fikr-mulohazani birlashtirib, o\'rganuvchilarni qiziquvchan va motivalashtirilgan qiladigan shaxsiy ingliz tilini o\'zlashtirish tajribasi yaratadi.',
    ourTeam: 'Bizning Jamoamiz',
    teamLeader: 'Jamoaning rahbari va mahsulot',
    teamBackend: 'AI va Backend muhandisi',
    teamFrontend: 'Frontend razrabotchisi',
    whyUs: 'Nima uchun biz buni yecha olamiz',
    whyUsDesc: 'Bizning jamoamiz AI/ML, ta\'lim texnologiyalari va mahsulot ishlab chiqarishda tajribani birlashtirib, barcha uchun sifatli ingliz tilini ta\'lim qilinishini oson qilishni xohlaymiz.',
    roadmap: 'Bizning yo\'l xaritamiz',
    roadmapIdea: 'Fikr',
    roadmapIdeaDesc: 'Dastlabki tushuncha va bozor tadqiqoti',
    roadmapPrototype: 'Prototip',
    roadmapPrototypeDesc: 'MVP ishlab chiqish va foydalanuvchi sinovlari',
    roadmapMvp: 'MVP',
    roadmapMvpDesc: 'Ommaviy beta ishga tushirilishi',
    roadmapLaunch: 'Ishga tushirildi',
    roadmapLaunchDesc: 'To\'liq ishlab chiqarilgan mahsulotni buraxish',
    implementation: 'Qanday amalga oshiramiz',
    phase1: 'Bosqich 1: Asosiy platforma',
    phase1Desc: 'Node.js, PostgreSQL va AI model integratsiyasi (GPT-4 shaxsiy fikr-mulohaza uchun) bilan masshtabli backend infratuzilmasini qurilish',
    phase2: 'Bosqich 2: Frontend va mobil',
    phase2Desc: 'Responsive veb-app (Next.js, React) va native mobil ilovalarni (React Native) ishlab chiqish',
    phase3: 'Bosqich 3: AI xususiyatlari',
    phase3Desc: 'Ilg\'or AI o\'qituvchiligi, ovozni aniqlash va adaptiv o\'rganish algoritmlarini amalga oshirish',
    phase4: 'Bosqich 4: O\'sishi va o\'smusi',
    phase4Desc: 'Ko\'p tillik qo\'llab-quvvatlash, tahlil boshqarish paneli va jamoa xususiyatlari',
    techStack: 'Texnologiya to\'plami',
    frontend: 'Frontend',
    backend: 'Backend',
    aiTools: 'AI va ML vositalari',
    infrastructure: 'Infratuzilma',
    demo: 'Demo va Prototip',
  },
  ru: {
    tagline: 'Учите 20 новых слов каждый день',
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
    step1: 'Тест определения уровня',
    step1Desc: 'Начните с комплексной оценки, чтобы определить ваш текущий уровень владения английским языком (A1-C1).',
    step2: 'Учите ежедневные слова',
    step2Desc: 'Овладейте 5 словами в день через интерактивные уроки: перевод и использование в контексте.',
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
    successStory1Name: 'Абдухалилов Азимжон',
    successStory1Role: 'Сдавший экзамен IELTS',
    successStory2: 'Функция голосового ввода помогла мне с произношением. Теперь я уверенно говорю по-английски.',
    successStory2Name: 'Файзуллавев Акбар',
    successStory2Role: 'Бизнес-профессионал',
    successStory3: 'Лучшее приложение для обучения из всех, что я пробовал. Отзывы ИИ по письму невероятно полезны.',
    successStory3Name: 'Файзуллаев Муххаммадали',
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
    pricingTitle: 'Простые и прозрачные цены',
    mostPopular: 'Самый популярный',
    pricingFree: 'Бесплатно',
    pricingForever: 'Навсегда',
    pricing99: '$4.99',
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
    statsWords: 'Слова для освоения',
    statsSuccess: 'Уровень успеха',
    statsActive: 'Активные изучающие английский в Узбекистане',
    statsCefr: 'Уровни CEFR',
    problemPoint1: 'Неэффективные методы обучения',
    problemPoint2: 'Отсутствие персонализации',
    problemPoint3: 'Низкая вовлеченность и удержание',
    solutionPoint1: 'Spaced repetition на базе ИИ',
    solutionPoint2: 'Адаптивные траектории обучения',
    solutionPoint3: 'Персональная обратная связь в реальном времени',
    product: 'Продукт',
    company: 'Компания',
    followUs: 'Следите за нами',
    // Pitch sections
    problemSolution: 'Проблема и решение',
    problemTitle: 'Проблема',
    problemDesc: 'Миллионы изучающих английский язык испытывают трудности в поддержании стабильного прогресса из-за неэффективных методов, отсутствия мотивации и персонального руководства. Традиционные приложения для обучения используют универсальный подход без адаптации к уровню владения языком.',
    solutionTitle: 'Наше решение',
    solutionDesc: 'Sozlution объединяет интеллектуальное повторение, адаптивные пути обучения и обратную связь в реальном времени для создания персонализированного опыта освоения английского языка.',
    ourTeam: 'Наша команда',
    teamLeader: 'Лидер команды и продукт',
    teamBackend: 'Инженер AI и Backend',
    teamFrontend: 'Frontend разработчик',
    whyUs: 'Почему мы можем это решить',
    whyUsDesc: 'Наша команда сочетает опыт в области AI/ML, образовательных технологий и разработки продуктов с желанием сделать качественное образование доступным для всех.',
    roadmap: 'Наша дорожная карта',
    roadmapIdea: 'Идея',
    roadmapIdeaDesc: 'Первоначальная концепция и исследование рынка',
    roadmapPrototype: 'Прототип',
    roadmapPrototypeDesc: 'Разработка MVP и тестирование пользователями',
    roadmapMvp: 'MVP',
    roadmapMvpDesc: 'Публичный бета-запуск',
    roadmapLaunch: 'Запущено',
    roadmapLaunchDesc: 'Полный выпуск в производство',
    implementation: 'Как мы это реализуем',
    phase1: 'Этап 1: Основная платформа',
    phase1Desc: 'Создание масштабируемой инфраструктуры backend с Node.js, PostgreSQL и интеграцией AI моделей (GPT-4 для персонализированной обратной связи)',
    phase2: 'Этап 2: Frontend и мобильный',
    phase2Desc: 'Разработка адаптивного веб-приложения (Next.js, React) и нативных мобильных приложений (React Native)',
    phase3: 'Этап 3: AI функции',
    phase3Desc: 'Реализация продвинутого AI репетитора, распознавания речи и адаптивных алгоритмов обучения',
    phase4: 'Этап 4: Масштабирование и рост',
    phase4Desc: 'Поддержка нескольких языков, панель аналитики и функции сообщества',
    techStack: 'Технологический стек',
    frontend: 'Frontend',
    backend: 'Backend',
    aiTools: 'AI и ML инструменты',
    infrastructure: 'Инфраструктура',
    demo: 'Демо и прототип',
  },
}

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'uz' | 'ru'>('en')
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }
  const t = translations[language]

  const features = [
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
  ]

  const steps = [
    { step: 1, title: t.step1, desc: t.step1Desc },
    { step: 2, title: t.step2, desc: t.step2Desc },
    { step: 3, title: t.step3, desc: t.step3Desc },
    { step: 4, title: t.step4, desc: t.step4Desc },
    { step: 5, title: t.step5, desc: t.step5Desc },
    { step: 6, title: t.step6, desc: t.step6Desc },
  ]

  const testimonials = [
    {
      name: t.successStory1Name,
      role: t.successStory1Role,
      content: t.successStory1,
    },
    {
      name: t.successStory2Name,
      role: t.successStory2Role,
      content: t.successStory2,
    },
    {
      name: t.successStory3Name,
      role: t.successStory3Role,
      content: t.successStory3,
    },
  ]

  type StatItem =
    | {
        type: 'count'
        id: string
        value: number
        suffix?: string
        formatter?: (value: number) => string
        label: string
      }
    | {
        type: 'text'
        id: string
        text: string
        label: string
      }

  const stats: StatItem[] = [
    {
      type: 'count',
      id: 'words',
      value: 50000,
      suffix: '+',
      formatter: (n: number) => `${Math.max(0, Math.round(n / 1000))}K`,
      label: t.statsWords,
    },
    {
      type: 'count',
      id: 'success',
      value: 90,
      suffix: '%',
      label: t.statsSuccess,
    },
    {
      type: 'count',
      id: 'active',
      value: 10000000,
      formatter: (n: number) => `${Math.round(n / 1000000)}M`,
      label: t.statsActive,
    },
    {
      type: 'text',
      id: 'cefr',
      text: 'A1-C1',
      label: t.statsCefr,
    },
  ]

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
            <div className="hidden md:flex items-center gap-6 text-sm">
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-foreground hover:text-primary transition">
                {t.features}
              </button>
              <button onClick={() => document.getElementById('problem-solution')?.scrollIntoView({ behavior: 'smooth' })} className="text-foreground hover:text-primary transition">
                {t.problemSolution}
              </button>
              <button onClick={() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' })} className="text-foreground hover:text-primary transition">
                {t.ourTeam}
              </button>
              <button onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })} className="text-foreground hover:text-primary transition">
                {t.roadmap}
              </button>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-foreground hover:text-primary transition">
                {t.pricing}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
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
            <div className="relative h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-primary/5 rounded-3xl"></div>
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
            {stats.map((item) => (
              <div key={item.id} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-3">
                  {item.type === 'count' ? (
                    <CountUp
                      value={item.value ?? 0}
                      suffix={item.suffix}
                      formatter={item.formatter}
                    />
                  ) : (
                    item.text
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {item.label}
                </p>
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
            {features.map((feature, idx) => {
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

      {/* Problem & Solution Section */}
      <section id="problem-solution" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              {t.problemSolution}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Problem */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 lg:p-12">
              <h3 className="text-3xl font-bold text-foreground mb-6">{t.problemTitle}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">{t.problemDesc}</p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 mt-1">
                    •
                  </div>
                  <p className="text-muted-foreground">{t.problemPoint1}</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 mt-1">
                    •
                  </div>
                  <p className="text-muted-foreground">{t.problemPoint2}</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 mt-1">
                    •
                  </div>
                  <p className="text-muted-foreground">{t.problemPoint3}</p>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-8 lg:p-12">
              <h3 className="text-3xl font-bold text-foreground mb-6">{t.solutionTitle}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">{t.solutionDesc}</p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <p className="text-muted-foreground">{t.solutionPoint1}</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <p className="text-muted-foreground">{t.solutionPoint2}</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <p className="text-muted-foreground">{t.solutionPoint3}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              {t.howItWorksTitle}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t.howItWorksDesc}
            </p>
          </div>

          {/* Timeline Container */}
          <div className="relative">
            {/* Vertical line for desktop (hidden on mobile) */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-accent to-primary opacity-30"></div>

            {/* Timeline Items */}
            <div className="space-y-12 lg:space-y-16">
              {steps.map((item, idx) => {
                const colors = ['from-pink-500 to-pink-600', 'from-cyan-500 to-cyan-600', 'from-yellow-500 to-yellow-600', 'from-purple-500 to-purple-600', 'from-orange-500 to-orange-600', 'from-indigo-500 to-indigo-600'];
                const borderColors = ['border-pink-500', 'border-cyan-500', 'border-yellow-500', 'border-purple-500', 'border-orange-500', 'border-indigo-500'];
                const circleColors = ['bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-purple-500', 'bg-orange-500', 'bg-indigo-500'];
                const isLeft = idx % 2 === 0;

                return (
                  <div key={idx} className="timeline-item">
                    <div className={`flex ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-4 lg:gap-12`}>
                      {/* Card Content */}
                      <div className="w-full lg:w-1/2">
                        <div className={`bg-card border-2 ${borderColors[idx]} rounded-2xl p-6 lg:p-8 hover:shadow-lg transition-all`}>
                          <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                          <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{item.desc}</p>
                        </div>
                      </div>

                      {/* Center Circle */}
                      <div className="hidden lg:flex justify-center items-center z-10">
                        <div className={`w-16 h-16 rounded-full ${circleColors[idx]} text-white font-bold text-xl flex items-center justify-center shadow-lg border-4 border-background relative`}>
                          {item.step}
                        </div>
                      </div>

                      {/* Spacer for desktop */}
                      <div className="hidden lg:block w-1/2"></div>
                    </div>

                    {/* Mobile Step Number */}
                    <div className="flex lg:hidden items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full ${circleColors[idx]} text-white font-bold text-lg flex items-center justify-center`}>
                        {item.step}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 sm:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              {t.ourTeam}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { role: t.teamLeader, skills: ['Product Strategy', 'Business Development', 'User Research'], color: 'from-cyan-500' },
              { role: t.teamBackend, skills: ['Python, Node.js', 'AI/ML Models', 'System Architecture'], color: 'from-purple-500' },
              { role: t.teamFrontend, skills: ['React, Next.js', 'UI/UX Design', 'Web Performance'], color: 'from-pink-500' },
            ].map((member, idx) => (
              <div key={idx} className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${member.color} to-transparent mb-6`}></div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{member.role}</h3>
                <div className="space-y-2">
                  {member.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <p className="text-muted-foreground">{skill}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              {t.whyUs}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t.whyUsDesc}
            </p>
          </div>
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-cyan-400 mb-3">3+</h3>
                <p className="text-muted-foreground">Years combined experience</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-400 mb-3">1K+</h3>
                <p className="text-muted-foreground">Users impacted globally</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-pink-400 mb-3">3</h3>
                <p className="text-muted-foreground">Complementary expertise</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 sm:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              {t.roadmap}
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: t.roadmapIdea, desc: t.roadmapIdeaDesc, status: 'complete', num: '1' },
              { title: t.roadmapPrototype, desc: t.roadmapPrototypeDesc, status: 'complete', num: '2' },
              { title: t.roadmapMvp, desc: t.roadmapMvpDesc, status: 'in-progress', num: '3' },
              { title: t.roadmapLaunch, desc: t.roadmapLaunchDesc, status: 'upcoming', num: '4' },
            ].map((item, idx) => (
              <div key={idx} className={`relative p-6 rounded-2xl border-2 ${
                item.status === 'complete' ? 'border-cyan-500/50 bg-cyan-500/5' :
                item.status === 'in-progress' ? 'border-purple-500/50 bg-purple-500/5' :
                'border-border bg-card'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 ${
                  item.status === 'complete' ? 'bg-cyan-500 text-background' :
                  item.status === 'in-progress' ? 'bg-purple-500 text-background' :
                  'bg-card border border-border text-foreground'
                }`}>
                  {item.num}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Section */}
      <section id="implementation" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
              {t.implementation}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              { title: t.phase1, desc: t.phase1Desc, color: 'cyan' },
              { title: t.phase2, desc: t.phase2Desc, color: 'purple' },
              { title: t.phase3, desc: t.phase3Desc, color: 'pink' },
              { title: t.phase4, desc: t.phase4Desc, color: 'orange' },
            ].map((phase, idx) => (
              <div key={idx} className={`bg-${phase.color}-500/10 border border-${phase.color}-500/30 rounded-2xl p-8`}>
                <div className={`inline-block px-4 py-2 rounded-lg bg-${phase.color}-500/20 text-${phase.color}-400 font-semibold mb-4`}>
                  Phase {idx + 1}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{phase.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{phase.desc}</p>
              </div>
            ))}
          </div>

          {/* Tech Stack */}
          <div className="bg-secondary/30 rounded-2xl p-12 border border-border">
            <h3 className="text-3xl font-bold text-foreground mb-12">{t.techStack}</h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-4">{t.frontend}</h4>
                <ul className="space-y-2">
                  {['React', 'Next.js', 'Tailwind CSS', 'TypeScript'].map((tech, i) => (
                    <li key={i} className="text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-purple-400 mb-4">{t.backend}</h4>
                <ul className="space-y-2">
                  {['Node.js', 'PostgreSQL', 'Redis', 'Docker'].map((tech, i) => (
                    <li key={i} className="text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-pink-400 mb-4">{t.aiTools}</h4>
                <ul className="space-y-2">
                  {['GPT-4', 'Python', 'TensorFlow', 'OpenAI API'].map((tech, i) => (
                    <li key={i} className="text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-orange-400 mb-4">{t.infrastructure}</h4>
                <ul className="space-y-2">
                  {['AWS/Vercel', 'GitHub', 'CI/CD', 'Monitoring'].map((tech, i) => (
                    <li key={i} className="text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t.studentSuccessStories}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.realLearners}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-primary">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t.pricingTitle}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'uz' ? 'Bepul boshlang, istalgan vaqtda yangilanish. Yashirin to\'lov yo\'q.' : language === 'ru' ? 'Начните бесплатно, обновляйте в любое время. Нет скрытых платежей.' : 'Start free, upgrade anytime. No hidden fees.'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              {
                title: t.pricing1,
                subtitle: t.pricingSubtitle1,
                price: t.pricingFree,
                period: t.pricingForever,
                features: ['20 words daily', 'Spaced repetition', '1 mock test/day', 'Progress tracking'],
              },
              {
                title: t.pricing2,
                subtitle: t.pricingSubtitle2,
                price: t.pricing99,
                period: t.pricingMonth,
                features: ['Everything in Classic', 'AI Writing feedback', 'AI Speaking analysis', 'Unlimited tests'],
                popular: true,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`bg-card rounded-xl p-8 ${
                  plan.popular ? 'border-2 border-primary shadow-lg relative' : 'border border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      {t.mostPopular}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.title}</h3>
                <p className="text-muted-foreground mb-6">{plan.subtitle}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <Button
                  className={`w-full mb-8 ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90'
                      : 'border-primary text-primary hover:bg-primary/10 bg-transparent'
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.popular ? (language === 'uz' ? 'Bepul sinab ko\'ring' : language === 'ru' ? 'Начать бесплатную пробную версию' : 'Start Free Trial') : t.startFree}
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-primary-foreground/90">
            {t.readyToMaster}
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/70 max-w-2xl mx-auto">
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
      <section id="contact" className="py-20 sm:py-32 bg-secondary/30">
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
              <p className="text-muted-foreground">+998 88 078 34 04</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
              <Send className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{t.contactTelegram}</h3>
              <a
                className="text-muted-foreground hover:text-foreground transition"
                href="https://t.me/sozlution_support"
                target="_blank"
                rel="noreferrer"
              >
                @sozlution_support
              </a>
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
      <footer id="about" className="bg-card border-t border-border py-12">
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

      {/* AI Chatbot */}
      <AIChatbot language={language} />
    </div>
  )
}
