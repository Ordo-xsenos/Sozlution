'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Target, TrendingUp, Calendar, Zap } from 'lucide-react'

export default function IeltsProgress() {
  const stats = [
    { label: 'Writing Tasks Done', value: '12', target: '20', icon: Zap, color: 'text-amber-500' },
    { label: 'Reading Accuracy', value: '78%', target: '85%', icon: Target, color: 'text-blue-500' },
    { label: 'Words Mastered', value: '450', target: '1000', icon: Trophy, color: 'text-emerald-500' },
  ]

  return (
    <div className="min-h-screen bg-[#050810] text-white p-4 md:p-10 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-amber-500 flex items-center gap-3">
          <TrendingUp className="w-8 h-8" />
          IELTS Progress
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <Card key={i} className="bg-[#0a0f1d] border-white/5 p-8 rounded-[32px] space-y-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{s.label}</p>
                <p className="text-3xl font-black text-white">{s.value}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                <span>Progress</span>
                <span>Goal: {s.target}</span>
              </div>
              <Progress value={45} className="h-1.5 bg-black" />
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-[#0a0f1d] border-white/5 p-10 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6">
         <Calendar className="w-16 h-16 text-amber-500/20" />
         <h3 className="text-2xl font-bold">Activity Heatmap</h3>
         <p className="text-gray-500 max-w-md italic">
           Historical data will appear here once you complete more daily academic tasks.
         </p>
         <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-sm ${i % 5 === 0 ? 'bg-amber-500/40' : 'bg-white/5'}`} />
            ))}
         </div>
      </Card>
    </div>
  )
}
