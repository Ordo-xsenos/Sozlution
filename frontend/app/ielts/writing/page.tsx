'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  PenTool, 
  Timer, 
  Type, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3,
  ChevronRight,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'

interface WritingTask {
  id: string
  title: string
  prompt: string
  minWords: number
  timeLimit: number // minutes
}

const mockTasks: Record<string, WritingTask> = {
  task1: {
    id: 't1',
    title: 'Task 1: Data Description',
    prompt: 'The chart below shows the changes in global food prices between 2004 and 2011. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    minWords: 150,
    timeLimit: 20
  },
  task2: {
    id: 't2',
    title: 'Task 2: Discursive Essay',
    prompt: 'Some people think that sense of competition in children should be encouraged. Others believe that children who are taught to co-operate rather than compete become more useful adults. Discuss both these views and give your own opinion.',
    minWords: 250,
    timeLimit: 40
  }
}

export default function IeltsWriting() {
  const [activeTask, setActiveTask] = useState<'task1' | 'task2'>('task1')
  const [text, setText] = useState('')
  const [timeLeft, setTimeLimit] = useState(mockTasks.task1.timeLimit * 60)
  const [isActive, setIsActive] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const task = mockTasks[activeTask]
  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(w => w.length > 0).length,
    [text]
  )

  useEffect(() => {
    if (!isActive) return

    const interval = window.setInterval(() => {
      setTimeLimit((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          setIsActive(false)
          toast.error('Time is up!')
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isActive])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleTabChange = (val: string) => {
    const t = val as 'task1' | 'task2'
    setActiveTask(t)
    setText('')
    setTimeLimit(mockTasks[t].timeLimit * 60)
    setIsActive(false)
    setShowReport(false)
  }

  const handleSubmit = () => {
    if (wordCount < task.minWords) {
      toast.warning(`You need at least ${task.minWords} words before submission.`)
      return
    }
    setIsActive(false)
    setShowReport(true)
    toast.success('Essay submitted for AI evaluation!')
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h1 className="text-3xl font-black text-amber-500 flex items-center gap-3">
            <PenTool className="w-8 h-8" />
            Writing Practice
          </h1>
          
          <div className="flex items-center gap-4 bg-[#0a0f1d] p-2 rounded-2xl border border-white/5 shadow-xl">
             <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-amber-500/20">
                <Timer className={`w-5 h-5 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
                <span className="font-mono text-xl font-bold tracking-tighter w-16">{formatTime(timeLeft)}</span>
             </div>
             <Button 
               onClick={() => setIsActive(!isActive)}
               variant={isActive ? "destructive" : "default"}
               className={isActive ? "" : "bg-amber-500 hover:bg-amber-600 text-black font-bold"}
             >
               {isActive ? 'Pause' : 'Start Timer'}
             </Button>
             {isActive && (
               <Button 
                 onClick={handleSubmit}
                 className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
               >
                 Finish Now
               </Button>
             )}
          </div>
        </div>

        <Tabs defaultValue="task1" onValueChange={handleTabChange} className="w-full">
          <TabsList className="bg-[#0a0f1d] border border-white/5 p-1 h-14 rounded-2xl w-full md:w-auto">
            <TabsTrigger value="task1" className="rounded-xl px-8 data-[state=active]:bg-amber-500 data-[state=active]:text-black font-bold">
              Task 1
            </TabsTrigger>
            <TabsTrigger value="task2" className="rounded-xl px-8 data-[state=active]:bg-amber-500 data-[state=active]:text-black font-bold">
              Task 2
            </TabsTrigger>
          </TabsList>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Prompt & Stats */}
            <div className="space-y-6">
              <Card className="bg-[#0a0f1d] border-white/5 p-8 rounded-[32px] space-y-4 shadow-2xl">
                <h3 className="text-amber-500 font-black uppercase text-xs tracking-widest">{task.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed font-medium italic">
                  &quot;{task.prompt}&quot;
                </p>
                <div className="pt-4 border-t border-white/5 flex items-start gap-3">
                   <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                     Spend about {task.timeLimit} minutes on this task. You should write at least {task.minWords} words.
                   </p>
                </div>
              </Card>

              <Card className="bg-[#0a0f1d] border-white/5 p-8 rounded-[32px] shadow-2xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl" />
                 <div className="flex justify-between items-end mb-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Word Count</p>
                      <h4 className="text-4xl font-black text-white">{wordCount}</h4>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Target</p>
                       <p className="text-lg font-bold text-gray-400">{task.minWords}</p>
                    </div>
                 </div>
                 <Progress value={(wordCount / task.minWords) * 100} className="h-2 bg-black border border-white/5" />
                 <p className="mt-4 text-[10px] text-gray-500 font-medium">
                   {wordCount >= task.minWords 
                     ? '✅ Minimum requirement met' 
                     : `Write ${task.minWords - wordCount} more words to reach minimum`}
                 </p>
              </Card>
            </div>

            {/* Right: Editor or Report */}
            <div className="lg:col-span-2">
              {showReport ? (
                <Card className="bg-[#0a0f1d] border-amber-500/20 p-10 rounded-[40px] shadow-2xl border-2 space-y-10 animate-in fade-in zoom-in duration-500">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                      <BarChart3 className="w-10 h-10 text-amber-500" />
                    </div>
                    <h3 className="text-3xl font-black text-white">AI Evaluation Report</h3>
                    <p className="text-gray-500">Estimated Band Score</p>
                    <div className="text-7xl font-black text-amber-500 tracking-tighter">7.0</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { l: 'Task Response', v: '7.5', c: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' },
                      { l: 'Coherence & Cohesion', v: '6.5', c: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
                      { l: 'Lexical Resource', v: '7.0', c: 'bg-amber-500/10 border-amber-500/20 text-amber-500' },
                      { l: 'Grammatical Range', v: '7.0', c: 'bg-purple-500/10 border-purple-500/20 text-purple-500' },
                    ].map((item, i) => (
                      <div key={i} className={`p-6 rounded-3xl border ${item.c} flex justify-between items-center`}>
                        <span className="font-bold text-sm uppercase tracking-tighter">{item.l}</span>
                        <span className="text-2xl font-black">{item.v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      Key Improvement areas
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl text-sm text-gray-400 leading-relaxed">
                        <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        Use more varied transition signals to improve coherence score.
                      </li>
                      <li className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl text-sm text-gray-400 leading-relaxed">
                        <ChevronRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        Consider using more academic synonyms for common verbs like &quot;think&quot; or &quot;say&quot;.
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setShowReport(false)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black h-14 rounded-2xl"
                    >
                      Back to Editor
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleTabChange(activeTask)}
                      className="flex-1 border-white/10 text-white h-14 rounded-2xl font-black"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" /> Try Another
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="bg-[#0a0f1d] border-white/5 p-8 rounded-[40px] shadow-2xl min-h-[500px] flex flex-col">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start typing your essay here..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-300 leading-relaxed text-lg resize-none placeholder:text-gray-700 font-medium"
                    disabled={!isActive && timeLeft > 0}
                  />
                  <div className="pt-8 flex justify-between items-center border-t border-white/5">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                      <Type className="w-4 h-4" />
                      Auto-save enabled
                    </div>
                    <Button 
                      onClick={handleSubmit}
                      disabled={!text.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 h-14 rounded-2xl shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                    >
                      Submit Evaluation <Send className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
