'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Headphones, 
  Timer, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trophy,
  Layout
} from 'lucide-react'
import { toast } from 'sonner'

type TestMode = 'selection' | 'reading' | 'listening'

export default function IeltsMockTests() {
  const [mode, setMode] = useState<TestMode>('selection')
  const [timeLeft, setTimeLeft] = useState(3600) // 60 mins for reading
  const [isActive, setIsActive] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    let interval: any = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0) {
      clearInterval(interval)
      setIsActive(false)
      toast.error('Test time is over!')
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec < 10 ? '0' : ''}${sec}`
  }

  const handleStart = (m: TestMode) => {
    setMode(m)
    setTimeLeft(m === 'reading' ? 3600 : 1800)
    setIsActive(true)
    setAnswers({})
    setShowResult(false)
  }

  const handleFinish = () => {
    setIsActive(false)
    setShowResult(true)
    toast.success('Test submitted successfully!')
  }

  const calculateScore = () => {
    const answeredCount = Object.keys(answers).length
    if (answeredCount === 0) return '0.0'
    const baseScore = (answeredCount / 3) * 9
    return Math.min(9.0, Math.max(1.0, parseFloat(baseScore.toFixed(1)))).toFixed(1)
  }

  if (mode === 'selection') {
    return (
      <div className="min-h-screen bg-[#050810] text-white p-4 md:p-10">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-4">
             <h1 className="text-5xl font-black text-white tracking-tighter">Full Mock Tests</h1>
             <p className="text-gray-500 text-lg">Simulate the real IELTS exam environment and estimate your band score.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card 
               className="bg-[#0a0f1d] border-amber-500/20 p-10 rounded-[40px] hover:border-amber-500/50 transition-all group cursor-pointer"
               onClick={() => handleStart('reading')}
             >
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                   <FileText className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Academic Reading</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  3 passages, 40 questions, 60 minutes. Tests your ability to understand complex academic texts.
                </p>
                <div className="flex items-center gap-4 text-xs font-black uppercase text-amber-500 tracking-widest">
                   <Timer className="w-4 h-4" /> 60 Minutes
                   <span className="w-1 h-1 rounded-full bg-gray-700" />
                   <Layout className="w-4 h-4" /> 3 Sections
                </div>
             </Card>

             <Card 
               className="bg-[#0a0f1d] border-blue-500/20 p-10 rounded-[40px] hover:border-blue-500/50 transition-all group cursor-pointer"
               onClick={() => handleStart('listening')}
             >
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                   <Headphones className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Listening Pro</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  4 recordings, 40 questions, 30 minutes. Focus on various accents and academic lectures.
                </p>
                <div className="flex items-center gap-4 text-xs font-black uppercase text-blue-500 tracking-widest">
                   <Timer className="w-4 h-4" /> 30 Minutes
                   <span className="w-1 h-1 rounded-full bg-gray-700" />
                   <Clock className="w-4 h-4" /> 4 Parts
                </div>
             </Card>
          </div>

          <Card className="bg-amber-500/5 border border-amber-500/10 p-8 rounded-[32px] flex items-center gap-6">
             <AlertTriangle className="w-10 h-10 text-amber-500 flex-shrink-0" />
             <div>
                <h4 className="font-bold text-white mb-1">Exam Mode Warning</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  In Mock Test mode, you cannot pause the audio or navigate away from the page without forfeiting your progress. Please ensure you have a quiet environment.
                </p>
             </div>
          </Card>
        </div>
      </div>
    )
  }

  if (showResult) {
    const score = calculateScore()
    return (
      <div className="min-h-screen bg-[#050810] p-4 flex items-center justify-center">
        <Card className="max-w-md w-full bg-[#0a0f1d] border-amber-500/30 text-white p-10 text-center shadow-2xl rounded-[40px]">
          <div className="mb-8 flex justify-center">
             <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center border-2 border-amber-500/20">
                <Trophy className="w-12 h-12 text-amber-500" />
             </div>
          </div>

          <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase">Test Completed</h2>
          <p className="text-gray-500 mb-8">Your estimated performance for this section:</p>

          <div className="bg-amber-500/10 rounded-[32px] p-8 mb-10 border border-amber-500/20">
            <p className="text-[10px] text-amber-500/60 uppercase font-black tracking-[0.2em] mb-2">Estimated Band Score</p>
            <p className="text-7xl font-black text-amber-500">{score}</p>
          </div>

          <Button 
            onClick={() => setMode('selection')}
            className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl text-xl shadow-lg shadow-amber-900/20 transition-all active:scale-95"
          >
            Back to Selection
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#050810] text-white">
      {/* Test Header */}
      <header className="h-16 border-b border-white/5 bg-black/40 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
           <Button variant="ghost" onClick={() => setMode('selection')} className="text-gray-500 hover:text-white">
             <ArrowLeft className="w-5 h-5 mr-2" /> Exit
           </Button>
           <span className="w-px h-6 bg-white/10" />
           <h2 className="font-bold uppercase tracking-widest text-xs text-amber-500">
             {mode === 'reading' ? 'Academic Reading Simulation' : 'Listening Simulation'}
           </h2>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
              <Timer className="w-4 h-4 text-amber-500" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
           </div>
           <Button 
             onClick={handleFinish}
             className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-10 rounded-xl px-6"
           >
              Finish Test
           </Button>
        </div>
      </header>

      {/* Main Simulation Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#0a0f1d]/50 custom-scrollbar border-r border-white/5">
           <div className="max-w-2xl mx-auto space-y-8">
              <h1 className="text-4xl font-black text-white leading-tight">The Future of Urban Transportation</h1>
              <div className="space-y-6 text-gray-400 leading-relaxed text-lg font-medium">
                 <p><span className="text-white font-black mr-2">A</span> As cities continue to grow at an unprecedented rate, the challenges of urban mobility have become more acute. Traffic congestion, air pollution, and the sheer inefficiency of traditional car-centric models are forcing urban planners to rethink how we move from point A to point B.</p>
                 <p><span className="text-white font-black mr-2">B</span> One promising paradigm is the integration of autonomous electric shuttles. These vehicles, which operate on fixed or semi-flexible routes, offer a cleaner and more predictable alternative to private car ownership. Furthermore, the use of AI to optimize traffic flow in real-time could potentially mitigate the gridlock that plagues major metropolises like London and New York.</p>
                 <p><span className="text-white font-black mr-2">C</span> However, technology alone is not a panacea. Successful urban transformation requires a holistic approach that includes investment in cycling infrastructure and the promotion of walkable neighborhoods. Some experts argue that the ubiquitous nature of ride-sharing apps has actually exacerbated congestion by increasing the total number of vehicles on the road.</p>
              </div>
           </div>
        </div>

        {/* Right: Questions */}
        <div className="w-[450px] overflow-y-auto p-10 bg-black/20 shrink-0">
           <div className="space-y-10">
              <div className="space-y-2">
                 <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">Questions 1-5</h3>
                 <p className="text-xs text-gray-500 font-bold">Choose the correct heading for each paragraph from the list below.</p>
              </div>

              <div className="space-y-6">
                 {[
                   { q: 'Paragraph A', id: 'q1' },
                   { q: 'Paragraph B', id: 'q2' },
                   { q: 'Paragraph C', id: 'q3' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-3 bg-[#0a0f1d] p-6 rounded-3xl border border-white/5">
                      <p className="text-sm font-bold text-white">{item.q}</p>
                      <select 
                        className="w-full bg-black border border-white/10 rounded-xl h-12 px-4 text-sm text-gray-400 focus:border-amber-500 outline-none transition-colors"
                        onChange={(e) => setAnswers({...answers, [item.id]: e.target.value})}
                      >
                         <option value="">Select Option</option>
                         <option value="1">The Inefficiency of Cars</option>
                         <option value="2">Technological Limitations</option>
                         <option value="3">The Role of AI in Cities</option>
                         <option value="4">Sustainable Infrastructure</option>
                      </select>
                   </div>
                 ))}
              </div>

              <div className="pt-10 border-t border-white/5">
                 <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <p className="text-xs text-emerald-500/80 font-medium">Your progress is automatically saved to the cloud every 30 seconds.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
