'use client'

import React, { useState, useEffect } from 'react'
import { useApp } from '@/context/app-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Volume2, 
  RotateCw, 
  BookOpen, 
  CheckCircle2, 
  Trophy,
  ArrowRight,
  BrainCircuit,
  XCircle,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { getMvpLang, mvpText } from '@/lib/mvp-i18n'

interface IeltsWord {
  id: string
  en: string
  ru: string
  uz: string
  definition: string
  transcription: string
  topic: string
  example: string
}

interface TestQuestion {
  id: number
  text: string
  options: string[]
  correctIndex: number
}

const IELTS_VOCAB_LIST: IeltsWord[] = [
  { id: '1', en: 'Mitigate', ru: 'Смягчать', uz: 'Kamaytirmoq', definition: 'To make something bad less severe or serious.', transcription: 'ˈmɪtɪɡeɪt', topic: 'Environment', example: 'Governments must mitigate the effects of climate change.' },
  { id: '2', en: 'Ubiquitous', ru: 'Вездесущий', uz: 'Hamma joyda mavjud', definition: 'Present, appearing, or found everywhere.', transcription: 'juːˈbɪkwɪtəs', topic: 'Technology', example: 'Digital devices have become ubiquitous in daily life.' },
  { id: '3', en: 'Paradigm', ru: 'Парадигма', uz: 'Paradigma', definition: 'A typical example or pattern of something.', transcription: 'ˈpærədaɪm', topic: 'Science', example: 'This research represents a new paradigm in education.' },
  { id: '4', en: 'Exacerbate', ru: 'Усугублять', uz: 'Yomonlashtirmoq', definition: 'To make a problem or bad situation worse.', transcription: 'ɪɡˈzæsəbeɪt', topic: 'Social Issues', example: 'The tax increase will exacerbate the poverty gap.' },
  { id: '5', en: 'Pragmatic', ru: 'Прагматичный', uz: 'Pragmatik', definition: 'Dealing with things sensibly and realistically.', transcription: 'præɡˈmætɪk', topic: 'Business', example: 'We need a pragmatic solution to the budget problem.' },
  { id: '6', en: 'Advocate', ru: 'Выступать за', uz: 'Targ‘ib qilmoq', definition: 'To publicly recommend or support.', transcription: 'ˈædvəkeɪt', topic: 'Politics', example: 'Many doctors advocate for a healthier lifestyle.' },
  { id: '7', en: 'Acknowledge', ru: 'Признавать', uz: 'Tan olmoq', definition: 'Accept or admit the existence or truth of.', transcription: 'əkˈnɒlɪdʒ', topic: 'Communication', example: 'He failed to acknowledge the importance of teamwork.' },
  { id: '8', en: 'Acquire', ru: 'Приобретать', uz: 'Egallamoq', definition: 'Buy or obtain for oneself.', transcription: 'əˈkwaɪə(r)', topic: 'Education', example: 'Students acquire new skills through constant practice.' },
  { id: '9', en: 'Allocate', ru: 'Выделять', uz: 'Ajratmoq', definition: 'Distribute resources for a particular purpose.', transcription: 'ˈæləkeɪt', topic: 'Economics', example: 'The company will allocate funds for infrastructure.' },
  { id: '10', en: 'Ambiguous', ru: 'Двусмысленный', uz: 'Noaniq', definition: 'Open to more than one interpretation.', transcription: 'æmˈbɪɡjuəs', topic: 'Language', example: 'The instructions in the test were somewhat ambiguous.' },
  { id: '11', en: 'Coherent', ru: 'Связный', uz: 'Mantiqiy bog‘langan', definition: 'Logical and consistent.', transcription: 'kəʊˈhɪərənt', topic: 'Writing', example: 'Your essay must be coherent and well-structured.' },
  { id: '12', en: 'Compelling', ru: 'Убедительный', uz: 'Ishonarli', definition: 'Evoking interest or admiration in a powerful way.', transcription: 'kəmˈpelɪŋ', topic: 'Communication', example: 'She made a compelling argument for legal reform.' },
  { id: '13', en: 'Comprehensive', ru: 'Всесторонний', uz: 'Keng qamrovli', definition: 'Including all or nearly all elements or aspects.', transcription: 'ˌkɒmprɪˈhensɪv', topic: 'Education', example: 'The book offers a comprehensive guide to history.' },
  { id: '14', en: 'Crucial', ru: 'Критически важный', uz: 'O‘ta muhim', definition: 'Decisive or critical, especially in the success or failure of something.', transcription: 'ˈkruːʃl', topic: 'Success', example: 'Vitamins play a crucial role in our health.' },
  { id: '15', en: 'Depict', ru: 'Изображать', uz: 'Tasvirlamoq', definition: 'Represent by a drawing, painting, or other art form.', transcription: 'dɪˈpɪkt', topic: 'Art/Media', example: 'The film depicts the life of a famous musician.' },
  { id: '16', en: 'Deteriorate', ru: 'Ухудшаться', uz: 'Yomonlashmoq', definition: 'Become progressively worse.', transcription: 'dɪ\u02c8t\u026a\u0259ri\u0259re\u026at', topic: 'Health', example: 'The patient\'s condition began to deteriorate rapidly.' },
  { id: '17', en: 'Diverse', ru: 'Разнообразный', uz: 'Turli xil', definition: 'Showing a great deal of variety; very different.', transcription: 'da\u026av\u025c\u02d0s', topic: 'Culture', example: 'London has a very diverse population.' },
  { id: '18', en: 'Emphasis', ru: 'Акцент', uz: 'Urg\u02bbv berish', definition: 'Special importance, value, or prominence given to something.', transcription: '\u02c8emf\u0259s\u026as', topic: 'Communication', example: 'The course puts emphasis on practical skills.' },
  { id: '19', en: 'Feasible', ru: 'Осуществимый', uz: 'Amalga oshirsa bo\u02bblladigan', definition: 'Possible to do easily or conveniently.', transcription: '\u02c8fi\u02d0z\u0259bl', topic: 'Planning', example: 'It is not feasible to build a bridge here.' },
  { id: '20', en: 'Hinder', ru: 'Препятствовать', uz: 'To\u02bbssqinlik qilmoq', definition: 'Make it difficult for someone to do something.', transcription: '\u02c8h\u026and\u0259(r)', topic: 'Progress', example: 'Strict regulations might hinder economic growth.' }
]

const TEST_QUESTIONS: TestQuestion[] = [
  { id: 1, text: "The new policy was designed to ___ the negative effects of the crisis.", options: ["mitigate", "hinder", "depict", "acquire"], correctIndex: 0 },
  { id: 2, text: "Smartphones are now ___ in almost every part of the world.", options: ["diverse", "ubiquitous", "ambiguous", "coherent"], correctIndex: 1 },
  { id: 3, text: "We need a ___ shift in how we approach environmental protection.", options: ["paradigm", "emphasis", "advocate", "feasible"], correctIndex: 0 },
  { id: 4, text: "Adding fuel to the fire will only ___ the situation.", options: ["allocate", "exacerbate", "acknowledge", "mitigate"], correctIndex: 1 },
  { id: 5, text: "Let's be ___ and focus on what we can actually achieve today.", options: ["ambiguous", "pragmatic", "compelling", "coherent"], correctIndex: 1 },
  { id: 6, text: "She is a strong ___ for human rights in her country.", options: ["emphasis", "advocate", "depict", "acquire"], correctIndex: 1 },
  { id: 7, text: "It is important to ___ the contributions of every team member.", options: ["hinder", "acknowledge", "allocate", "exacerbate"], correctIndex: 1 },
  { id: 8, text: "He managed to ___ a wealth of knowledge during his studies.", options: ["acquire", "depict", "hinder", "mitigate"], correctIndex: 0 },
  { id: 9, text: "The government decided to ___ more resources to healthcare.", options: ["allocate", "exacerbate", "ambiguous", "diverse"], correctIndex: 0 },
  { id: 10, text: "His answer was too ___, leaving us confused about his true intentions.", options: ["coherent", "comprehensive", "ambiguous", "crucial"], correctIndex: 2 },
  { id: 11, text: "A ___ argument is necessary to convince the board of directors.", options: ["compelling", "deteriorate", "hinder", "feasible"], correctIndex: 0 },
  { id: 12, text: "The report provides a ___ analysis of the current market trends.", options: ["comprehensive", "ambiguous", "diverse", "pragmatic"], correctIndex: 0 },
  { id: 13, text: "Clear communication is ___ for the success of any project.", options: ["crucial", "feasible", "deteriorate", "allocate"], correctIndex: 0 },
  { id: 14, text: "The artist tried to ___ the beauty of the landscape in her painting.", options: ["depict", "mitigate", "hinder", "acquire"], correctIndex: 0 },
  { id: 15, text: "If we don't act now, the situation will ___ further.", options: ["deteriorate", "acknowledge", "allocate", "diverse"], correctIndex: 0 },
  { id: 16, text: "The school has a very ___ student body from 50 different countries.", options: ["diverse", "coherent", "ambiguous", "crucial"], correctIndex: 0 },
  { id: 17, text: "There is a strong ___ on teamwork in this company.", options: ["emphasis", "advocate", "paradigm", "mitigate"], correctIndex: 0 },
  { id: 18, text: "Building a city on Mars is not ___ with our current technology.", options: ["feasible", "ubiquitous", "comprehensive", "coherent"], correctIndex: 0 },
  { id: 19, text: "Heavy rain can ___ the progress of the construction work.", options: ["hinder", "acknowledge", "acquire", "depict"], correctIndex: 0 },
  { id: 20, text: "The candidate's speech was ___, making it easy for everyone to understand her vision.", options: ["coherent", "exacerbate", "ambiguous", "deteriorate"], correctIndex: 0 }
]

export default function IeltsVocabulary() {
  const { user } = useApp()
  const t = mvpText[getMvpLang(user?.lang)].ielts
  const [mode, setMode] = useState<'study' | 'test' | 'result'>('study')
  const [learnIndex, setLearnIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  
  // Test states
  const [testIndex, setTestIndex] = useState(0)
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({})
  const [testScore, setTestScore] = useState(0)

  const active = IELTS_VOCAB_LIST[learnIndex]
  const currentQuestion = TEST_QUESTIONS[testIndex]

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const enVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
        if (enVoice) {
          utterance.voice = enVoice;
        }
      }

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  }

  const handleNextWord = () => {
    if (learnIndex < IELTS_VOCAB_LIST.length - 1) {
      setLearnIndex(prev => prev + 1)
      setFlipped(false)
    } else {
      setMode('test')
    }
  }

  const handleTestSelect = (optionIndex: number) => {
    setTestAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }))
  }

  const handleTestNext = () => {
    if (testIndex < TEST_QUESTIONS.length - 1) {
      setTestIndex(prev => prev + 1)
    } else {
      // Calculate final score
      let score = 0
      TEST_QUESTIONS.forEach(q => {
        if (testAnswers[q.id] === q.correctIndex) score++
      })
      setTestScore(score)
      setMode('result')
    }
  }

  // --- STUDY MODE UI ---
  if (mode === 'study') {
    const progress = ((learnIndex + 1) / IELTS_VOCAB_LIST.length) * 100
    return (
      <div className="min-h-screen bg-[#050810] text-white p-4 md:p-10">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-black text-amber-500 flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                {t.academicVocab}
              </h1>
              <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 text-amber-400 font-bold text-sm">
                {t.studyPhase}
              </div>
            </div>
            <Progress value={progress} className="h-2 bg-slate-900 border border-white/5" />
          </div>

          <div 
            className="perspective-1000 relative h-[420px] w-full cursor-pointer group"
            onClick={() => {
              setFlipped(!flipped)
              if (!flipped) speak(active.en)
            }}
          >
            <div className={`relative h-full w-full transition-all duration-700 preserve-3d shadow-2xl rounded-[40px] ${flipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
              {/* Front */}
              <Card className="absolute inset-0 backface-hidden bg-[#0a0f1d] border-2 border-amber-500/20 flex flex-col items-center justify-center p-10 rounded-[40px]" style={{ backfaceVisibility: 'hidden' }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(active.en);
                  }}
                  className="absolute right-8 top-8 p-4 rounded-2xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all duration-300 z-50"
                  aria-label="Listen"
                >
                  <Volume2 className="h-6 w-6" />
                </button>
                <div className="mb-4 px-4 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase">{active.topic}</div>
                <h2 className="text-6xl font-black text-white text-center mb-8">{active.en}</h2>
                <div className="w-full bg-white/5 rounded-3xl p-6 text-center border border-white/5 italic text-gray-400">&quot;{active.definition}&quot;</div>
              </Card>
              {/* Back */}
              <Card className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0a0f1d] border-2 border-blue-500/20 flex flex-col items-center justify-center p-10 rounded-[40px]" style={{ backfaceVisibility: 'hidden' }}>
                <h2 className="text-4xl font-black text-blue-400 mb-2">{getMvpLang(user?.lang) === 'ru' ? active.ru : active.uz}</h2>
                <div className="bg-blue-500/10 px-5 py-2 rounded-full border border-blue-500/20 mb-8 text-blue-300 font-mono">/{active.transcription}/</div>
                <div className="bg-black/40 rounded-3xl p-6 border border-white/5 italic text-gray-300 text-sm text-center leading-relaxed">{active.example}</div>
              </Card>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => { if (learnIndex > 0) { setLearnIndex(i => i - 1); setFlipped(false) } }} disabled={learnIndex === 0} className="flex-1 h-16 rounded-2xl border-white/5">{t.previous}</Button>
            <Button onClick={handleNextWord} className="flex-[2] bg-amber-500 hover:bg-amber-600 text-black h-16 rounded-2xl text-lg font-black">{learnIndex < IELTS_VOCAB_LIST.length - 1 ? t.nextWord : t.startTest}</Button>
          </div>
        </div>
      </div>
    )
  }

  // --- TEST MODE UI ---
  if (mode === 'test') {
    const progress = ((testIndex + 1) / TEST_QUESTIONS.length) * 100
    const isAnswered = testAnswers[currentQuestion.id] !== undefined

    return (
      <div className="min-h-screen bg-[#050810] text-white p-4 md:p-10">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h1 className="text-3xl font-black text-blue-500 flex items-center gap-3"><BrainCircuit className="w-8 h-8" /> {t.vocabTest}</h1>
              <span className="text-blue-500 font-black text-xl">{testIndex + 1} / {TEST_QUESTIONS.length}</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-slate-900" />
          </div>

          <Card className="bg-[#0a0f1d] border-white/5 p-8 md:p-14 rounded-[48px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center text-gray-200 leading-relaxed">{currentQuestion.text}</h2>
            <div className="grid gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button key={idx} onClick={() => handleTestSelect(idx)} className={`w-full p-6 rounded-3xl text-left border-2 transition-all ${testAnswers[currentQuestion.id] === idx ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/5 bg-black/20 text-gray-400 hover:bg-white/5'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-black ${testAnswers[currentQuestion.id] === idx ? 'border-blue-500 bg-blue-500 text-black' : 'border-slate-800'}`}>{String.fromCharCode(65 + idx)}</div>
                    {option}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Button onClick={handleTestNext} disabled={!isAnswered} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xl shadow-lg shadow-blue-900/20">{testIndex < TEST_QUESTIONS.length - 1 ? t.nextQuestion : t.finishTest}</Button>
        </div>
      </div>
    )
  }

  // --- RESULT MODE UI ---
  return (
    <div className="min-h-screen bg-[#050810] p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full bg-[#0a0f1d] border-amber-500/30 text-white p-10 text-center shadow-2xl rounded-[40px]">
        <div className="mb-8 flex justify-center"><div className="relative"><Trophy className="w-24 h-24 text-yellow-400" /><Sparkles className="absolute -top-2 -right-2 w-10 h-10 text-amber-400 animate-pulse" /></div></div>
        <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">{t.dailySetComplete}</h2>
        <p className="text-gray-500 mb-8 text-lg">{t.masteredFeedback(20)}</p>
        <div className="bg-amber-500/10 rounded-[32px] p-8 mb-10 border border-amber-500/20">
          <p className="text-[10px] text-amber-500/60 uppercase font-black tracking-[0.2em] mb-2">{t.testAccuracy}</p>
          <p className="text-7xl font-black text-amber-500">{Math.round((testScore/TEST_QUESTIONS.length)*100)}%</p>
          <p className="text-amber-400/60 mt-2 font-bold">{t.outOfCorrect(testScore, TEST_QUESTIONS.length)}</p>
        </div>

        {/* Answer Review Section */}
        <div className="text-left mb-10 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border-t border-b border-white/5 py-6">
          {TEST_QUESTIONS.map((q, idx) => {
            const isCorrect = testAnswers[q.id] === q.correctIndex
            return (
              <div key={q.id} className={`p-4 rounded-3xl border ${isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" /> : <XCircle className="w-5 h-5 text-red-500 mt-1" />}
                  <div>
                    <p className="font-bold text-gray-200 text-sm">{q.text.replace('___', IELTS_VOCAB_LIST[q.id-1].en)}</p>
                    <p className={`text-xs mt-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>{t.yourAnswer} {q.options[testAnswers[q.id]]}</p>
                    {!isCorrect && <p className="text-emerald-400 font-bold text-xs">{t.correct} {q.options[q.correctIndex]}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Button onClick={() => window.location.reload()} className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl text-xl shadow-lg shadow-amber-900/20">{t.restartDaily}</Button>
      </Card>
    </div>
  )
}
